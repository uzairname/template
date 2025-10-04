import { createServerClient } from '@supabase/ssr'

/**
 * Parse cookies from a cookie header string
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=')
    }
  })

  return cookies
}

/**
 * Create a Supabase server client from request and environment
 * Note: This is read-only for sessions in the API context - cookie setting is not supported
 */
export function createSupabaseClient(req: Request, env: CloudflareEnv) {
  const cookieHeader = req.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)

  return createServerClient(env.SUPABASE_PUBLIC_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return Object.entries(cookies).map(([name, value]) => ({ name, value }))
      },
      setAll() {
        // No-op: API context cannot set cookies
      },
    },
  })
}
