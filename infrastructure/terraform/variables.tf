variable "subscription_id" { type = string }
variable "name" {
  type = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9]{4,16}$", var.name))
    error_message = "Use 5–17 lowercase letters/digits beginning with a letter."
  }
}
variable "location" { type = string }
variable "entra_admin_object_id" { type = string }
variable "entra_admin_name" { type = string }
variable "entra_admin_type" {
  type    = string
  default = "Group"
}
variable "deploy_applications" {
  type    = bool
  default = false
}
variable "api_image" {
  type     = string
  default  = null
  nullable = true
}
variable "web_image" {
  type     = string
  default  = null
  nullable = true
}
variable "entra_authority" {
  type    = string
  default = null
}
variable "entra_audience" {
  type    = string
  default = null
}
variable "entra_web_client_id" {
  type    = string
  default = null
}
variable "entra_api_scope" {
  type    = string
  default = null
}
variable "enable_operational_telemetry" {
  type    = bool
  default = false
}
