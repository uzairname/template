import { exampleRouter } from './routers/example'
import { rolesRouter } from './routers/roles'
import { router } from './trpc'

export const appRouter = router({
  example: exampleRouter,
  userAdmin: rolesRouter,
})

export type AppRouter = typeof appRouter
