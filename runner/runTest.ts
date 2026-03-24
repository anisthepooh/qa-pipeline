import { chromium } from 'playwright'
import { GoogleGenAI } from '@google/genai'
import { Config, Story, TestCase, Finding } from '@/types'


interface Step {
  type: 'navigate' | 'click' | 'fill'
  target?: string
  text?: string
  value?: string
  field?: string
  raw: string
}

function parseSteps(body: string): Step[] {
  if (!body) return []
  const steps: Step[] = []
  for (const raw of body.split('\n')) {
    const line = raw.replace(/^\s*\d+[\.\)]\s*/, '').trim()
    if (!line) continue

    if (/^navigate to\s+(\S+)/i.test(line)) {
      steps.push({ type: 'navigate', target: line.match(/^navigate to\s+(\S+)/i)![1], raw: line })
    } else if (/^click\s+['"](.+?)['"]/i.test(line)) {
      steps.push({ type: 'click', text: line.match(/^click\s+['"](.+?)['"]/i)![1], raw: line })
    } else if (/^click\s+(.+)/i.test(line)) {
      steps.push({ type: 'click', text: line.match(/^click\s+(.+)/i)![1].replace(/button|link|on\s+/gi, '').trim(), raw: line })
    } else if (/^(enter|type|fill)\s+['"]?(.+?)['"]?\s+(in|into|on)\s+/i.test(line)) {
      const m = line.match(/^(?:enter|type|fill)\s+['"]?(.+?)['"]?\s+(?:in|into|on)\s+(.+)/i)
      if (m) steps.push({ type: 'fill', value: m[1], field: m[2], raw: line })
    }
  }
  return steps
}

async function runTestCase(
  page: import('playwright').Page,
  tcId: string,
  story: Story,
  config: Config,
  ai: GoogleGenAI
): Promise<{ tc: TestCase; findings: Omit<Finding, 'id'>[] }> {
  const consoleErrors: string[] = []
  const networkErrors: string[] = []
  const screenshots: { label: string; data: string }[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('response', res => {
    if (res.status() >= 400) networkErrors.push(`${res.status()} ${res.url()}`)
  })

  console.log(`[${tcId}] Navigating to ${config.url}`)
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(500)

  const snap = async (label: string) => {
    const buf = await page.screenshot({ fullPage: false })
    screenshots.push({ label, data: buf.toString('base64') })
  }

  await snap('Initial page load')

  const steps = parseSteps(story.body)
  for (const step of steps) {
    try {
      if (step.type === 'navigate' && step.target) {
        const url = /^https?:\/\//i.test(step.target)
          ? step.target
          : config.url.replace(/\/+$/, '') + (step.target.startsWith('/') ? '' : '/') + step.target
        console.log(`[${tcId}] Navigate to ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(400)
        await snap(`After: ${step.raw}`)
      } else if (step.type === 'click' && step.text) {
        await page.getByText(step.text, { exact: false }).first().click({ timeout: 5000 })
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})
        await snap(`After: ${step.raw}`)
      } else if (step.type === 'fill' && step.value) {
        const input = page.locator('input').first()
        await input.fill(step.value, { timeout: 5000 })
      }
    } catch {
      // Step failed silently — continue
    }
  }

  const finalBuf = await page.screenshot({ fullPage: true })
  screenshots.push({ label: 'Final state', data: finalBuf.toString('base64') })

  const dom = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    url: window.location.href,
    h1Count: document.querySelectorAll('h1').length,
    h2Count: document.querySelectorAll('h2').length,
    imagesWithoutAlt: document.querySelectorAll('img:not([alt])').length,
    inputsWithoutLabel: Array.from(document.querySelectorAll('input:not([type=hidden])')).filter(el => {
      const input = el as HTMLInputElement
      return !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby') &&
             !(input.id && document.querySelector(`label[for="${input.id}"]`))
    }).length,
    hasMain: !!document.querySelector('main'),
    viewportMeta: document.querySelector('meta[name=viewport]')?.getAttribute('content') || '',
    linkCount: document.querySelectorAll('a[href]').length,
  })).catch(() => ({}))

  const relevantShots = screenshots.length <= 3
    ? screenshots
    : [screenshots[0], screenshots[Math.floor(screenshots.length / 2)], screenshots[screenshots.length - 1]]

  const categoryMap: Record<string, string> = {
    flow: 'user_flow_validity',
    deadend: 'dead_ends',
    bugs: 'bugs_and_failures',
    ux: 'ux_best_practices',
    design: 'design_cohesion',
    a11y: 'accessibility',
  }
  const categories = (config.categories || []).map(c => categoryMap[c] || c).join(', ')

  const prompt = `You are a QA engineer running an automated frontend test.

Test case: ${tcId} — ${story.title}
Story:
${story.body}

Target URL: ${config.url}
DOM snapshot: ${JSON.stringify(dom, null, 2)}
Console errors: ${consoleErrors.length ? consoleErrors.slice(0, 10).join('\n') : 'none'}
Network errors: ${networkErrors.length ? networkErrors.slice(0, 10).join('\n') : 'none'}
Categories to evaluate: ${categories}

The screenshots above show the app state during this test. Analyse thoroughly and return ONLY valid JSON with no prose, no markdown fences:
{
  "status": "PASS",
  "actual_outcome": "concise description of what was observed",
  "findings": [
    {
      "title": "short imperative title",
      "severity": "critical|high|medium|low",
      "category": "bugs_and_failures|accessibility|ux_best_practices|design_cohesion|dead_ends|user_flow_validity",
      "description": "2-3 factual sentences",
      "location": "url path or element",
      "evidence": "what was observed in DOM or screenshot",
      "expected": "what should happen",
      "actual": "what does happen"
    }
  ]
}

status must be PASS, FAIL, or PARTIAL.`

  const parts: { inlineData?: { mimeType: string; data: string }; text?: string }[] = []
  for (const ss of relevantShots) {
    parts.push({ inlineData: { mimeType: 'image/png', data: ss.data } })
    parts.push({ text: `[Screenshot: ${ss.label}]` })
  }
  parts.push({ text: prompt })

  console.log(`[${tcId}] Sending ${relevantShots.length} screenshots to Gemini…`)
  const geminiResult = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts }],
  })
  console.log(`[${tcId}] Gemini response received`)
  const rawText = (geminiResult.text ?? '').trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '')

  let result: { status?: string; actual_outcome?: string; findings?: Omit<Finding, 'id' | 'tc_id' | 'screenshot_base64'>[] } = {
    status: 'PARTIAL', actual_outcome: 'Analysis complete', findings: [],
  }
  try {
    result = JSON.parse(rawText)
  } catch {
    // Keep defaults
  }

  return {
    tc: {
      id: tcId,
      title: story.title,
      status: (result.status as TestCase['status']) || 'PARTIAL',
      steps_executed: steps.length,
      actual_outcome: result.actual_outcome || '',
      screenshot_base64: screenshots[screenshots.length - 1]?.data || '',
    },
    findings: (result.findings || []).map(f => ({
      tc_id: tcId,
      screenshot_base64: screenshots[screenshots.length - 1]?.data || '',
      ...f,
    })) as Omit<Finding, 'id'>[],
  }
}

export async function runAllTests(
  config: Config,
  stories: Story[],
  onProgress: (event: Record<string, unknown>) => void,
  apiKey: string
) {
  const ai = new GoogleGenAI({ apiKey })
  console.log(`[runAllTests] Launching browser for ${stories.length} stories`)
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors',
    ],
  })
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  })

  const allTcs: TestCase[] = []
  const allFindings: Finding[] = []

  for (const [i, story] of stories.entries()) {
    const tcId = `TC-${String(i + 1).padStart(2, '0')}`
    onProgress({ type: 'test_start', tcId, title: story.title, index: i, total: stories.length })

    const page = await context.newPage()
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Test case timed out after 120s')), 120000)
      )
      const { tc, findings } = await Promise.race([runTestCase(page, tcId, story, config, ai), timeout])

      const numbered: Finding[] = findings.map((f, j) => ({
        id: `F-${String(allFindings.length + j + 1).padStart(2, '0')}`,
        ...f,
      } as Finding))

      allTcs.push(tc)
      allFindings.push(...numbered)

      onProgress({ type: 'test_done', tcId, status: tc.status, findingsCount: findings.length })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      allTcs.push({
        id: tcId, title: story.title, status: 'FAIL',
        steps_executed: 0, actual_outcome: `Runner error: ${msg}`, screenshot_base64: '',
      })
      onProgress({ type: 'test_error', tcId, message: msg })
    } finally {
      await page.close()
    }
  }

  await browser.close()

  const passed = allTcs.filter(t => t.status === 'PASS').length
  const failed = allTcs.filter(t => t.status === 'FAIL').length
  const partial = allTcs.filter(t => t.status === 'PARTIAL').length

  return {
    run: {
      name: config.runName || 'Automated run',
      url: config.url,
      tester: config.tester || 'Claude (automated)',
      date: new Date().toISOString(),
    },
    summary: {
      passed, failed, partial,
      total_findings: allFindings.length,
      by_severity: {
        critical: allFindings.filter(f => f.severity === 'critical').length,
        high: allFindings.filter(f => f.severity === 'high').length,
        medium: allFindings.filter(f => f.severity === 'medium').length,
        low: allFindings.filter(f => f.severity === 'low').length,
      },
    },
    test_cases: allTcs,
    findings: allFindings,
  }
}
