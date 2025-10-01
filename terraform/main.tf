terraform {
  required_version = ">= 1.0.0"
  
  cloud {
    organization = "uz"
    workspaces {
      name = "template"
    }
  }

  required_providers {    
    supabase = {      
      source  = "supabase/supabase"      
      version = "~> 1.0"    
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# ---- VARIABLES ----

variable "project_name" {
  description = "Client/project identifier"
  type        = string
}

# Supabase
variable "supabase_bearer_token" {
  description = "Supabase Management API Token"
  type        = string
  sensitive   = true
}

variable "supabase_org_id" {
  description = "Supabase Organization ID"
  type        = string
  sensitive   = true
}

variable "supabase_region" {
  description = "Supabase project region"
  type        = string
  default     = "us-east-1"
}


# Cloudflare
variable "cloudflare_api_token" {
  description = "Cloudflare API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID"
  type        = string
}

variable "base_url" {
  description = "The base URL of your website for auth redirects and email links"
  type        = string
  default     = "http://localhost:3000"
}


# ---- PROVIDERS ----

provider "supabase" {
  access_token = var.supabase_bearer_token
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# ---- MODULES ----

# Supabase
module "supabase" {
  source = "./modules/supabase"

  project_name = "${var.project_name}"
  org_id       = var.supabase_org_id
  region       = var.supabase_region
  base_url     = var.base_url
}

# Cloudflare
module "cloudflare" {
  source = "./modules/cloudflare"

  account_id = var.cloudflare_account_id
  cloudflare_api_token = var.cloudflare_api_token
  project_name  = "${var.project_name}"
}

# ---- OUTPUTS ----

output "supabase_public_url" {
  value = module.supabase.public_url
}

output "supabase_anon_key" {
  value     = module.supabase.anon_key
  sensitive = true
}

output "supabase_service_role_key" {
  value     = module.supabase.service_role_key
  sensitive = true
}

output "supabase_db_password" {
  value     = module.supabase.db_password
  sensitive = true
}

output "postgres_uri" {
  value     = module.supabase.postgres_uri
  sensitive = true
}