resource "azurerm_public_ip" "gateway" {
  name                = "pip-${local.name_prefix}-gateway"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  zones               = ["1", "2", "3"]
  tags                = local.tags
}

resource "azurerm_user_assigned_identity" "gateway" {
  name                = "id-${local.name_prefix}-gateway"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tags                = local.tags
}

resource "azurerm_role_assignment" "gateway_certificate" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.gateway.principal_id
}

resource "azurerm_web_application_firewall_policy" "main" {
  name                = "waf-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  policy_settings {
    enabled                     = true
    mode                        = "Prevention"
    request_body_check          = true
    max_request_body_size_in_kb = 128
    file_upload_limit_in_mb     = 20
  }

  managed_rules {
    managed_rule_set {
      type    = "OWASP"
      version = "3.2"
    }
  }

  tags = local.tags
}

resource "azurerm_application_gateway" "main" {
  name                = "agw-${local.name_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  firewall_policy_id  = azurerm_web_application_firewall_policy.main.id
  enable_http2        = true

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.gateway.id]
  }

  sku {
    name = "WAF_v2"
    tier = "WAF_v2"
  }

  autoscale_configuration {
    min_capacity = 1
    max_capacity = 2
  }

  gateway_ip_configuration {
    name      = "gateway-ip"
    subnet_id = azurerm_subnet.gateway.id
  }

  frontend_ip_configuration {
    name                 = "public-frontend"
    public_ip_address_id = azurerm_public_ip.gateway.id
  }

  frontend_port {
    name = "http"
    port = 80
  }

  frontend_port {
    name = "https"
    port = 443
  }

  dynamic "ssl_certificate" {
    for_each = var.enable_https ? [1] : []
    content {
      name                = "routewell-tls"
      key_vault_secret_id = var.ssl_certificate_key_vault_secret_id
    }
  }

  backend_address_pool {
    name         = "web-pool"
    ip_addresses = [local.web_private_ip]
  }

  backend_http_settings {
    name                  = "web-http"
    cookie_based_affinity = "Disabled"
    port                  = 80
    protocol              = "Http"
    request_timeout       = 30
    probe_name            = "web-probe"
  }

  probe {
    name                                      = "web-probe"
    protocol                                  = "Http"
    host                                      = "127.0.0.1"
    path                                      = "/healthz"
    interval                                  = 30
    timeout                                   = 10
    unhealthy_threshold                       = 3
    pick_host_name_from_backend_http_settings = false

    match {
      status_code = ["200-399"]
    }
  }

  http_listener {
    name                           = "http-listener"
    frontend_ip_configuration_name = "public-frontend"
    frontend_port_name             = "http"
    protocol                       = "Http"
  }

  dynamic "http_listener" {
    for_each = var.enable_https ? [1] : []
    content {
      name                           = "https-listener"
      frontend_ip_configuration_name = "public-frontend"
      frontend_port_name             = "https"
      protocol                       = "Https"
      ssl_certificate_name           = "routewell-tls"
    }
  }

  dynamic "redirect_configuration" {
    for_each = var.enable_https ? [1] : []
    content {
      name                 = "https-redirect"
      redirect_type        = "Permanent"
      target_listener_name = "https-listener"
      include_path         = true
      include_query_string = true
    }
  }

  dynamic "request_routing_rule" {
    for_each = var.enable_https ? [] : [1]
    content {
      name                       = "http-web-rule"
      rule_type                  = "Basic"
      priority                   = 100
      http_listener_name         = "http-listener"
      backend_address_pool_name  = "web-pool"
      backend_http_settings_name = "web-http"
    }
  }

  dynamic "request_routing_rule" {
    for_each = var.enable_https ? [1] : []
    content {
      name                        = "http-redirect-rule"
      rule_type                   = "Basic"
      priority                    = 100
      http_listener_name          = "http-listener"
      redirect_configuration_name = "https-redirect"
    }
  }

  dynamic "request_routing_rule" {
    for_each = var.enable_https ? [1] : []
    content {
      name                       = "https-web-rule"
      rule_type                  = "Basic"
      priority                   = 110
      http_listener_name         = "https-listener"
      backend_address_pool_name  = "web-pool"
      backend_http_settings_name = "web-http"
    }
  }

  lifecycle {
    precondition {
      condition     = !var.enable_https || var.ssl_certificate_key_vault_secret_id != ""
      error_message = "ssl_certificate_key_vault_secret_id is required when enable_https is true."
    }
  }

  tags = local.tags

  depends_on = [
    azurerm_linux_virtual_machine.vm,
    azurerm_role_assignment.gateway_certificate
  ]
}

resource "azurerm_public_ip" "bastion" {
  count = var.enable_bastion ? 1 : 0

  name                = "pip-${local.name_prefix}-bastion"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  allocation_method   = "Static"
  sku                 = "Standard"
  tags                = local.tags
}

resource "azurerm_bastion_host" "main" {
  count = var.enable_bastion ? 1 : 0

  name                = "bas-${local.name_prefix}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                 = "configuration"
    subnet_id            = azurerm_subnet.bastion.id
    public_ip_address_id = azurerm_public_ip.bastion[0].id
  }

  tags = local.tags
}
