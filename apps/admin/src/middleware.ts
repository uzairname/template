import { updateSession } from '@/utils/supabase/middleware'
import { captureMessage } from '@sentry/nextjs'
import { type NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {
  console.log('Middleware invoked for:', request.nextUrl.pathname)
  const response = await updateSession(request)
  captureMessage(`${request.method} ${request.nextUrl.pathname}`)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

// from docs: https://supabase.com/docs/guides/auth/server-side/nextjs
