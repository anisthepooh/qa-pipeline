import PocketBase from 'pocketbase'

// Client-side singleton (browser)
let _pb: PocketBase | null = null

export function getPb(): PocketBase {
  if (typeof window === 'undefined') {
    // Server-side: always create a new instance
    return new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')
  }
  if (!_pb) {
    _pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')
    // Auto-load auth from cookie/localStorage
    _pb.authStore.loadFromCookie(document.cookie)
    _pb.authStore.onChange(() => {
      document.cookie = _pb!.authStore.exportToCookie({ httpOnly: false, sameSite: 'Lax' })
    })
  }
  return _pb
}

// Server-side admin client for Route Handlers
export async function getPbAdmin(): Promise<PocketBase> {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')
  await pb.admins.authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  )
  return pb
}

// Server-side: load PocketBase from request cookie for user-scoped operations
export function getPbFromCookie(cookie: string): PocketBase {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090')
  pb.authStore.loadFromCookie(cookie)
  return pb
}
