@@
 import { type NextRequest } from 'next/server'
 import { updateSession } from '@/lib/supabase/middleware'
 import { NextResponse } from 'next/server'

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
  return await updateSession(request)
  const res = await updateSession(request)

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!(await isAdmin(request))) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return res
 }
