This is a template

# Setup

## One time:

Create a Supabase, Cloudflare, Terraform Cloud, and Sentry account. Save the following variables somewhere:

Add the following variables to github actions. They can be the same across projects:

- `GH_PAT_FOR_SECRETS`
- `TFC_ORGANIZATION` Terraform cloud organization
- `TFC_TOKEN` Terraform cloud token
- `APP_KEY` random url-safe string of your choosing
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` an API token with these permissions:
  - Account > Workers Scripts > Edit
  - Account > Account Settings > Read
  - Account > Workers R2 Storage > Edit
- `SUPABASE_BEARER_TOKEN` Your Supabase user's API token
- `SUPABASE_ORG_ID` Supabase organization id
- `SENTRY_ORG_SLUG` Sentry organization slug
- `SENTRY_AUTH_TOKEN` Your Sentry auth token, with the permissions:
  - org: read
  - team: read and write
  - project: read and write

## Once per project:

### Clone Template

Clone the template. Create a new repo if making a separate project. Add the above secrets to github secrets

### Set Project Name

To change the name to something other than `template`, do the following:
Specify the **project name** at the top of `.github/workflows/provision.yml`. This tells terraform what all the resources should called. Then ensure that it is consistent across:
- The *name* and the r2 binding's *bucket_name* under the production environment field of each frontend `wrangler.jsonc` (Resource is created in `terraform/cloudflare/main.tf`)
- The sentry configuration in `apps/**/next.config.ts` (Resource is created in `terraform/sentry/main.tf`)
- The _workspace_ name in `terraform/main.tf` (Avoid overlapping with another workspace in your organization)
- (Optional. For local dev) Project name in `supabase/config.toml`

### Set Domains

To configure your production domain, ensure that the domain names and base URLs are consistent across:

1. The "locals" field in `terraform/main.tf`
2. NEXT_PUBLIC_BACKEND_URL in `.github/workflows/deploy.yml`
3. The variables, routes, and zone ids in each `apps/**/wrangler.jsonc`
4. CORS policy in `apps/backend/src/index.ts`

### First Time Deployment

Push the code and run the "provision" github action

# Development

## Adding apps

To add apps other than "admin", "landing", or "backend", update the relevant package.jsons, and then ensure that their names are consistent across:

- `apps/**/wrangler.jsonc`
- The matrix in `.github/workflows/deploy.yml` and `.github/workflows/provision.yml`
- `terraform/cloudflare/main.tf`
- `terraform/sentry/main.tf`: Update the sentry projects accordingly.

## Supabase (Optional; only for local development)

Set the project name and any extra configuration in `supabase/config.toml`

```bash
# Start and run local supabase container
npx supabase init
# After starting, copy the env variables into .dev.vars
npx supabase start
```

## Migrations

After making changes to `packages/db/src/schema`, run `npx drizzle-kit generate` from the `packages/db` directory

The next time the app is deployed, migrations will be applied

## Build, Lint & Format

Before commiting, format and build to ensure consistency.

### Lint

```bash
# Run prettier
pnpm run format
```

```bash
# Lint all packages
pnpm lint

# Lint with auto-fix
pnpm lint:fix

# Lint specific package
cd apps/admin && pnpm lint
```

### Build

```bash
cd apps/admin && pnpm build

cd apps/landing && pnpm build

cd apps/backend && pnpm build
```

### eslint configs:

1. `base.js` - Base TypeScript configuration for all packages
2. `react.js` - Configuration for React/Next.js applications
3. `node.js` - Configuration for Node.js/Cloudflare Workers

Relevant Docs:

- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint Plugin React](https://github.com/jsx-eslint/eslint-plugin-react)

## Deployment

No dev deployment setup yet

# Notes

Supabase projects are immutable after creation. You cannot change the database password after creation. To do so, manually reset the password in the supabase dashboard, then update the secret wherever it's stored

## Project setup

`packages/api`: API package with tRPC router and context, to be served by @repo/backend

## Reference
https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo