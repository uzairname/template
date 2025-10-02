This is a template

# Setup

These instructions are for MacOS

## One Time

### Cloudflare

Get 

### Supabase

Create a Supabase account. Copy the org id and a bearer token

### Github Actions Secrets

Put the following variables

Create a .env based on .env.example and save it somewhere (It can be reused across projects)

## Once per project:

Clone the repo.

### Set Github Secrets

Set the following secrets. They can be the same across projects:

- `GH_PAT_FOR_SECRETS`
- `TFC_ORGANIZATION` Terraform cloud organization
- `TFC_TOKEN` Terraform cloud token
- `APP_KEY` random url-safe string of your choosing
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`: A cloudflare api token with these permissions:
  - Account > Workers Scripts > Edit
  - Account > Account Settings > Read
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

- `terraform/main.tf`

```
workspaces {
  name = ...
}
```

- The *env* of `.github/workflows/provision.yml`

```
env:
  PROJECT_NAME: ...
```


2. Ensure that the **worker names** are consistent across:
- The relevant `apps/**/wrangler.jsonc` files
- `terraform/cloudflare/main.tf`
- The *cloudflare-secrets* step of `.github/workflows/provision.yml`

The convention is for the worker name to follow the format "project_name-app_name", where app_name is something like api, admin, etc


### (Optional) Set Apps

If you add or modify cloudflare worker apps inside an `apps` directory, such as `apps/your-app`, update the relevant package.jsons, and then ensure that their names are consistent across:

- `apps/your-app/wrangler.jsonc`
- The matrix in `.github/workflows/deploy.yml` and `.github/workflows/provision.yml`
- `terraform/cloudflare/main.tf`
- `terraform/sentry/main.tf`: Update the sentry projects accordingly.


### (Optional) Set Domains

To configure your production domain, update the domain names and base URLs in:

1. `.github/workflows/provision.yml`

2. The relevant `apps/**/wrangler.jsonc` files

3. Routes in terraform files


### Run Github Action

Once terraform is set up, push the code to github and run the "provision" and "deploy" workflow

# Development

## Local Development

### Supabase (Optional; only for local development)

```
npx supabase init
```

Then

```
npx supabase start
```

Copy the env variables into .dev.vars


### Migrations

To deploy changes to `packages/db/src/schema`, run

```bash
# Working dir: packages/db
npx drizzle-kit generate
```

The next time the app is deployed, migrations will be applied

### Deployment

To quickly deploy, run

```bash
pnpm run deploy
```

# Reference

https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo

# Project setup

`packages/api`: API package with tRPC router and context, to be served by @repo/backend


# Managing Infra

Supabase projects are immutable after creation. You cannot change the database password after creation. To do so, manually reset the password in the supabase dashboard, then update 