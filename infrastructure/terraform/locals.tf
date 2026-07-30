locals {
  name_prefix  = "${var.project_name}-${var.environment}"
  address_space = "10.10.0.0/16"
  tags          = merge(var.tags, { environment = var.environment })

  subnets = {
    gateway = "10.10.0.0/24"
    web     = "10.10.1.0/27"
    app     = "10.10.2.0/27"
    db      = "10.10.3.0/28"
    bastion = "10.10.5.0/26"
  }

  web_private_ip = "10.10.1.10"
  app_private_ip = "10.10.2.10"
  db_private_ip  = "10.10.3.10"

  vm_definitions = {
    web = {
      size       = var.web_vm_size
      subnet_id  = azurerm_subnet.web.id
      private_ip = local.web_private_ip
    }
    app = {
      size       = var.app_vm_size
      subnet_id  = azurerm_subnet.app.id
      private_ip = local.app_private_ip
    }
    db = {
      size       = var.db_vm_size
      subnet_id  = azurerm_subnet.db.id
      private_ip = local.db_private_ip
    }
  }

  tier_nsgs = {
    web = azurerm_network_security_group.web.name
    app = azurerm_network_security_group.app.name
    db  = azurerm_network_security_group.db.name
  }
}
