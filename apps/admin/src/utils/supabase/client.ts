import { nonNullable } from '@repo/utils/utils'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_URL, 'NEXT_PUBLIC_SUPABASE_URL'),
    nonNullable(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
  )
}
