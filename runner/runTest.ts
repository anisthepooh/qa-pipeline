import { chromium } from 'playwright'
import { Config, Story, TestCase, Finding, LoginCredentials } from '@/types'
import { buildStepPrompt } from '@/lib/promptBuilder'
import { getDomContext, callAI, performLogin } from './login'

export type AIProvider =
  | { provider: 'gemini'; apiKey: string }
  | { provider: 'openrouter'; apiKey: string; model: string }

export { performLogin }

const MAX_STEPS = 15

interface AgentAction {
  action: 'navigate' | 'click' | 'fill' | 'done'
  url?: string
  selector?: string
  value?: string
  reason?: string
  // returned with action === 'done'
  status?: string
  actual_outcome?: string
  findings?: Omit<Finding, 'id' | 'tc_id' | 'screenshot_base64'>[]
}


async function runTestCase(
  page: import('playwright').Page,
  tcId: string,
  story: Story,
  config: Config,
  provider: AIProvider,
  onStep: (reason: string) => void
): Promise<{ tc: TestCase; findings: Omit<Finding, 'id'>[] }> {
  const consoleErrors: string[] = []
  const networkErrors: string[] = []
  const screenshots: { label: string; data: string }[] = []
  const actionHistory: string[] = []

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('response', res => {
    if (res.status() >= 400) networkErrors.push(`${res.status()} ${res.url()}`)
  })

  const snap = async (label: string) => {
    const buf = await page.screenshot({ fullPage: false })
    const data = buf.toString('base64')
    screenshots.push({ label, data })
    return data
  }

  console.log(`[${tcId}] Navigating to ${config.url}`)
  await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(500)

  for (let step = 0; step < MAX_STEPS; step++) {
    const screenshotData = await snap(`Step ${step + 1}`)
    const dom = await getDomContext(page)

    const stepPrompt = buildStepPrompt(tcId, story, config, dom, consoleErrors, networkErrors, actionHistory)

    const rawText = (await callAI(provider, screenshotData, stepPrompt))
      .replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
    let parsed: AgentAction = { action: 'done', status: 'PARTIAL', actual_outcome: 'Could not parse AI response', findings: [] }
    try {
      parsed = JSON.parse(rawText)
    } catch {
      // keep fallback
    }

    console.log(`[${tcId}] step=${step + 1} action=${parsed.action} reason=${parsed.reason}`)
    if (parsed.action === 'done') {
      console.log(`[${tcId}] done → status=${parsed.status} outcome=${parsed.actual_outcome}`)
      if (parsed.findings?.length) {
        for (const f of parsed.findings) console.log(`[${tcId}]   finding: [${f.severity}] ${f.title} — ${f.description}`)
      }
    }
    onStep(parsed.reason || parsed.action)

    if (parsed.action === 'done') {
      const lastScreenshot = screenshots[screenshots.length - 1]?.data || ''
      return {
        tc: {
          id: tcId,
          title: story.title,
          status: (parsed.status as TestCase['status']) || 'PARTIAL',
          steps_executed: step + 1,
          actual_outcome: parsed.actual_outcome || '',
          screenshot_base64: lastScreenshot,
        },
        findings: (parsed.findings || []).map(f => ({
          tc_id: tcId,
          screenshot_base64: lastScreenshot,
          ...f,
        })) as Omit<Finding, 'id'>[],
      }
    }

    // Execute the action
    actionHistory.push(`${parsed.action}${parsed.selector ? `(${parsed.selector})` : ''}${parsed.value ? `="${parsed.value}"` : ''}`)
    try {
      if (parsed.action === 'navigate' && parsed.url) {
        await page.goto(parsed.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        await page.waitForTimeout(400)
      } else if (parsed.action === 'click' && parsed.selector) {
        const sel = parsed.selector
        // Extract text from Playwright has-text() patterns like button:has-text("Login")
        const hasTextMatch = sel.match(/has-text\(['"](.+?)['"]\)/i)
        const labelText = hasTextMatch?.[1] ?? null

        const clicked = await page.locator(sel).first().click({ timeout: 4000 })
          .then(() => true)
          .catch(() => false)

        if (!clicked) {
          if (labelText) {
            await page.getByRole('button', { name: labelText, exact: false }).first().click({ timeout: 3000 })
              .catch(() => page.getByRole('link', { name: labelText, exact: false }).first().click({ timeout: 3000 }))
              .catch(() => page.getByText(labelText, { exact: false }).first().click({ timeout: 3000 }))
          } else {
            await page.getByText(sel, { exact: false }).first().click({ timeout: 3000 })
          }
        }
        await page.waitForLoadState('networkidle', { timeout: 6000 }).catch(() => {})
        await page.waitForTimeout(300)
      } else if (parsed.action === 'fill' && parsed.selector) {
        const el = page.locator(parsed.selector).first()
        await el.click({ timeout: 5000 })
        await el.fill('', { timeout: 5000 })
        await el.pressSequentially(parsed.value || '', { delay: 30 })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      actionHistory[actionHistory.length - 1] += ` [failed: ${msg.slice(0, 60)}]`
      console.log(`[${tcId}] action failed: ${msg}`)
    }
  }

  // Max steps reached — report what we observed
  const lastScreenshot = screenshots[screenshots.length - 1]?.data || ''
  return {
    tc: {
      id: tcId,
      title: story.title,
      status: 'PARTIAL',
      steps_executed: MAX_STEPS,
      actual_outcome: `Reached ${MAX_STEPS}-step limit. Actions: ${actionHistory.join(' → ')}`,
      screenshot_base64: lastScreenshot,
    },
    findings: [],
  }
}

export async function runAllTests(
  config: Config,
  stories: Story[],
  onProgress: (event: Record<string, unknown>) => void,
  provider: AIProvider,
  credentials?: LoginCredentials
) {
  console.log(`[runAllTests] Launching browser for ${stories.length} stories`)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors'],
  })
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  })

  const allTcs: TestCase[] = []
  const allFindings: Finding[] = []

  // Auto-login — runs once before stories, session shared via browser context
  if (credentials?.password && (credentials.email || credentials.username)) {
    onProgress({ type: 'login_start' })
    const loginResult = await performLogin(context, config.url, credentials, provider, (reason) => {
      onProgress({ type: 'login_step', reason })
    })
    onProgress({ type: 'login_done', ...loginResult })
    if (!loginResult.success) {
      console.warn('[runAllTests] Login step did not complete:', loginResult.failReason)
    }
  }

  for (const [i, story] of stories.entries()) {
    const tcId = `TC-${String(i + 1).padStart(2, '0')}`
    onProgress({ type: 'test_start', tcId, title: story.title, index: i, total: stories.length })

    const page = await context.newPage()
    try {
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Test case timed out after 120s')), 120000)
      )
      const { tc, findings } = await Promise.race([
        runTestCase(page, tcId, story, config, provider, (reason) => {
          onProgress({ type: 'step', tcId, reason })
        }),
        timeout,
      ])

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
