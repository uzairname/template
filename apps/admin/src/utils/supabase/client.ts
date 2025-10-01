import { createBrowserClient } from '@supabase/ssr'

export function createClient() {

  const [url, key] = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ]

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables'
    )
  }

  return createBrowserClient(
    url,
    key
  )
}
