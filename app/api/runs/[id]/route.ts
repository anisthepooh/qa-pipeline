import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie } from '@/lib/pocketbase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const r = await pb.collection('runs').getOne(id, { expand: 'stories' })
    return NextResponse.json({
      id: r.id,
      projectId: r.project || undefined,
      run: { name: r.name, url: r.url, tester: r.tester, date: r.date },
      summary: r.summary,
      test_cases: r.test_cases || [],
      findings: r.findings || [],
      stories: (r.expand?.stories ?? []).map((s: { id: string; title: string; body: string }) => ({
        id: s.id,
        title: s.title,
        body: s.body,
      })),
      categories: r.categories || [],
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await pb.collection('runs').delete(id)
    return NextResponse.json({ deleted: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
