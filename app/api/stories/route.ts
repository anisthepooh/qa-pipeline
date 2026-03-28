import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const projectId = req.nextUrl.searchParams.get('projectId')
    const userId = pb.authStore.model?.id
    const adminPb = await getPbAdmin()

    const filter = projectId
      ? `user = "${userId}" && project = "${projectId}"`
      : `user = "${userId}"`

    const records = await adminPb.collection('stories').getList(1, 200, {
      filter,
      sort: '-created',
    })

    return NextResponse.json(records.items.map(r => ({
      id: r.id,
      title: r.title,
      body: r.body,
    })))
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
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
    const { title, body, projectId } = await req.json()
    if (!title?.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    const userId = pb.authStore.model?.id
    const adminPb = await getPbAdmin()

    const record = await adminPb.collection('stories').create({
      user: userId,
      project: projectId || undefined,
      title: title.trim(),
      body: (body ?? '').trim(),
    })

    return NextResponse.json({ id: record.id, title: record.title, body: record.body })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
