import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  ACCESS_COOKIE_NAME,
  DEFAULT_ACCESS_CODE,
  getAccessCookieValue,
} from '@/lib/access-gate'

export async function middleware(request: NextRequest) {
  const accessCode = process.env.SITE_ACCESS_CODE || DEFAULT_ACCESS_CODE
  const expectedCookieValue = getAccessCookieValue(accessCode)
  const { pathname, searchParams } = request.nextUrl

  // 1. Check for instant unlock via URL magic query parameter (?access=... or ?key=...)
  const queryCode = searchParams.get('access') || searchParams.get('key')
  if (queryCode && queryCode === accessCode) {
    const cleanUrl = request.nextUrl.clone()
    cleanUrl.searchParams.delete('access')
    cleanUrl.searchParams.delete('key')

    const response = NextResponse.redirect(cleanUrl)
    response.cookies.set(ACCESS_COOKIE_NAME, expectedCookieValue, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  }

  // 2. Allow access-gate page, auth callback, and API webhook routes without gatekeeping
  const isAccessGateRoute = pathname === '/access-gate'
  const isAuthCallback = pathname.startsWith('/auth/callback')
  const isApiRoute = pathname.startsWith('/api')

  if (isApiRoute) {
    return NextResponse.next()
  }

  const currentCookie = request.cookies.get(ACCESS_COOKIE_NAME)?.value
  const hasAccess = currentCookie === expectedCookieValue

  if (isAccessGateRoute) {
    // If user already has valid access, redirect from gate to home
    if (hasAccess) {
      const homeUrl = request.nextUrl.clone()
      homeUrl.pathname = '/'
      return NextResponse.redirect(homeUrl)
    }
    return NextResponse.next()
  }

  if (isAuthCallback) {
    return NextResponse.next()
  }

  // 3. If access is not granted, redirect to /access-gate
  if (!hasAccess) {
    const gateUrl = request.nextUrl.clone()
    gateUrl.pathname = '/access-gate'
    if (pathname !== '/') {
      gateUrl.searchParams.set('returnTo', pathname)
    }
    return NextResponse.redirect(gateUrl)
  }

  // 4. Access is granted: proceed with Supabase auth session handling
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (inbound webhooks, external callers)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images & public static files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
