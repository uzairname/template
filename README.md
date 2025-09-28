This is a template

# Development

## Setup Prerequisites

### Cloudflare

Get a cloudflare api token with these permissions:

- Account > Workers Scripts > Edit
- Account > Account Settings > Read

### Supabase

Create a Supabase account. Copy the org id and a bearer token

## Setup

Run the "setup" workflow on github. This will create a supabase project

Go to your supabase project, and set
email confirmation required: true
redirect urls

## Local Development

### Supabase

Run

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

# Reference

https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo
