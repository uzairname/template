/**
 * tRPC configuration for the admin app
 */

import type { AppRouter } from '@repo/api/router'
import { createTRPCReact } from '@trpc/react-query'


export const trpc = createTRPCReact<AppRouter>()
