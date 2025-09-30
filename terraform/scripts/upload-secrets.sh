#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "Uploading secrets to Cloudflare Worker: $CLOUDFLARE_WORKER_NAME"

echo "$SUPABASE_URL" | npx wrangler secret put SUPABASE_URL --name "$CLOUDFLARE_WORKER_NAME"
echo "$SUPABASE_ANON_KEY" | npx wrangler secret put SUPABASE_ANON_KEY --name "$CLOUDFLARE_WORKER_NAME"
echo "$SUPABASE_SERVICE_ROLE_KEY" | npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name "$CLOUDFLARE_WORKER_NAME"
echo "$SUPABASE_DB_PASSWORD" | npx wrangler secret put SUPABASE_DB_PASSWORD --name "$CLOUDFLARE_WORKER_NAME"
echo "$SUPABASE_PROJECT_ID" | npx wrangler secret put SUPABASE_PROJECT_ID --name "$CLOUDFLARE_WORKER_NAME"

echo "Secrets uploaded successfully."
