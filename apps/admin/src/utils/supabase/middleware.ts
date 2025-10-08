import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getCookieDomainFromUrl } from '@repo/utils'
import { addBreadcrumb } from '@sentry/nextjs'
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

  const isProduction = env.ENVIRONMENT === 'production'
  const cookieDomain = isProduction ? getCookieDomainFromUrl(env.ADMIN_BASE_URL) : undefined

  addBreadcrumb({
    message: `Creating server client`,
    level: 'info',
    category: 'supabase',
    data: {
      isProduction,
      cookieDomain,
    }
  })

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
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, {
            ...options,
            domain: cookieDomain,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
          })
        )
      },
    },
  })

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  await supabase.auth.getUser()

  return supabaseResponse
}

// Docs: https://supabase.com/docs/guides/auth/server-side/nextjs
