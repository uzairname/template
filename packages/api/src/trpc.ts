import { createClient } from '@repo/db'
import { initTRPC } from '@trpc/server'
import { type FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'

/**
 * Creates the tRPC context for each request
 * Includes database client, environment variables, and request object
 */
export function createContext(opts: FetchCreateContextFnOptions & { env: CloudflareEnv }) {
  const db = createClient(opts.env.POSTGRES_URI)

  return {
    env: opts.env,
    db,
    req: opts.req,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

/**
 * tRPC instance with context
 */
export const t = initTRPC.context<Context>().create()

/**
 * Base router builder
 */
export const router = t.router

/**
 * Public (unprotected) procedure
 */
export const publicProcedure = t.procedure
