# AI Agent Instructions for Template Monorepo

## Architecture Overview

This is a **Turborepo monorepo** deploying to **Cloudflare Workers** with **Next.js apps**, **tRPC API**, **Supabase auth**, **Drizzle ORM**, and **Terraform-managed infrastructure**.

### Stack

- **Runtime**: Cloudflare Workers (edge runtime constraints apply)
- **Framework**: Next.js 15 with OpenNext Cloudflare adapter (`@opennextjs/cloudflare`)
- **Auth**: Supabase (cookie-based sessions)
- **Database**: PostgreSQL (Supabase-hosted) via Drizzle ORM
- **API**: tRPC with React Query on client
- **IaC**: Terraform (Supabase, Cloudflare, Sentry provisioning)
- **Monitoring**: Sentry
- **Package Manager**: pnpm with workspace protocol

### Monorepo Structure

```
apps/
  admin/        → Next.js admin dashboard (port 3000)
  landing/      → Next.js landing page (port 3001)
  backend/      → Hono + tRPC API server (port 8989)
packages/
  api/          → Shared tRPC router & procedures
  db/           → Drizzle schema, migrations, client
  ui/           → Shared React components (shadcn/ui)
  utils/        → Shared utilities
  eslint-config/ → Shared ESLint configs
```

## Critical Patterns

### 0. General Conventions

Do not create new .md files after making changes. Do not write comments explaining changes made, but only the current state of the code.

### 1. Authentication Flow (Supabase + tRPC)

**Client → Middleware → API → Protected Procedures**

- **Client cookies**: Supabase session stored in HttpOnly cookies
- **Next.js middleware** (`apps/admin/src/middleware.ts`): Refreshes session on every request
- **tRPC context** (`packages/api/src/trpc.ts`): Reads cookies from `Request` headers
- **Auth middlewares** (`packages/api/src/middlewares.ts`):
  - `authenticatedProcedure`: Verifies session + fetches user from DB
  - `adminProcedure`: Checks `UserRole.Admin` from `users` table
  - `rootProcedure`: Requires `APP_KEY` in Authorization header

**Key files**:

- `packages/api/src/lib/supabase.ts` - Cookie parsing for Workers runtime
- `apps/admin/src/utils/supabase/` - Client/server/middleware Supabase helpers
- `packages/api/src/middlewares.ts` - All auth middlewares

**Pattern**: Always use `credentials: 'include'` in tRPC `httpBatchLink` to send cookies.

### 2. Database & Schema Management

**Schema location**: `packages/db/src/schema/`

- `auth.ts` - Supabase auth schema reference (read-only)
- `public.ts` - Custom tables (e.g., `users` table with roles)

**Migration workflow**:

```bash
cd packages/db
npx drizzle-kit generate  # Generate SQL from schema changes
# Migrations auto-run on next deployment via GitHub Actions
```

**DB client pattern**:

```typescript
import { createClient } from '@repo/db'
const db = createClient(env.POSTGRES_URI)
```

**Important**: Use `eq()` from `drizzle-orm` for WHERE clauses, not raw SQL.

**Usage in components**:

```tsx
import { trpc } from '@/utils/trpc/client'
const { data } = trpc.userAdmin.getAllUsers.useQuery()
const mutation = trpc.userAdmin.setUserRole.useMutation()
```

### 3. Cloudflare Workers Constraints

**What DOESN'T work**:

- ❌ `process.env` (use `env` from context)
- ❌ Node.js APIs (`fs`, `path`, etc.)
- ❌ Long-running tasks (10ms CPU limit)

**Pattern for env vars**:

```typescript
import { getCloudflareContext } from '@opennextjs/cloudflare'

function example() {
  // Must be called inside a function handling a request
  const { env } = getCloudflareContext()
  env.POSTGRES_URI // Type-safe CloudflareEnv
}
```

**Type definitions**: `packages/api/src/cloudflare-env.d.ts` (auto-generated via `pnpm cf-typegen`)

### 4. UI Components

- Based on [shadcn/ui](https://ui.shadcn.com/) with Tailwind CSS

Install new components via:

```bash
cd packages/ui
pnpm dlx shadcn@latest add <component-name>
```

### 5. ESLint Configuration

**Three configs** (`packages/eslint-config/`):

- `base.js` - TypeScript, no console (for packages)
- `react.js` - React/Next.js apps (extends base)
- `node.js` - Workers/server (allows console, extends base)

**Commands**:

```bash
pnpm lint        # Check all packages
pnpm lint:fix    # Auto-fix all packages
```

### Schema Changes

```bash
# 1. Edit packages/db/src/schema/public.ts
# 2. Generate migration
cd packages/db && npx drizzle-kit generate
# 3. Commit migration file (auto-runs on deploy)
```

### Adding New Procedures

```typescript
// packages/api/src/routers/your-router.ts
import { authenticatedProcedure, router } from '../trpc'
import { z } from 'zod'

export const yourRouter = router({
  getData: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      // ctx.userRecord available (authenticated)
      // ctx.db available (Drizzle client)
      return ctx.db.select()...
    }),
})

// Register in packages/api/src/router.ts
```

## Environment Variables

### Required for admin app (`.env.local`):

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8989  # tRPC endpoint
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
```

### Worker secrets (managed via GitHub Actions):

- `POSTGRES_URI` - Database connection string
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side Supabase key
- `APP_KEY` - Root access key for admin operations

## Key Commands Reference

```bash
# Monorepo
pnpm dev                 # Start all apps
pnpm lint                # Lint everything
pnpm format              # Format with Prettier

# Build
cd apps/admin && pnpm build
cd apps/landing && pnpm build
cd apps/backend && pnpm build

# Apps
cd apps/admin && pnpm deploy:prod  # Deploy to Cloudflare

# Database
cd packages/db && npx drizzle-kit generate  # Generate migration
cd packages/db && pnpm run migrate          # Run migrations

# Type generation
cd apps/admin && pnpm cf-typegen  # Generate CloudflareEnv types
```

## Documentation Links

- [Turborepo](https://turbo.build/repo/docs)
- [tRPC](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
