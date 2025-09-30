
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
  special = true
}

resource "supabase_project" "main" {
  organization_id   = var.org_id
  name              = var.project_name
  database_password = random_password.db_password.result
  region            = var.region
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

output "url" {
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
