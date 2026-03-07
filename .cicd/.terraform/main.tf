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
variable "deployer_member" {
  type        = string
  description = "Principal applying Terraform, e.g. user:me@example.com or serviceAccount:ci@project.iam.gserviceaccount.com"
}

resource "google_project_service" "run" {
  service = "run.googleapis.com"
}

resource "google_project_service" "artifactregistry" {
  service = "artifactregistry.googleapis.com"
}

resource "google_artifact_registry_repository" "micro_commerce" {
  location      = var.region
  repository_id = var.artifact_repository
  description   = "Docker images for ${var.service}"
  format        = "DOCKER"

  depends_on = [google_project_service.artifactregistry]
}

resource "google_service_account" "cloud_run_runtime" {
  account_id   = "${var.service}-runtime"
  display_name = "${var.service} Cloud Run runtime"
}

resource "google_service_account_iam_member" "deployer_act_as_runtime" {
  service_account_id = google_service_account.cloud_run_runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = var.deployer_member
}

resource "google_cloud_run_v2_service" "svc" {
  name     = var.service
  location = var.region

  template {
    service_account = google_service_account.cloud_run_runtime.email

    containers {
      image = var.image

      env {
        name  = "NODE_ENV"
        value = "production"
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }
  }

  depends_on = [
    google_project_service.run,
    google_artifact_registry_repository.micro_commerce,
    google_service_account_iam_member.deployer_act_as_runtime,
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
