variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "service_name" {
  type    = string
  default = "orders"
}

variable "image" {
  type = string
}

variable "runtime_service_account_email" {
  type    = string
  default = ""
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "redis_host" {
  type = string
}

variable "redis_port" {
  type    = string
  default = "6379"
}

variable "redis_username" {
  type    = string
  default = ""
}

variable "redis_password" {
  type      = string
  default   = ""
  sensitive = true
}

variable "min_instance_count" {
  type    = number
  default = 0
}

variable "max_instance_count" {
  type    = number
  default = 2
}

variable "public_invoker" {
  type    = bool
  default = true
}
