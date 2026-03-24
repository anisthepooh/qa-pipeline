export const runtime = 'nodejs'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { runAllTests } from '@/runner/runTest'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { config, stories, geminiApiKey } = await req.json()

  if (!config?.url || !stories?.length) {
    return NextResponse.json({ error: 'config.url and stories are required' }, { status: 400 })
  }
  const resolvedApiKey = geminiApiKey || process.env.GEMINI_API_KEY
  if (!resolvedApiKey) {
    return NextResponse.json({ error: 'Gemini API key is not set. Add it in Settings.' }, { status: 500 })
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
        const result = await runAllTests(config, stories, send, resolvedApiKey)

        // Save to PocketBase
        try {
          const adminPb = await getPbAdmin()
          const record = await adminPb.collection('runs').create({
            user: userId,
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
