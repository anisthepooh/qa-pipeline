import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminPb = await getPbAdmin()
    const records = await adminPb.collection('runs').getList(1, 200, {
      sort: '-created',
    })
    return NextResponse.json(records.items.map(r => ({
      id: r.id,
      name: r.name,
      url: r.url,
      date: r.date,
      summary: r.summary,
    })))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[GET /api/runs]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await req.json()
    const userId = pb.authStore.model?.id
    const adminPb = await getPbAdmin()

    const record = await adminPb.collection('runs').create({
      user: userId,
      name: data.run?.name || 'Unnamed run',
      url: data.run?.url || '',
      tester: data.run?.tester || '',
      date: data.run?.date || new Date().toISOString(),
      summary: data.summary || {},
      test_cases: data.test_cases || [],
      findings: data.findings || [],
      categories: data.categories || [],
    })
    return NextResponse.json({ id: record.id })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
