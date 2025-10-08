
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
resource "cloudflare_worker" "backend-worker" {
  account_id = var.account_id
  name = "${var.project_name}-backend"
}

resource "cloudflare_worker_version" "backend-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.backend-worker.id

  modules = [{
    name = "index.js"
    content_file = "index.js"
    content_type = "application/javascript+module"
  }]

  main_module = "index.js"

  lifecycle {
    ignore_changes = [modules, main_module]
  }

  bindings = [
    {
      name = "ENVIRONMENT"
      type = "plain_text"
      text = "production"
    }
  ]

  depends_on = [cloudflare_worker.backend-worker]
}

resource "cloudflare_workers_deployment" "backend-deployment" {
  account_id = var.account_id
  script_name = cloudflare_worker.backend-worker.name
  strategy = "percentage"

  versions = [{
    percentage = 100
    version_id = cloudflare_worker_version.backend-version.id
  }]

  depends_on = [cloudflare_worker_version.backend-version]
}

resource "cloudflare_workers_route" "backend-route" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.backend_url}/api/*"
  script = cloudflare_worker.backend-worker.name

  depends_on = [cloudflare_workers_deployment.backend-deployment]
}


# Admin dashboard
resource "cloudflare_worker" "admin-worker" {
  account_id = var.account_id
  name = "${var.project_name}-admin"
}

resource "cloudflare_worker_version" "admin-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.admin-worker.id

  modules = [{
    name = "index.js"
    content_file = "index.js"
    content_type = "application/javascript+module"
  }]

  main_module = "index.js"

  lifecycle {
    ignore_changes = [modules, main_module]
  }

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

  depends_on = [cloudflare_worker.admin-worker]
}


resource "cloudflare_workers_deployment" "admin-deployment" {
  account_id = var.account_id
  script_name = cloudflare_worker.admin-worker.name
  strategy = "percentage"

  versions = [{
    percentage = 100
    version_id = cloudflare_worker_version.admin-version.id
  }]

  depends_on = [cloudflare_worker_version.admin-version]
}


resource "cloudflare_workers_route" "admin-route" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.admin_url}/*"
  script = cloudflare_worker.admin-worker.name

  depends_on = [cloudflare_workers_deployment.admin-deployment]
}


# Landing page
resource "cloudflare_worker" "landing-worker" {
  account_id = var.account_id
  name = "${var.project_name}-landing"
}


resource "cloudflare_worker_version" "landing-version" {
  account_id = var.account_id
  worker_id = cloudflare_worker.landing-worker.id

  modules = [{
    name = "index.js"
    content_file = "index.js"
    content_type = "application/javascript+module"
  }]

  main_module = "index.js"

  lifecycle {
    ignore_changes = [modules, main_module]
  }

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

  depends_on = [cloudflare_worker.landing-worker]
}

resource "cloudflare_workers_deployment" "landing-deployment" {
  account_id = var.account_id
  script_name = cloudflare_worker.landing-worker.name
  strategy = "percentage"

  versions = [{
    percentage = 100
    version_id = cloudflare_worker_version.landing-version.id
  }]

  depends_on = [cloudflare_worker_version.landing-version]
}

resource "cloudflare_workers_route" "landing-route" {
  zone_id = "27509b89a6498d16040bb49d97d710a1"
  pattern = "${var.landing_url}/*"
  script = cloudflare_worker.landing-worker.name

  depends_on = [cloudflare_workers_deployment.landing-deployment]
}

