/**
 * tRPC configuration for the admin app
 */

import { createTRPCReact } from '@trpc/react-query'
import type { AppRouter } from '@repo/api/router'

export const trpc = createTRPCReact<AppRouter>()
