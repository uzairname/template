import { z } from 'zod'
import { router, publicProcedure, rootProcedure } from '../trpc'

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

  listEnvVars: rootProcedure
    .query(({ ctx }) => {
      // Get all environment variable keys from the Cloudflare environment
      const envKeys = Object.keys(ctx.env) as Array<keyof CloudflareEnv>
      
      // Create a safe representation of environment variables
      const envVars = envKeys.map(key => {
        const value = ctx.env[key]
        
        // Determine if this environment variable contains sensitive data
        const keyLower = key.toLowerCase()
        const isSensitive = keyLower.includes('password') || 
                           keyLower.includes('key') || 
                           keyLower.includes('secret') ||
                           keyLower.includes('token') ||
                           keyLower.includes('uri') ||
                           keyLower.includes('credential')
        
        return {
          key: key as string,
          type: typeof value,
          isDefined: value !== undefined && value !== null && value !== '',
          value: isSensitive ? '[MASKED]' : String(value),
          isSensitive,
          length: value ? String(value).length : 0
        }
      })
      
      return {
        total: envVars.length,
        envVars: envVars.sort((a, b) => a.key.localeCompare(b.key)),
        timestamp: new Date().toISOString(),
        worker: 'backend', // Identifier for which worker this is running on
      }
    }),
})
