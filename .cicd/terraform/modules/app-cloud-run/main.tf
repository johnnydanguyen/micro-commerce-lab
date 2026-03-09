resource "google_cloud_run_v2_service" "this" {
  name     = var.service_name
  location = var.region

  template {
    service_account = var.runtime_service_account_email != "" ? var.runtime_service_account_email : null

    containers {
      image = var.image

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }
    }

    scaling {
      min_instance_count = var.min_instance_count
      max_instance_count = var.max_instance_count
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  count    = var.public_invoker ? 1 : 0
  name     = google_cloud_run_v2_service.this.name
  location = google_cloud_run_v2_service.this.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
