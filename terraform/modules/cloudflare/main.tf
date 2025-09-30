
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
}
