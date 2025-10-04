
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
