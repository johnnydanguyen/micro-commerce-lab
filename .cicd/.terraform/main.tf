terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" { type = string }
variable "region" { type = string }
variable "service" { type = string }
variable "image" { type = string } # full image path
variable "artifact_repository" {
  type        = string
  description = "Artifact Registry Docker repository name"
  default     = "containers"
}
variable "database_url" {
  type        = string
  description = "Orders service DATABASE_URL"
  sensitive   = true
}
variable "redis_host" {
  type        = string
  description = "Redis host for BullMQ"
  default     = "localhost"
}
variable "redis_port" {
  type        = string
  description = "Redis port for BullMQ"
  default     = "6379"
}
variable "redis_username" {
  type        = string
  description = "Redis username for BullMQ (if applicable)"
  default     = ""
}
variable "redis_password" {
  type        = string
  description = "Redis password for BullMQ (if applicable)"
  default     = ""
}
variable "service_account" {
  type        = string
  description = "Existing service account email for Cloud Run runtime. Leave empty to use Cloud Run default."
  default     = ""
}
variable "runtime_service_account_email" {
  type        = string
  description = "Preferred runtime service account email (kept for workflow compatibility)."
  default     = ""
}

locals {
  effective_service_account = var.runtime_service_account_email != "" ? var.runtime_service_account_email : var.service_account
}
resource "google_artifact_registry_repository" "micro_commerce" {
  location      = var.region
  repository_id = var.artifact_repository
  description   = "Docker images for ${var.service}"
  format        = "DOCKER"
}

resource "google_cloud_run_v2_service" "svc" {
  name     = var.service
  location = var.region

  template {
    service_account = local.effective_service_account != "" ? local.effective_service_account : null

    containers {
      image = var.image

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }

      env {
        name  = "REDIS_HOST"
        value = var.redis_host
      }

      env {
        name  = "REDIS_USERNAME"
        value = var.redis_username
      }

      env {
        name  = "REDIS_PASSWORD"
        value = var.redis_password
      }

      env {
        name  = "REDIS_PORT"
        value = var.redis_port
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
  }

  depends_on = [
    google_artifact_registry_repository.micro_commerce,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.svc.name
  location = google_cloud_run_v2_service.svc.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

output "service_url" {
  value = google_cloud_run_v2_service.svc.uri
}

output "artifact_registry_repository" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.micro_commerce.repository_id}"
}
