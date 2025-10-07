
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

variable "project_name" {
  description = "The name to prefix the names of the Cloudflare Workers with."
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

variable "admin_base_url" {
  description = "The base URL of your admin website for auth redirects and email links"
  type        = string
}

# The Cloudflare Worker script resource
resource "cloudflare_worker" "worker-backend" {
  account_id = var.account_id
  name = "${var.project_name}-backend"
}

resource "cloudflare_worker" "worker-landing" {
  account_id = var.account_id
  name = "${var.project_name}-landing"
}

resource "cloudflare_worker" "worker-admin" {
  account_id = var.account_id
  name = "${var.project_name}-admin"
}

# The R2 bucket for the project
resource "cloudflare_r2_bucket" "r2_bucket" {
  account_id = var.account_id
  name       = var.project_name
}

# ROUTES AND DNS

resource "cloudflare_workers_route" "route-backend" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "uzairname.org/api/*"
  script = cloudflare_worker.worker-backend.name
}

resource "cloudflare_workers_route" "route-landing" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "uzairname.org/*"
  script = cloudflare_worker.worker-landing.name
}

resource "cloudflare_workers_route" "route-admin" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.admin_base_url}/*"
  script = cloudflare_worker.worker-admin.name
}
