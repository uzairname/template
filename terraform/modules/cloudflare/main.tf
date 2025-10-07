
terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
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

# Domains and URLs
variable "backend_url" {
  type        = string
}

variable "admin_url" {
  type        = string
}

variable "landing_url" {
  type        = string
}


# The R2 bucket for the project
resource "cloudflare_r2_bucket" "r2_bucket" {
  account_id = var.account_id
  name       = var.project_name
}


# Cloudflare Worker resources

# Backend
resource "cloudflare_worker" "worker-backend" {
  account_id = var.account_id
  name = "${var.project_name}-backend"
}

resource "cloudflare_worker_version" "worker-backend-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.worker-backend.id

  bindings = [
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = "production"
    }
  ]
}

resource "cloudflare_workers_route" "route-backend" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.backend_url}/api/*"
  script = cloudflare_worker.worker-backend.name
}


# Admin dashboard
resource "cloudflare_worker" "worker-admin" {
  account_id = var.account_id
  name = "${var.project_name}-admin"
}

resource "cloudflare_worker_version" "worker-admin-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.worker-admin.id

  bindings = [
    {
      name = "NEXT_INC_CACHE_R2_BUCKET"
      type = "r2_bucket"
      bucket_name = cloudflare_r2_bucket.r2_bucket.name
      account_id = var.account_id
    },
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = "production"
    },
    {
      name = "ADMIN_BASE_URL"
      type = "plain_text"
      text = var.admin_url
    }
  ]
}

resource "cloudflare_workers_route" "route-admin" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.admin_url}/*"
  script = cloudflare_worker.worker-admin.name
}


# Landing page
resource "cloudflare_worker" "worker-landing" {
  account_id = var.account_id
  name = "${var.project_name}-landing"
}


resource "cloudflare_worker_version" "worker-landing-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.worker-landing.id

  bindings = [
    {
      name = "NEXT_INC_CACHE_R2_BUCKET"
      type = "r2_bucket"
      bucket_name = cloudflare_r2_bucket.r2_bucket.name
      account_id = var.account_id
    },
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = "production"
    }
  ]
}


resource "cloudflare_workers_route" "route-landing" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.landing_url}/*"
  script = cloudflare_worker.worker-landing.name
}

