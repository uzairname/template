import { UserRole } from '@repo/db'
import { users } from '@repo/db/schema'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { createSupabaseClient } from './lib/supabase'
import { publicProcedure, t } from './trpc'

/**
 * Authenticated middleware - verifies user is logged in and fetches user record
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  console.log('[Auth] Starting authentication check')
  
  const supabase = createSupabaseClient(ctx.req, ctx.env)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  console.log('[Auth] Session check result:', {
    hasSession: !!session,
    userId: session?.user?.id,
    error: error?.message,
  })

  if (!session) {
    console.log('[Auth] No session found - throwing UNAUTHORIZED')
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    })
  }

  // Get user from database
  const [userRecord] = await ctx.db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  console.log('[Auth] User record lookup:', {
    userId: session.user.id,
    found: !!userRecord,
    role: userRecord?.role,
  })

  if (!userRecord) {
    console.log('[Auth] User record not found - throwing NOT_FOUND')
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'User record not found',
    })
  }

  console.log('[Auth] Authentication successful')
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

/**
 * Admin middleware - verifies user has admin role
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  console.log('[Admin] Starting admin check')
  
  const supabase = createSupabaseClient(ctx.req, ctx.env)
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  console.log('[Admin] Session check result:', {
    hasSession: !!session,
    userId: session?.user?.id,
    error: error?.message,
  })

  if (!session) {
    console.log('[Admin] No session found - throwing UNAUTHORIZED')
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

  console.log('[Admin] User record lookup:', {
    userId: session.user.id,
    found: !!userRecord,
    role: userRecord?.role,
    isAdmin: userRecord?.role === UserRole.Admin,
  })

  if (!userRecord || userRecord.role !== UserRole.Admin) {
    console.log('[Admin] User is not admin - throwing FORBIDDEN')
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You must be an admin to access this resource',
    })
  }

  console.log('[Admin] Admin check successful')
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

/**
 * Root access middleware - requires APP_KEY in Authorization header
 */
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

/**
 * Authenticated procedure - requires valid user session
 */
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = publicProcedure.use(isAdmin)

/**
 * Root procedure - requires APP_KEY authorization
 */
export const rootProcedure = publicProcedure.use(hasRootAccess)
