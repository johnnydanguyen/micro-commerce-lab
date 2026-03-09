output "artifact_registry_repository_url" {
  value = module.artifact_registry.repository_url
}

output "runtime_service_account_email" {
  value = google_service_account.runtime.email
}
