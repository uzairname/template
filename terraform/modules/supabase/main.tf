
# Supabase Terraform Module
#
# Important Note: Supabase projects are immutable after creation.
# This module uses lifecycle.ignore_changes to prevent Terraform from
# attempting updates that would fail. If you need to modify project
# settings like name, region, or password, you must:
#
# 1. Export/backup your data from the existing project
# 2. Remove the project from Terraform state:
#    terraform state rm module.supabase.supabase_project.main
# 3. Apply with the new configuration to create a fresh project
# 4. Restore your data to the new project

terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

variable "project_name" {
  type = string
}

variable "org_id" {
  type = string
}

variable "region" {
  type    = string
  default = "us-east-1"
}

resource "random_password" "db_password" {
  length  = 32
  special = false  # Disable special characters to ensure URL safety
}

# Supabase projects don't support updates after creation
# If you need to change project configuration, you'll need to:
# 1. Export your data
# 2. Remove the project from state: terraform state rm module.supabase.supabase_project.main
# 3. Create a new project with the desired configuration
resource "supabase_project" "main" {
  organization_id   = var.org_id
  name              = var.project_name
  database_password = random_password.db_password.result
  region            = var.region

  lifecycle {
    # Prevent accidental updates that would fail
    # Supabase projects are immutable after creation
    ignore_changes = [
      organization_id,
      name,
      database_password,
      region
    ]
  }
}

# Configure auth settings
resource "supabase_settings" "auth" {
  project_ref = supabase_project.main.id

  auth = jsonencode({
    mailer_templates_confirmation_content = <<-EOT
      <h2>Confirm your signup</h2>
      <p>Follow this link to confirm your user:</p>
      <p>
        <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">
          Confirm your email
        </a>
      </p>
    EOT
  })
}

# Get API keys for the project
data "supabase_apikeys" "main" {
  project_ref = supabase_project.main.id
}

output "project_id" {
  value = supabase_project.main.id
}

output "public_url" {
  value = "https://${supabase_project.main.id}.supabase.co"
}

output "db_password" {
  value     = random_password.db_password.result
  sensitive = true
}

output "anon_key" {
  value     = data.supabase_apikeys.main.anon_key
  sensitive = true
  description = "Anonymous key for client-side use"
}

output "service_role_key" {
  value     = data.supabase_apikeys.main.service_role_key
  sensitive = true
  description = "Service role key for server-side use"
}

output "postgres_uri" {
  value     = "postgresql://postgres.${supabase_project.main.id}:${random_password.db_password.result}@aws-0-${var.region}.pooler.supabase.com:6543/postgres"
  sensitive = true
  description = "PostgreSQL connection URL for direct database access"
}
