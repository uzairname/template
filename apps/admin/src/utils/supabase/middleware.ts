import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const { env } = getCloudflareContext()

  let supabaseResponse = NextResponse.next({
    request,
  })

  const [url, key] = [env.SUPABASE_PUBLIC_URL, env.SUPABASE_SERVICE_ROLE_KEY]
  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_PUBLIC_URL or SUPABASE_SERVICE_ROLE_KEY environment variables' +
        ` (url: ${url}, key: ${key})`
    )
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => {
          // For production: set cookies on parent domain to work across subdomains
          const isProduction = env.ENVIRONMENT === 'production'
          const cookieOptions = {
            ...options,
            domain: isProduction && request.url.includes('uzairname.org') ? '.uzairname.org' : options?.domain,
            sameSite: (isProduction ? 'none' : options?.sameSite) as
              | 'lax'
              | 'strict'
              | 'none'
              | undefined,
            secure: isProduction ? true : options?.secure,
          }
          
          console.log('[Middleware] Setting cookie:', {
            name,
            domain: cookieOptions.domain,
            sameSite: cookieOptions.sameSite,
            secure: cookieOptions.secure,
            isProduction,
          })
          
          supabaseResponse.cookies.set(name, value, cookieOptions)
        })
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // Debug logging for production
  console.log('[Middleware] Session check:', {
    hasUser: !!user,
    userId: user?.id,
    error: error?.message,
    cookies: request.cookies
      .getAll()
      .map((c) => c.name)
      .join(', '),
  })

  return supabaseResponse
}

// Docs: https://supabase.com/docs/guides/auth/server-side/nextjs
