import { z } from 'zod'
import { router, publicProcedure } from '../trpc'

/**
 * Example router with some basic procedures
 */
export const exampleRouter = router({
  // Public procedure - anyone can call
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
        timestamp: new Date().toISOString(),
      }
    }),
})
