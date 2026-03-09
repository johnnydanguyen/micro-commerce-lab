variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "artifact_repository" {
  type    = string
  default = "micro-commerce"
}

variable "runtime_service_account_id" {
  type    = string
  default = "micro-commerce-lab"
}
