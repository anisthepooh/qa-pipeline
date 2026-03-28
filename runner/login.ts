import { GoogleGenAI } from '@google/genai'
import { LoginCredentials } from '@/types'
import { buildLoginPrompt } from '@/lib/promptBuilder'
import { AIProvider } from './runTest'

const MAX_LOGIN_STEPS = 8

export async function getDomContext(page: import('playwright').Page): Promise<Record<string, unknown>> {
  return page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input:not([type=hidden])')).slice(0, 20).map(el => {
      const e = el as HTMLInputElement
      return {
        type: e.type,
        name: e.name || undefined,
        id: e.id || undefined,
        placeholder: e.placeholder || undefined,
        ariaLabel: e.getAttribute('aria-label') || undefined,
        filled: e.type === 'password' ? (e.value.length > 0 ? 'yes' : 'no') : (e.value ? 'yes' : 'no'),
      }
    })
    const buttons = Array.from(document.querySelectorAll('button, input[type=submit]')).slice(0, 10).map(el => ({
      text: (el as HTMLElement).innerText?.trim().slice(0, 60) || (el as HTMLInputElement).value,
      type: (el as HTMLButtonElement).type,
      disabled: (el as HTMLButtonElement).disabled,
    }))
    const links = Array.from(document.querySelectorAll('a[href]')).slice(0, 15).map(el => ({
      text: (el as HTMLAnchorElement).innerText?.trim().slice(0, 60),
      href: (el as HTMLAnchorElement).href,
    }))
    return {
      url: window.location.href,
      title: document.title,
      inputs,
      buttons,
      links,
    }
  }).catch(() => ({ url: '', title: '', inputs: [], buttons: [], links: [] }))
}

export async function callAI(provider: AIProvider, screenshotData: string, prompt: string): Promise<string> {
  if (provider.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: provider.apiKey })
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'image/png', data: screenshotData } },
          { text: prompt },
        ],
      }],
    })
    return (result.text ?? '').trim()
  }

  // OpenRouter — OpenAI-compatible vision API
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:image/png;base64,${screenshotData}` } },
          { type: 'text', text: prompt },
        ],
      }],
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`OpenRouter error ${response.status}: ${body.slice(0, 200)}`)
  }

  const json = await response.json()
  return (json.choices?.[0]?.message?.content ?? '').trim()
}

export async function performLogin(
  context: import('playwright').BrowserContext,
  url: string,
  credentials: LoginCredentials,
  provider: AIProvider,
  onStep: (reason: string) => void
): Promise<{ success: boolean; steps: number; screenshotBase64: string; failReason?: string }> {
  const page = await context.newPage()
  const actionHistory: string[] = []
  let lastScreenshot = ''

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 })
    await page.waitForTimeout(500)

    for (let step = 0; step < MAX_LOGIN_STEPS; step++) {
      const buf = await page.screenshot({ fullPage: false })
      lastScreenshot = buf.toString('base64')
      const dom = await getDomContext(page)

      const prompt = buildLoginPrompt(credentials, dom, actionHistory)
      const rawText = (await callAI(provider, lastScreenshot, prompt))
        .replace(/^```json\s*/i, '').replace(/\s*```$/i, '')

      let parsed: { action: string; url?: string; selector?: string; value?: string; reason?: string; status?: string; actual_outcome?: string } = {
        action: 'done', status: 'FAIL', actual_outcome: 'Could not parse AI response',
      }
      try { parsed = JSON.parse(rawText) } catch { /* keep fallback */ }

      console.log(`[login] step=${step + 1} action=${parsed.action} reason=${parsed.reason}`)
      onStep(parsed.reason || parsed.action)

      if (parsed.action === 'done') {
        return {
          success: parsed.status === 'PASS',
          steps: step + 1,
          screenshotBase64: lastScreenshot,
          failReason: parsed.status !== 'PASS' ? (parsed.actual_outcome || 'Login failed') : undefined,
        }
      }

      actionHistory.push(`${parsed.action}${parsed.selector ? `(${parsed.selector})` : ''}${parsed.value ? `="${parsed.value}"` : ''}`)
      try {
        if (parsed.action === 'navigate' && parsed.url) {
          await page.goto(parsed.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
          await page.waitForTimeout(400)
        } else if (parsed.action === 'click' && parsed.selector) {
          const sel = parsed.selector
          const hasTextMatch = sel.match(/has-text\(['"](.+?)['"]\)/i)
          const labelText = hasTextMatch?.[1] ?? null
          const clicked = await page.locator(sel).first().click({ timeout: 4000 })
            .then(() => true).catch(() => false)
          if (!clicked) {
            if (labelText) {
              await page.getByRole('button', { name: labelText, exact: false }).first().click({ timeout: 3000 })
                .catch(() => page.getByRole('link', { name: labelText, exact: false }).first().click({ timeout: 3000 }))
                .catch(() => page.getByText(labelText, { exact: false }).first().click({ timeout: 3000 }))
            } else {
              await page.getByText(sel, { exact: false }).first().click({ timeout: 3000 })
            }
          }
          // Wait for the server redirect after form submission
          const urlBefore = page.url()
          await page.waitForURL(u => u.href !== urlBefore, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        } else if (parsed.action === 'fill' && parsed.selector) {
          const el = page.locator(parsed.selector).first()
          await el.click({ timeout: 5000 })
          await el.fill('', { timeout: 5000 })
          await el.pressSequentially(parsed.value || '', { delay: 30 })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        actionHistory[actionHistory.length - 1] += ` [failed: ${msg.slice(0, 60)}]`
        console.log(`[login] action failed: ${msg}`)
      }
    }

    return { success: false, steps: MAX_LOGIN_STEPS, screenshotBase64: lastScreenshot, failReason: 'Login did not complete within step limit' }
  } finally {
    await page.close()
  }
}
