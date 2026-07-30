output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "application_gateway_public_ip" {
  value = azurerm_public_ip.gateway.ip_address
}

output "application_url" {
  value = "${var.enable_https ? "https" : "http"}://${azurerm_public_ip.gateway.ip_address}"
}

output "web_vm_name" {
  value = azurerm_linux_virtual_machine.vm["web"].name
}

output "app_vm_name" {
  value = azurerm_linux_virtual_machine.vm["app"].name
}

output "db_vm_name" {
  value = azurerm_linux_virtual_machine.vm["db"].name
}

output "web_private_ip" {
  value = local.web_private_ip
}

output "app_private_ip" {
  value = local.app_private_ip
}

output "db_private_ip" {
  value = local.db_private_ip
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "log_analytics_workspace_id" {
  value = azurerm_log_analytics_workspace.main.id
}

output "bastion_name" {
  value = var.enable_bastion ? azurerm_bastion_host.main[0].name : null
}
