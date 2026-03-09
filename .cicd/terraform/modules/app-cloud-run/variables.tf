variable "service_name" {
  type = string
}

variable "region" {
  type = string
}

variable "image" {
  type = string
}

variable "runtime_service_account_email" {
  type    = string
  default = ""
}

variable "env_vars" {
  type = map(string)
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
