import { nonNullable } from '@repo/utils/utils'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  console.log(`[Frontend] Environment: ${process.env.NEXT_PUBLIC_ENVIRONMENT}`)
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
        sameSite: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 'none' : 'lax', // 'none' for cross-site cookies in production (with HTTPS), 'lax' for local dev
        secure: process.env.NEXT_PUBLIC_ENVIRONMENT === 'production', // Only send cookies over HTTPS in production
      },
    }
  )
}
