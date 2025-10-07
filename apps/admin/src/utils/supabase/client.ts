import { nonNullable } from '@repo/utils/utils'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const isProduction = process.env.NODE_ENV === 'production'

  return createBrowserClient(
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return document.cookie.split(';').map((cookie) => {
            const [name, ...value] = cookie.trim().split('=')
            return { name: name || '', value: value.join('=') || '' }
          })
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // For production: set cookies on parent domain to work across subdomains
            const domain = isProduction ? '.uzairname.org' : options?.domain
            const sameSite = isProduction ? 'none' : options?.sameSite || 'lax'
            const secure = isProduction ? true : options?.secure

            let cookieString = `${name}=${value}`
            if (domain) cookieString += `; domain=${domain}`
            if (options?.path) cookieString += `; path=${options.path}`
            if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
            if (sameSite) cookieString += `; samesite=${sameSite}`
            if (secure) cookieString += `; secure`

            document.cookie = cookieString
          })
        },
      },
    }
  )
}
