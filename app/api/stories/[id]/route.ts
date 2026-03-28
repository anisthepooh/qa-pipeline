import { NextRequest, NextResponse } from 'next/server'
import { getPbFromCookie, getPbAdmin } from '@/lib/pocketbase'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookie = req.headers.get('cookie') || ''
  const pb = getPbFromCookie(cookie)

  if (!pb.authStore.isValid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userId = pb.authStore.model?.id
    const adminPb = await getPbAdmin()

    // Verify ownership before deleting
    const record = await adminPb.collection('stories').getOne(id)
    if (record.user !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await adminPb.collection('stories').delete(id)
    return NextResponse.json({ deleted: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
