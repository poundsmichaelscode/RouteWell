resource "azurerm_network_interface" "vm" {
  for_each = local.vm_definitions

  name                = "nic-${local.name_prefix}-${each.key}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = each.value.subnet_id
    private_ip_address_allocation = "Static"
    private_ip_address            = each.value.private_ip
  }

  tags = local.tags
}

resource "azurerm_linux_virtual_machine" "vm" {
  for_each = local.vm_definitions

  name                            = "vm-${local.name_prefix}-${each.key}"
  computer_name                   = "rw-${each.key}"
  location                        = azurerm_resource_group.main.location
  resource_group_name             = azurerm_resource_group.main.name
  size                            = each.value.size
  admin_username                  = var.admin_username
  network_interface_ids           = [azurerm_network_interface.vm[each.key].id]
  disable_password_authentication = true
  secure_boot_enabled             = true
  vtpm_enabled                    = true

  identity {
    type = "SystemAssigned"
  }

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  os_disk {
    name                 = "osdisk-${local.name_prefix}-${each.key}"
    caching              = "ReadWrite"
    storage_account_type = each.key == "db" ? "Premium_LRS" : "StandardSSD_LRS"
    disk_size_gb         = each.key == "db" ? 64 : 32
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = "server"
    version   = "latest"
  }

  custom_data = base64encode(templatefile("${path.module}/cloud-init/docker.yaml", {
    tier           = each.key
    admin_username = var.admin_username
  }))

  boot_diagnostics {}

  tags = merge(local.tags, { tier = each.key })
}

resource "azurerm_role_assignment" "vm_key_vault" {
  for_each = azurerm_linux_virtual_machine.vm

  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = each.value.identity[0].principal_id
}

resource "azurerm_role_assignment" "cicd_key_vault" {
  count = var.cicd_principal_object_id == "" ? 0 : 1

  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets Officer"
  principal_id         = var.cicd_principal_object_id
}
