import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuth = !!token

  if (pathname.startsWith('/dashboard')) {
    if (!isAuth) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  if (
    pathname.startsWith('/api/health-records') ||
    pathname.startsWith('/api/appointments') ||
    pathname.startsWith('/api/medications') ||
    pathname.startsWith('/api/documents') ||
    pathname.startsWith('/api/dashboard') ||
    pathname.startsWith('/api/ai')
  ) {
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if ((pathname === '/login' || pathname === '/register') && isAuth) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/health-records/:path*',
    '/api/appointments/:path*',
    '/api/medications/:path*',
    '/api/documents/:path*',
    '/api/dashboard',
    '/api/ai/:path*',
    '/login',
    '/register',
  ],
}
