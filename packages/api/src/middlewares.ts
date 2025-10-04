import { UserRole } from '@repo/db'
import { users } from '@repo/db/schema'
import { TRPCError } from '@trpc/server'
import { eq } from 'drizzle-orm'
import { createSupabaseClient } from './lib/supabase'
import { publicProcedure, t } from './trpc'

/**
 * Authentication middleware - verifies user has a valid session
 */
const isAuthenticated = t.middleware(async ({ ctx, next }) => {
  const supabase = createSupabaseClient(ctx.req, ctx.env)
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

/**
 * Admin middleware - verifies user has admin role
 */
const isAdmin = t.middleware(async ({ ctx, next }) => {
  const supabase = createSupabaseClient(ctx.req, ctx.env)
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
 * Protected procedure - requires authentication
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated)

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = publicProcedure.use(isAdmin)

/**
 * Root procedure - requires APP_KEY authorization
 */
export const rootProcedure = publicProcedure.use(hasRootAccess)
