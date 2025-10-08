import { getCookieDomainFromHostname, isProductionEnvironment, nonNullable } from '@repo/utils'
import { addBreadcrumb } from '@sentry/nextjs'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const isProduction = isProductionEnvironment()
  const cookieDomain = isProduction ? getCookieDomainFromHostname() : undefined

  addBreadcrumb({
    message: `Creating browser client`,
    level: 'info',
    category: 'supabase',
    data: {
      isProduction,
      cookieDomain,
    }
  })

  return createBrowserClient(
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookieOptions: {
        domain: cookieDomain,
        path: '/',
        sameSite: isProduction ? 'none' : 'lax',
        secure: isProduction,
      },
    }
  )
}
