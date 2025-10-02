terraform {
  required_providers {
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.14"
    }
  }
}

variable "organization" {
  description = "Sentry organization slug"
  type        = string
}

variable "project_name" {
  description = "Base project name"
  type        = string
}

# Get organization data
data "sentry_organization" "main" {
  slug = var.organization
}

# Create team for the project
resource "sentry_team" "main" {
  organization = data.sentry_organization.main.id
  name         = "${var.project_name}-team"
  slug         = "${var.project_name}-team"
}

# Create Sentry projects for each app
resource "sentry_project" "admin" {
  organization = data.sentry_organization.main.id
  teams        = [sentry_team.main.id]
  name         = "${var.project_name}-admin"
  slug         = "${var.project_name}-admin"
  platform     = "javascript-nextjs"
  
  # Enable source maps
  resolve_age = 0
}

resource "sentry_project" "landing" {
  organization = data.sentry_organization.main.id
  teams        = [sentry_team.main.id]
  name         = "${var.project_name}-landing"
  slug         = "${var.project_name}-landing"
  platform     = "javascript-nextjs"
  
  resolve_age = 0
}

resource "sentry_project" "backend" {
  organization = data.sentry_organization.main.id
  teams        = [sentry_team.main.id]
  name         = "${var.project_name}-backend"
  slug         = "${var.project_name}-backend"
  platform     = "node"
  
  resolve_age = 0
}

# Create client keys (DSNs) for each project
resource "sentry_key" "admin" {
  organization = data.sentry_organization.main.id
  project      = sentry_project.admin.id
  name         = "Default Key"
}

resource "sentry_key" "landing" {
  organization = data.sentry_organization.main.id
  project      = sentry_project.landing.id
  name         = "Default Key"
}

resource "sentry_key" "backend" {
  organization = data.sentry_organization.main.id
  project      = sentry_project.backend.id
  name         = "Default Key"
}

# Outputs

# DSNs
output "dsn_admin_public" {
  value       = sentry_key.admin.dsn_public
  description = "Public DSN for admin app"
}

output "dsn_admin_secret" {
  value       = sentry_key.admin.dsn_secret
  description = "Secret DSN for admin app"
  sensitive   = true
}

output "dsn_landing_public" {
  value       = sentry_key.landing.dsn_public
  description = "Public DSN for landing app"
}

output "dsn_landing_secret" {
  value       = sentry_key.landing.dsn_secret
  description = "Secret DSN for landing app"
  sensitive   = true
}

output "dsn_backend_public" {
  value       = sentry_key.backend.dsn_public
  description = "Public DSN for backend app"
}

output "dsn_backend_secret" {
  value       = sentry_key.backend.dsn_secret
  description = "Secret DSN for backend app"
  sensitive   = true
}

# Project slugs
output "admin_project_slug" {
  value = sentry_project.admin.slug
}

output "landing_project_slug" {
  value = sentry_project.landing.slug
}

output "backend_project_slug" {
  value = sentry_project.backend.slug
}

