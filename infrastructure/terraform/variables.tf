variable "project_name" {
  type    = string
  default = "routewell"
}

variable "environment" {
  type    = string
  default = "prod"
}

variable "location" {
  type    = string
  default = "West Europe"
}

variable "resource_group_name" {
  type    = string
  default = "rg-routewell-prod"
}

variable "admin_username" {
  type    = string
  default = "azureadmin"
}

variable "admin_ssh_public_key" {
  type      = string
  sensitive = true
}

variable "web_vm_size" {
  type    = string
  default = "Standard_B2s"
}

variable "app_vm_size" {
  type    = string
  default = "Standard_B2s"
}

variable "db_vm_size" {
  type    = string
  default = "Standard_B2ms"
}

variable "enable_bastion" {
  type    = bool
  default = false
}

variable "enable_https" {
  type        = bool
  default     = false
  description = "Enable the HTTPS listener. Supply ssl_certificate_key_vault_secret_id when true."
}

variable "ssl_certificate_key_vault_secret_id" {
  type        = string
  default     = ""
  description = "Versionless Key Vault secret ID for an imported PFX certificate."
}

variable "alert_email" {
  type    = string
  default = ""
}

variable "cicd_principal_object_id" {
  type        = string
  default     = ""
  description = "Optional object ID for the GitHub OIDC service principal."
}

variable "tags" {
  type = map(string)
  default = {
    application = "RouteWell"
    managed_by  = "Terraform"
    workload    = "portfolio"
  }
}
