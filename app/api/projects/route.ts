import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = pb.authStore.model?.id
    const adminPb = await getPbAdmin()
    const records = await adminPb.collection('projects').getList(1, 200, {
      filter: `user = "${userId}"`,
      sort: '-created',
    })
    return NextResponse.json(records.items.map(r => ({
      id: r.id,
      name: r.name,
      url: r.url,
      description: r.description || '',
      color: r.color ?? 0,
      created: r.created,
      updated: r.updated,
    })))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[GET /api/projects]', err)
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
    const bodyPromise = req.json()
    const adminPbPromise = getPbAdmin()
    const { name, url, description } = await bodyPromise
    if (!name?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'name and url are required' }, { status: 400 })
    }

    const userId = pb.authStore.model?.id
    const adminPb = await adminPbPromise
    const record = await adminPb.collection('projects').create({
      user: userId,
      name: name.trim(),
      url: url.trim(),
      description: description?.trim() || '',
    })
    return NextResponse.json({
      id: record.id,
      name: record.name,
      url: record.url,
      description: record.description || '',
      color: record.color ?? 0,
      created: record.created,
      updated: record.updated,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[POST /api/projects]', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
