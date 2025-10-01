This is a template

# Setup

These instructions are for MacOS

## One Time

### Cloudflare

Get a cloudflare api token with these permissions:

- Account > Workers Scripts > Edit
- Account > Account Settings > Read

### Supabase

Create a Supabase account. Copy the org id and a bearer token

### Github Actions Secrets

Put the following variables

Create a .env based on .env.example and save it somewhere (It can be reused across projects)

## Once per project:

Clone the repo.

### Set Names

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
- `apps/**/wrangler.jsonc`
- `terraform/cloudflare/main.tf`
- The *cloudflare-secrets* step of `.github/workflows/provision.yml`

The convention is for the worker name to follow the format "project_name-app_name", where app_name is something like api, admin, etc


### Provision Resources

Once terraform is set up, push the code to github and run the "provision" workflow


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

Copy the following variables into apps/admin/.dev.vars

SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY



### Migrations




# Reference

https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo

# Project setup

`packages/api`: API package with tRPC router and context, to be served by @repo/backend