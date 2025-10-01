import { initTRPC} from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { createServerClient } from '@supabase/ssr'

// Define the shape of your Cloudflare environment

export async function createContext(opts: FetchCreateContextFnOptions & { env: CloudflareEnv }) {
  
  // Parse cookies from the request
  const cookieHeader = opts.req.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  
    // Create Supabase client with cookies
  const supabase = createServerClient(
    opts.env.SUPABASE_URL,
    opts.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return Object.entries(cookies).map(([name, value]) => ({ name, value }))
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          // In API context, we can't set cookies directly
          // This is mainly for reading session
        },
      },
    }
  )

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession()

  return {
    env: opts.env,
    session,
    supabase
  }
}

// Helper function to parse cookies from cookie header string
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=')
    }
  })
  
  return cookies
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
