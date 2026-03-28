export const runtime = 'nodejs'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'
import { performLogin, AIProvider } from '@/runner/runTest'
import { LoginCredentials } from '@/types'

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { projectId, url, aiProvider, geminiApiKey, openrouterApiKey, openrouterModel } = await req.json()

  if (!projectId || !url) {
    return NextResponse.json({ error: 'projectId and url are required' }, { status: 400 })
  }

  // Resolve AI provider
  let provider: AIProvider
  if (!aiProvider || aiProvider === 'gemini') {
    const resolvedKey = geminiApiKey || process.env.GEMINI_API_KEY
    if (!resolvedKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not set. Add it in Settings or set GEMINI_API_KEY on the server.' },
        { status: 400 }
      )
    }
    provider = { provider: 'gemini', apiKey: resolvedKey }
  } else if (aiProvider === 'openrouter') {
    const resolvedKey = openrouterApiKey || process.env.OPENROUTER_API_KEY
    if (!resolvedKey) {
      return NextResponse.json({ error: 'OpenRouter API key is not set. Add it in Settings.' }, { status: 400 })
    }
    provider = { provider: 'openrouter', apiKey: resolvedKey, model: openrouterModel || 'google/gemini-2.5-flash' }
  } else {
    return NextResponse.json({ error: `Unknown AI provider: ${aiProvider}` }, { status: 400 })
  }

  // Fetch credentials from PocketBase
  let credentials: LoginCredentials | undefined
  try {
    const adminPb = await getPbAdmin()
    const list = await adminPb.collection('user_credentials').getList(1, 1, {
      filter: `project = "${projectId}"`,
    })
    const cred = list.items[0]
    if (cred?.password) {
      credentials = {
        email: cred.email || undefined,
        username: cred.username || undefined,
        password: cred.password,
      }
    }
  } catch {
    return NextResponse.json({ error: 'Failed to fetch credentials' }, { status: 500 })
  }

  if (!credentials) {
    return NextResponse.json({ error: 'No credentials configured for this project' }, { status: 400 })
  }

  // Launch browser and test login
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--ignore-certificate-errors', '--ignore-ssl-errors'],
  })
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 800 },
  })

  try {
    const result = await performLogin(context, url, credentials, provider, () => {})
    return NextResponse.json(result)
  } finally {
    await context.close()
    await browser.close()
  }
}
