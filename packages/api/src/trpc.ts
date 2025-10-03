import { createClient, UserRole } from '@repo/db'
import { users } from '@repo/db/schema'
import { createServerClient } from '@supabase/ssr'
import { initTRPC, TRPCError } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { eq } from 'drizzle-orm'

// Define the shape of your Cloudflare environment

export async function createContext(opts: FetchCreateContextFnOptions & { env: CloudflareEnv }) {
  // Create database connection using Supabase credentials
  const db = createClient(opts.env.POSTGRES_URI)

  return {
    env: opts.env,
    db,
    req: opts.req,
    // Lazy Supabase client creation - only created when needed
    createSupabaseClient: () => {
      const cookieHeader = opts.req.headers.get('cookie') || ''
      const cookies = parseCookies(cookieHeader)

      return createServerClient(opts.env.SUPABASE_PUBLIC_URL, opts.env.SUPABASE_SERVICE_ROLE_KEY, {
        cookies: {
          getAll() {
            return Object.entries(cookies).map(([name, value]) => ({ name, value }))
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            // In API context, we can't set cookies directly
            // This is mainly for reading session
          },
        },
      })
    },
  }
}

// Helper function to parse cookies from cookie header string
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

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

// Authentication middleware
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  // Create Supabase client only when authentication is needed
  const supabase = ctx.createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session,
      supabase,
      user: session.user,
    },
  })
})

// Admin middleware
const isAdmin = t.middleware(async ({ ctx, next }) => {
  // Create Supabase client only when authentication is needed
  const supabase = ctx.createSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  // Get user from database to check role
  const [userRecord] = await ctx.db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!userRecord || userRecord.role !== UserRole.Admin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    })
  }

  return next({
    ctx: {
      ...ctx,
      session,
      supabase,
      user: session.user,
      userRecord,
    },
  })
})

// Root access middleware - requires APP_KEY in Authorization header
const hasRootAccess = t.middleware(async ({ ctx, next }) => {
  const authHeader = ctx.req.headers.get('authorization')

  if (!authHeader) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authorization header is required for root access',
    })
  }

  // Extract the key from "Bearer <key>" or just "<key>"
  const key = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

  if (!key || key !== ctx.env.APP_KEY) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Invalid root access key',
    })
  }

  return next({
    ctx: {
      ...ctx,
      hasRootAccess: true,
    },
  })
})

// Authenticated procedure
export const protectedProcedure = publicProcedure.use(isAuthenticated)

// Admin-only procedure
export const adminProcedure = publicProcedure.use(isAdmin)

// Root access procedure - requires APP_KEY
export const rootProcedure = publicProcedure.use(hasRootAccess)
