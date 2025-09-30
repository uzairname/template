#!/bin/bash

# Create and configure a Terraform Cloud workspace for a new project.

set -e

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: $0 <project_name>"
  exit 1
fi

# Required environment variables
required_vars=(
  "ENVIRONMENT"
  "TFC_TOKEN"
  "TFC_ORGANIZATION"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_ACCOUNT_ID"
  "SUPABASE_BEARER_TOKEN"
  "SUPABASE_ORG_ID"
)

# Check if all required environment variables are set
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "Error: Environment variable $var is not set."
    exit 1
  fi
done

WORKSPACE_NAME="${PROJECT_NAME}-${ENVIRONMENT}"

echo "Setting up Terraform Cloud workspace: $WORKSPACE_NAME"

# Create a new workspace
curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  --header "Content-Type: application/vnd.api+json" \
  --request POST \
  --data @- \
  https://app.terraform.io/api/v2/organizations/$TFC_ORGANIZATION/workspaces <<EOF
{
  "data": {
    "type": "workspaces",
    "attributes": {
      "name": "$WORKSPACE_NAME",
      "auto-apply": true,
      "terraform-version": "1.9.0",
      "working-directory": "",
      "description": "Infrastructure for $CLIENT_NAME"
    }
  }
}
EOF


# Get workspace ID
WORKSPACE_ID=$(curl -s \
  --header "Authorization: Bearer $TFC_TOKEN" \
  --header "Content-Type: application/vnd.api+json" \
  https://app.terraform.io/api/v2/organizations/$TFC_ORGANIZATION/workspaces/$WORKSPACE_NAME | \
  jq -r '.data.id')

echo "✅ Workspace created with ID: $WORKSPACE_ID"



# Create a workspace variables
create_variable() {
  local key=$1
  local value=$2
  local sensitive=${3:-false}
  local category=${4:-terraform}

  curl -s \
    --header "Authorization: Bearer $TFC_TOKEN" \
    --header "Content-Type: application/vnd.api+json" \
    --request POST \
    --data @- \
    https://app.terraform.io/api/v2/workspaces/$WORKSPACE_ID/vars <<EOF > /dev/null
{
  "data": {
    "type": "vars",
    "attributes": {
      "key": "$key",
      "value": "$value",
      "category": "$category",
      "hcl": false,
      "sensitive": $sensitive
    }
  }
}
EOF
}


echo "Adding workspace variables..."

create_variable "project_name" "$PROJECT_NAME"
create_variable "environment" "$ENVIRONMENT"

# secrets
create_variable "cloudflare_api_token" "$CLOUDFLARE_API_TOKEN" true
create_variable "cloudflare_account_id" "$CLOUDFLARE_ACCOUNT_ID" true
create_variable "supabase_bearer_token" "$SUPABASE_BEARER_TOKEN" true
create_variable "supabase_org_id" "$SUPABASE_ORG_ID" true

echo "✅ Variables configured"

