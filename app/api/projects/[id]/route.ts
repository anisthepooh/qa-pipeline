import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [{ id }, adminPb] = await Promise.all([params, getPbAdmin()])
    const [project, runs] = await Promise.all([
      adminPb.collection('projects').getOne(id),
      adminPb.collection('runs').getList(1, 200, {
        filter: `project = "${id}"`,
        sort: '-created',
      }),
    ])
    return NextResponse.json({
      id: project.id,
      name: project.name,
      url: project.url,
      description: project.description || '',
      created: project.created,
      updated: project.updated,
      runs: runs.items.map(r => ({
        id: r.id,
        projectId: r.project || id,
        name: r.name,
        url: r.url,
        date: r.date,
        summary: r.summary,
      })),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [{ id }, { name, url, description }] = await Promise.all([params, req.json()])
    const adminPb = await getPbAdmin()
    const record = await adminPb.collection('projects').update(id, {
      ...(name !== undefined && { name: name.trim() }),
      ...(url !== undefined && { url: url.trim() }),
      ...(description !== undefined && { description: description.trim() }),
    })
    return NextResponse.json({
      id: record.id,
      name: record.name,
      url: record.url,
      description: record.description || '',
      created: record.created,
      updated: record.updated,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const [{ id }, adminPb] = await Promise.all([params, getPbAdmin()])
    await adminPb.collection('projects').delete(id)
    return NextResponse.json({ deleted: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
