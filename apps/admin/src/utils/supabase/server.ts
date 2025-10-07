import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const { env } = getCloudflareContext()

  return createServerClient(env.SUPABASE_PUBLIC_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // For production: set cookies on parent domain to work across subdomains
            const cookieOptions = {
              ...options,
              domain: env.ENVIRONMENT === 'production' ? '.uzairname.org' : options?.domain,
              sameSite: (env.ENVIRONMENT === 'production' ? 'none' : options?.sameSite) as
                | 'lax'
                | 'strict'
                | 'none'
                | undefined,
              secure: env.ENVIRONMENT === 'production' ? true : options?.secure,
            }
            cookieStore.set(name, value, cookieOptions)
          })
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
