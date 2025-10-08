
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}


provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Variables

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

# The R2 bucket for the project
resource "cloudflare_r2_bucket" "r2_bucket" {
  account_id = var.account_id
  name       = var.project_name
}


# Cloudflare Worker resources

# Backend
resource "cloudflare_worker" "backend-worker" {
  account_id = var.account_id
  name = "${var.project_name}-backend"
}

# Admin dashboard
resource "cloudflare_worker" "admin-worker" {
  account_id = var.account_id
  name = "${var.project_name}-admin"
}

# Landing page
resource "cloudflare_worker" "landing-worker" {
  account_id = var.account_id
  name = "${var.project_name}-landing"
}
