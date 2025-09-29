/**
 * tRPC server configuration
 * This file contains the tRPC router factory and context creation
 */
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { initTRPC} from '@trpc/server'
import { type Session } from '@supabase/supabase-js'


export async function createContext({session}: { session: Session}) {
  const { env } = getCloudflareContext()

  return {
    env,
    session
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure
