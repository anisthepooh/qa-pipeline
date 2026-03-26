import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)
  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const adminPb = await getPbAdmin()
    const list = await adminPb.collection('user_credentials').getList(1, 1, {
      filter: `project = "${id}"`,
    })
    const record = list.items[0] ?? null
    if (!record) return NextResponse.json(null)
    return NextResponse.json({
      id: record.id,
      project: record.project,
      username: record.username || '',
      email: record.email || '',
      password: record.password || '',
      created: record.created,
      updated: record.updated,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)
  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [{ id }, body] = await Promise.all([params, req.json()])
    const { username, email, password } = body
    const adminPb = await getPbAdmin()

    const list = await adminPb.collection('user_credentials').getList(1, 1, {
      filter: `project = "${id}"`,
    })
    const existing = list.items[0]

    const data = {
      project: id,
      ...(username !== undefined && { username: username.trim() }),
      ...(email !== undefined && { email: email.trim() }),
      ...(password && { password }),
    }

    const record = existing
      ? await adminPb.collection('user_credentials').update(existing.id, data)
      : await adminPb.collection('user_credentials').create(data)

    return NextResponse.json({
      id: record.id,
      project: record.project,
      username: record.username || '',
      email: record.email || '',
      password: record.password || '',
      created: record.created,
      updated: record.updated,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
