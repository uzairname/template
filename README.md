This is a template

# Setup

These instructions are for MacOS

## One time:

Create a Supabase, Cloudflare, Terraform Cloud, and Sentry account.

## Once per project:

Clone the repo.

### Set Github Secrets

Set the following secrets. They can be the same across projects:

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

### (Optional) Set Names

If you want to change the name to something other than `template`, do the following:

1. Envure that the **project name** is consistent across:

- The _env_ of `.github/workflows/provision.yml`

- The _name of the R2 binding_ in the `.wrangler.jsonc` of each nextjs app (this must match the name in `cloudflare/main.tf`)

2. Ensure that the **worker names** are consistent across:

- The relevant `apps/**/wrangler.jsonc` files
- `terraform/cloudflare/main.tf`
- The _cloudflare-secrets_ step of `.github/workflows/provision.yml`

The convention is for the worker name to follow the format "project_name-app_name", where app_name is something like api, admin, etc

3. Set the terraform cloud workspace name

- The _workspace_ name in `terraform/main.tf` (doesn't have to match anything else, but be unique)

### (Optional) Set Apps

If you add or modify cloudflare worker apps inside an `apps` directory, such as `apps/your-app`, update the relevant package.jsons, and then ensure that their names are consistent across:

- `apps/your-app/wrangler.jsonc`
- The matrix in `.github/workflows/deploy.yml` and `.github/workflows/provision.yml`
- `terraform/cloudflare/main.tf`
- `terraform/sentry/main.tf`: Update the sentry projects accordingly.

### (Optional) Set Domains

To configure your production domain, update the domain names and base URLs in:

1. Routes in `terraform/main.tf`, and `terraform/cloudflare/main.tf`

### Run Github Action

Once terraform is set up, push the code to github and run the "provision" and "deploy" workflow

# Development

## Supabase (Optional; only for local development)

```bash
# Start and run local supabase container
npx supabase init
# After starting, copy the env variables into .dev.vars
npx supabase start
```

## Migrations

To deploy changes to `packages/db/src/schema`, run

```bash
# Generate migrations.
cd packages/db && npx drizzle-kit generate
```

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

1. **`base.js`** - Base TypeScript configuration for all packages
   - Console statement warnings
   - Promise handling rules

2. **`react.js`** - Configuration for React/Next.js applications
   - Extends base configuration
   - React-specific rules
   - React Hooks rules
   - JSX validation

3. **`node.js`** - Configuration for Node.js/Cloudflare Workers
   - Extends base configuration
   - Allows console statements (appropriate for server-side)
   - Server-specific linting rules

Relevant Docs:

- [ESLint Documentation](https://eslint.org/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [ESLint Plugin React](https://github.com/jsx-eslint/eslint-plugin-react)

## Deployment

No dev deployment setup yet

# Reference

https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo

# Project setup

`packages/api`: API package with tRPC router and context, to be served by @repo/backend

# Managing Infra

Supabase projects are immutable after creation. You cannot change the database password after creation. To do so, manually reset the password in the supabase dashboard, then update
