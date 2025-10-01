import { router } from "./trpc"
import { exampleRouter } from "./routers/example"
import { userAdminRouter } from "./routers/user-admin"

export const appRouter = router({
  example: exampleRouter,
  userAdmin: userAdminRouter,
})

export type AppRouter = typeof appRouter
