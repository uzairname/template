import { getCloudflareContext } from '@opennextjs/cloudflare'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {

  
  // return createBrowserClient(
  //   env.SUPABASE_URL,
  //   env.SUPABASE_PUBLISHABLE_KEY
  // )

    return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
