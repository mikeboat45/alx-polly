
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import { csrfProtection } from '@/lib/csrf-protection'

async function isAdmin(request: NextRequest) {
  // Lightweight check using the Supabase session cookie already parsed in updateSession
  // We re-create the server client here to read the user with app_metadata.
  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    },
  )
  const { data } = await supabase.auth.getUser()
  const role = (data.user?.app_metadata as any)?.role
  return role === 'admin'
}
 
export async function middleware(request: NextRequest) {
  const res = await updateSession(request)

  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!(await isAdmin(request))) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  // CSRF protection for non-GET requests
  // Skip for API routes that might use their own protection or for authentication endpoints
  const skipCSRFCheck = [
    '/api/auth',
    '/_next',
    '/favicon.ico',
  ].some(path => request.nextUrl.pathname.startsWith(path))

  if (!skipCSRFCheck && !['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    if (!csrfProtection(request)) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    }
  }

  return res
}
