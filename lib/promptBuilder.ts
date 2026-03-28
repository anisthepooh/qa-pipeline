import { Config, Story, LoginCredentials } from '@/types'

const CATEGORY_MAP: Record<string, string> = {
  flow: 'user_flow_validity',
  deadend: 'dead_ends',
  bugs: 'bugs_and_failures',
  ux: 'ux_best_practices',
  design: 'design_cohesion',
  a11y: 'accessibility',
}

const categoryLabels: Record<string, string> = {
  flow: 'User flow validity (can the user complete the intended action?)',
  deadend: 'Dead-ends (pages with no forward path, error states with no recovery)',
  bugs: 'Bugs & failures (console errors, broken elements, network failures)',
  ux: 'UX best practices (feedback after actions, clear CTAs, friction points)',
  design: 'Design cohesion (typography, color, spacing, iconography consistency)',
  a11y: 'Accessibility (alt text, labels, contrast, focus states, heading hierarchy)',
}

export function buildPrompt(config: Config, stories: Story[]): string {
  const { url, runName, tester, categories } = config
  const date = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const storyText = stories
    .map((s, i) => {
      const id = `TC-${String(i + 1).padStart(2, '0')}`
      return `### ${id}: ${s.title}\n${s.body}`
    })
    .join('\n\n')

  const catText = categories
    .map(c => `- ${categoryLabels[c] || c}`)
    .join('\n')

  return `You are running a structured frontend QA pipeline.

Run name: ${runName}
Target URL: ${url}
Tester: ${tester}
Date: ${date}

## USER STORIES

${storyText}

## CATEGORIES TO EVALUATE
${catText}

Return ONLY raw JSON. No markdown, no prose.`
}

export function buildStepPrompt(
  tcId: string,
  story: Story,
  config: Config,
  dom: Record<string, unknown>,
  consoleErrors: string[],
  networkErrors: string[],
  actionHistory: string[],
): string {
  const categories = (config.categories || []).map(c => CATEGORY_MAP[c] || c).join(', ')

  return `You are a QA engineer controlling a browser via Playwright to test a user story.

Story: ${tcId} — ${story.title}
Goal:
${story.body}

Current state:
  URL: ${dom.url}
  Title: ${dom.title}
  Inputs: ${JSON.stringify(dom.inputs)}
  Buttons: ${JSON.stringify(dom.buttons)}
  Links: ${JSON.stringify(dom.links)}
  Console errors: ${consoleErrors.slice(-5).join(' | ') || 'none'}
  Network errors (4xx/5xx): ${networkErrors.slice(-5).join(' | ') || 'none'}

Actions taken so far: ${actionHistory.length ? actionHistory.join(' → ') : 'none'}
Categories to evaluate: ${categories}

Decide the NEXT single action. Return ONLY valid JSON with no prose or markdown:
{
  "action": "navigate" | "click" | "fill" | "done",
  "url": "absolute URL (navigate only)",
  "selector": "CSS selector — prefer #id, [name=x], [type=x], or button:has-text(\\"Label\\") for buttons",
  "value": "text to type (fill only)",
  "reason": "one line explaining why",

  // Include only when action === "done":
  "status": "PASS" | "FAIL" | "PARTIAL",
  "actual_outcome": "concise description of what was observed",
  "findings": [
    {
      "title": "short imperative title",
      "severity": "critical|high|medium|low",
      "category": "bugs_and_failures|accessibility|ux_best_practices|design_cohesion|dead_ends|user_flow_validity",
      "description": "2-3 factual sentences",
      "location": "url path or element",
      "evidence": "what was observed",
      "expected": "what should happen",
      "actual": "what does happen"
    }
  ]
}

Use "done" when the story goal is fully achieved OR when you have enough evidence to evaluate it (success or failure).`
}

export function buildLoginPrompt(
  credentials: LoginCredentials,
  dom: Record<string, unknown>,
  actionHistory: string[]
): string {
  return `You are a browser automation agent. Your ONLY job right now is to log in to the application.

Credentials:
  Email: ${credentials.email || '(not provided)'}
  Username: ${credentials.username || '(not provided)'}
  Password: ${credentials.password || '(not provided)'}

Current state:
  URL: ${dom.url}
  Title: ${dom.title}
  Inputs: ${JSON.stringify(dom.inputs)}
  Buttons: ${JSON.stringify(dom.buttons)}
  Links: ${JSON.stringify(dom.links)}

Actions taken so far: ${actionHistory.length ? actionHistory.join(' → ') : 'none'}

Rules:
- Fill the login form and submit it.
- If you see a dashboard, home page, or any page that is clearly post-login, return done+PASS immediately.
- If a submit button just became disabled but the page has NOT changed and there is no error message, the server is still processing — use action "navigate" with the SAME current URL to refresh and check the result, or simply click the next logical element. Do NOT return done+FAIL just because the button is disabled.
- Only return done+FAIL if you see an explicit error message, a CAPTCHA, MFA challenge, or the same login page after multiple failed attempts.
- Never navigate away from the app origin.
- Return ONLY valid JSON with no prose or markdown.

Return:
{
  "action": "navigate" | "click" | "fill" | "done",
  "url": "absolute URL (navigate only)",
  "selector": "CSS selector — prefer #id, [name=x], [type=x], or button:has-text(\\"Label\\")",
  "value": "text to type (fill only)",
  "reason": "one line explaining why",
  "status": "PASS" | "FAIL" (done only),
  "actual_outcome": "what you observed (done only)"
}`
}
