
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

variable "worker_name" {
  description = "The name for the Cloudflare Worker."
  type        = string
}

variable "account_id" {
  description = "Your Cloudflare Account ID."
  type        = string
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}


variable "supabase_url" {
  type        = string
  sensitive   = true
}

variable "supabase_anon_key" {
  type        = string
  sensitive   = true
}

variable "supabase_service_role_key" {
  type        = string
  sensitive   = true
}

variable "supabase_db_password" {
  type        = string
  sensitive   = true
}

variable "supabase_project_id" {
  type        = string
  sensitive   = true
}


# The Cloudflare Worker script resource
resource "cloudflare_worker" "worker" {
  account_id = var.account_id
  name = var.worker_name

  provisioner "local-exec" {
    command = "./scripts/upload-secrets.sh"
    environment = {
      CLOUDFLARE_ACCOUNT_ID        = var.account_id
      CLOUDFLARE_API_TOKEN         = var.cloudflare_api_token
      CLOUDFLARE_WORKER_NAME       = var.worker_name

      SUPABASE_URL                 = var.supabase_url
      SUPABASE_ANON_KEY            = var.supabase_anon_key
      SUPABASE_SERVICE_ROLE_KEY    = var.supabase_service_role_key
      SUPABASE_DB_PASSWORD         = var.supabase_db_password
      SUPABASE_PROJECT_ID          = var.supabase_project_id
    }
  }
}
