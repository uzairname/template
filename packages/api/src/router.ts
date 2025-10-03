import { exampleRouter } from './routers/example'
import { userAdminRouter } from './routers/user-admin'
import { router } from './trpc'

export const appRouter = router({
  example: exampleRouter,
  userAdmin: userAdminRouter,
})

export type AppRouter = typeof appRouter
