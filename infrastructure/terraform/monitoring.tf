resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${local.name_prefix}-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = local.tags
}

resource "azurerm_monitor_data_collection_rule" "linux" {
  name                = "dcr-${local.name_prefix}-linux"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location

  destinations {
    log_analytics {
      workspace_resource_id = azurerm_log_analytics_workspace.main.id
      name                  = "log-analytics"
    }
  }

  data_flow {
    streams      = ["Microsoft-Perf", "Microsoft-Syslog"]
    destinations = ["log-analytics"]
  }

  data_sources {
    performance_counter {
      name                          = "routewell-performance"
      streams                       = ["Microsoft-Perf"]
      sampling_frequency_in_seconds = 60
      counter_specifiers = [
        "\\Processor(_Total)\\% Processor Time",
        "\\Memory\\Available MBytes",
        "\\LogicalDisk(*)\\% Free Space",
        "\\Network Interface(*)\\Bytes Total/sec"
      ]
    }

    syslog {
      name           = "routewell-syslog"
      streams        = ["Microsoft-Syslog"]
      facility_names = ["*"]
      log_levels     = ["*"]
    }
  }

  tags = local.tags
}

resource "azurerm_virtual_machine_extension" "ama" {
  for_each = azurerm_linux_virtual_machine.vm

  name                      = "AzureMonitorLinuxAgent"
  virtual_machine_id        = each.value.id
  publisher                 = "Microsoft.Azure.Monitor"
  type                      = "AzureMonitorLinuxAgent"
  type_handler_version      = "1.0"
  automatic_upgrade_enabled = true
}

resource "azurerm_monitor_data_collection_rule_association" "vm" {
  for_each = azurerm_linux_virtual_machine.vm

  name                    = "dcra-${each.key}"
  target_resource_id      = each.value.id
  data_collection_rule_id = azurerm_monitor_data_collection_rule.linux.id

  depends_on = [azurerm_virtual_machine_extension.ama]
}

resource "azurerm_monitor_action_group" "operations" {
  name                = "ag-${local.name_prefix}-ops"
  resource_group_name = azurerm_resource_group.main.name
  short_name          = "rw-ops"

  dynamic "email_receiver" {
    for_each = var.alert_email == "" ? [] : [var.alert_email]
    content {
      name          = "operations"
      email_address = email_receiver.value
    }
  }

  tags = local.tags
}

resource "azurerm_monitor_metric_alert" "cpu" {
  for_each = azurerm_linux_virtual_machine.vm

  name                = "alert-${each.key}-cpu-high"
  resource_group_name = azurerm_resource_group.main.name
  scopes              = [each.value.id]
  description         = "CPU usage above 85% for RouteWell ${each.key} VM."
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Compute/virtualMachines"
    metric_name      = "Percentage CPU"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.operations.id
  }

  tags = local.tags
}

resource "azurerm_monitor_diagnostic_setting" "gateway" {
  name                       = "send-to-log-analytics"
  target_resource_id         = azurerm_application_gateway.main.id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category_group = "allLogs"
  }

  enabled_metric {
    category = "AllMetrics"
  }
}
