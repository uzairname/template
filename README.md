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

### Terraform

Install terraform and log in.

```sh
brew tap hashicorp/tap 
```
```sh
brew install hashicorp/tap/terraform
```

```
terraform login
```

Create a .env based on .env.example and save it somewhere (It can be reused across projects)

## Once per project:

Clone the repo, copy paste your .env into the root

```sh
chmod +x ./terraform/setup.sh
```

```sh
source .env && ./terraform/setup.sh <args>
```

```sh
terraform init
```
```sh
terraform plan
```
```sh
terraform apply
```

Once terraform is set up, push the code to github and run the "deploy" workflow (wip)



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

# Reference

https://developers.cloudflare.com/workers/wrangler/configuration/
https://ui.shadcn.com/docs/monorepo
