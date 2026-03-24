import { NextRequest, NextResponse } from 'next/server'

const PROTECTED = ['/setup', '/report', '/findings', '/jira', '/past-runs']
const AUTH_PAGES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get('pb_auth')?.value
  const isAuthenticated = !!(cookie && cookie !== '')

  const pathname = req.nextUrl.pathname
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  const isAuthPage = AUTH_PAGES.some(p => pathname.startsWith(p))

  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL('/setup', req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
