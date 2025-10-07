import { nonNullable } from '@repo/utils/utils'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookieOptions: {
        domain:
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
            ? '.uzairname.org' // Shared domain for Cloudflare Workers subdomains
            : 'localhost', // For local development
        path: '/',
        sameSite: 'lax',
        secure: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production', // HTTPS only in production
      },
    }
  )
}
