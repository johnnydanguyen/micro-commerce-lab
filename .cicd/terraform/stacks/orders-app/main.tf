terraform {
  backend "gcs" {}

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

module "orders_app" {
  source                        = "../../modules/app-cloud-run"
  service_name                  = var.service_name
  region                        = var.region
  image                         = var.image
  runtime_service_account_email = var.runtime_service_account_email
  min_instance_count            = var.min_instance_count
  max_instance_count            = var.max_instance_count
  public_invoker                = var.public_invoker

  env_vars = {
    NODE_ENV       = "production"
    DATABASE_URL   = var.database_url
    REDIS_HOST     = var.redis_host
    REDIS_PORT     = var.redis_port
    REDIS_USERNAME = var.redis_username
    REDIS_PASSWORD = var.redis_password
  }
}
