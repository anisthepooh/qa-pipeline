export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { runAllTests, AIProvider } from '@/runner/runTest'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { config, stories, projectId, aiProvider, geminiApiKey, openrouterApiKey, openrouterModel } = await req.json()

  if (!config?.url || !stories?.length) {
    return NextResponse.json({ error: 'config.url and stories are required' }, { status: 400 })
  }

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
      return NextResponse.json(
        { error: 'OpenRouter API key is not set. Add it in Settings.' },
        { status: 400 }
      )
    }
    provider = { provider: 'openrouter', apiKey: resolvedKey, model: openrouterModel || 'google/gemini-2.5-flash' }
  } else {
    return NextResponse.json({ error: `Unknown AI provider: ${aiProvider}` }, { status: 400 })
  }

  if (stories.length > 15) {
    return NextResponse.json({ error: 'Maximum 15 stories per run' }, { status: 400 })
  }

  const userId = pb.authStore.model?.id

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const result = await runAllTests(config, stories, send, provider)

        // Save to PocketBase
        try {
          const adminPb = await getPbAdmin()
          const record = await adminPb.collection('runs').create({
            user: userId,
            project: projectId || config.projectId || undefined,
            name: result.run.name,
            url: result.run.url,
            tester: result.run.tester,
            date: result.run.date,
            summary: result.summary,
            test_cases: result.test_cases,
            findings: result.findings,
            categories: config.categories || [],
          })
          send({ type: 'complete', result: { ...result, id: record.id } })
        } catch {
          // Save failed but run succeeded — still return result without id
          send({ type: 'complete', result })
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        send({ type: 'error', message: msg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
