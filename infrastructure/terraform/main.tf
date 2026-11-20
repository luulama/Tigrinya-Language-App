data "azurerm_client_config" "current" {}
resource "azurerm_resource_group" "core" {
  name     = "${var.name}-rg"
  location = var.location
}
resource "azurerm_user_assigned_identity" "runtime" {
  name                = "${var.name}-runtime"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
}
resource "azurerm_user_assigned_identity" "migration" {
  name                = "${var.name}-migration"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
}
resource "azurerm_container_registry" "core" {
  name                = "${var.name}acr"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
  sku                 = "Basic"
  admin_enabled       = false
}
resource "azurerm_role_assignment" "pull_runtime" {
  scope                = azurerm_container_registry.core.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.runtime.principal_id
}
resource "azurerm_role_assignment" "pull_migration" {
  scope                = azurerm_container_registry.core.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.migration.principal_id
}
resource "azurerm_storage_account" "content" {
  name                            = "${var.name}content"
  location                        = var.location
  resource_group_name             = azurerm_resource_group.core.name
  account_tier                    = "Standard"
  account_replication_type        = "ZRS"
  min_tls_version                 = "TLS1_2"
  allow_nested_items_to_be_public = false
  shared_access_key_enabled       = false
}
resource "azurerm_storage_container" "content" {
  name                  = "content"
  storage_account_id    = azurerm_storage_account.content.id
  container_access_type = "private"
}
resource "azurerm_role_assignment" "blob_runtime" {
  scope                = azurerm_storage_container.content.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azurerm_user_assigned_identity.runtime.principal_id
}
resource "azurerm_key_vault" "core" {
  name                       = "${var.name}-vault"
  location                   = var.location
  resource_group_name        = azurerm_resource_group.core.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  rbac_authorization_enabled = true
  purge_protection_enabled   = true
  soft_delete_retention_days = 90
}
resource "azurerm_virtual_network" "core" {
  name                = "${var.name}-vnet"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
  address_space       = ["10.40.0.0/16"]
}
resource "azurerm_subnet" "database" {
  name                 = "database"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = ["10.40.1.0/24"]
  delegation {
    name = "postgres"
    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}
resource "azurerm_subnet" "applications" {
  name                 = "applications"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.core.name
  address_prefixes     = ["10.40.4.0/23"]
}
resource "azurerm_private_dns_zone" "database" {
  name                = "${var.name}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.core.name
}
resource "azurerm_private_dns_zone_virtual_network_link" "database" {
  name                  = "database-vnet"
  private_dns_zone_name = azurerm_private_dns_zone.database.name
  resource_group_name   = azurerm_resource_group.core.name
  virtual_network_id    = azurerm_virtual_network.core.id
}
resource "azurerm_postgresql_flexible_server" "core" {
  name                          = "${var.name}-postgres"
  location                      = var.location
  resource_group_name           = azurerm_resource_group.core.name
  version                       = "16"
  sku_name                      = "B_Standard_B1ms"
  storage_mb                    = 32768
  backup_retention_days         = 14
  delegated_subnet_id           = azurerm_subnet.database.id
  private_dns_zone_id           = azurerm_private_dns_zone.database.id
  public_network_access_enabled = false
  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = false
    tenant_id                     = data.azurerm_client_config.current.tenant_id
  }
  depends_on = [azurerm_private_dns_zone_virtual_network_link.database]
  lifecycle { prevent_destroy = true }
}
resource "azurerm_postgresql_flexible_server_active_directory_administrator" "operator" {
  server_name         = azurerm_postgresql_flexible_server.core.name
  resource_group_name = azurerm_resource_group.core.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  object_id           = var.entra_admin_object_id
  principal_name      = var.entra_admin_name
  principal_type      = var.entra_admin_type
}
resource "azurerm_postgresql_flexible_server_database" "core" {
  name      = "polyglot"
  server_id = azurerm_postgresql_flexible_server.core.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
resource "azurerm_container_app_environment" "core" {
  name                     = "${var.name}-environment"
  location                 = var.location
  resource_group_name      = azurerm_resource_group.core.name
  infrastructure_subnet_id = azurerm_subnet.applications.id
}
locals {
  api_host             = "${var.name}-api.${azurerm_container_app_environment.core.default_domain}"
  web_host             = "${var.name}-web.${azurerm_container_app_environment.core.default_domain}"
  runtime_connection   = "Host=${azurerm_postgresql_flexible_server.core.fqdn};Database=polyglot;Username=${azurerm_user_assigned_identity.runtime.name};SSL Mode=VerifyFull;Timeout=10"
  migration_connection = "Host=${azurerm_postgresql_flexible_server.core.fqdn};Database=polyglot;Username=${azurerm_user_assigned_identity.migration.name};SSL Mode=VerifyFull;Timeout=10"
}
resource "azurerm_container_app" "api" {
  count                        = var.deploy_applications ? 1 : 0
  name                         = "${var.name}-api"
  resource_group_name          = azurerm_resource_group.core.name
  container_app_environment_id = azurerm_container_app_environment.core.id
  revision_mode                = "Single"
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.runtime.id]
  }
  registry {
    server   = azurerm_container_registry.core.login_server
    identity = azurerm_user_assigned_identity.runtime.id
  }
  template {
    min_replicas = 1
    max_replicas = 5
    container {
      name   = "api"
      image  = var.api_image
      cpu    = 0.5
      memory = "1Gi"
      dynamic "env" {
        for_each = { ASPNETCORE_ENVIRONMENT = "Production", AZURE_CLIENT_ID = azurerm_user_assigned_identity.runtime.client_id, AllowedHosts = local.api_host, "AllowedOrigins__0" = "https://${local.web_host}", "ConnectionStrings__Database" = local.runtime_connection, "Database__UseManagedIdentity" = "true", "Entra__Authority" = var.entra_authority, "Entra__Audience" = var.entra_audience, "Entra__WebClientId" = var.entra_web_client_id, "Entra__ApiScope" = var.entra_api_scope, "Storage__ServiceUri" = "${azurerm_storage_account.content.primary_blob_endpoint}content", "Telemetry__Enabled" = "false" }
        content {
          name  = env.key
          value = env.value
        }
      }
      readiness_probe {
        transport = "HTTP"
        port      = 8080
        path      = "/health/ready"
      }
      liveness_probe {
        transport = "HTTP"
        port      = 8080
        path      = "/health/live"
      }
    }
  }
  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
  depends_on = [azurerm_role_assignment.pull_runtime, azurerm_role_assignment.blob_runtime]
  lifecycle {
    precondition {
      condition     = var.api_image != null && var.entra_authority != null && var.entra_audience != null && var.entra_web_client_id != null && var.entra_api_scope != null
      error_message = "Application deployment requires real images and Entra app configuration."
    }
    ignore_changes = [template[0].container[0].image]
  }
}
resource "azurerm_container_app" "web" {
  count                        = var.deploy_applications ? 1 : 0
  name                         = "${var.name}-web"
  resource_group_name          = azurerm_resource_group.core.name
  container_app_environment_id = azurerm_container_app_environment.core.id
  revision_mode                = "Single"
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.runtime.id]
  }
  registry {
    server   = azurerm_container_registry.core.login_server
    identity = azurerm_user_assigned_identity.runtime.id
  }
  template {
    min_replicas = 1
    max_replicas = 5
    container {
      name   = "web"
      image  = var.web_image
      cpu    = 0.5
      memory = "1Gi"
    }
  }
  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
  depends_on = [azurerm_role_assignment.pull_runtime]
  lifecycle {
    precondition {
      condition     = var.web_image != null
      error_message = "Build and push the web image before application deployment."
    }
    ignore_changes = [template[0].container[0].image]
  }
}
resource "azurerm_container_app_job" "migrations" {
  count                        = var.deploy_applications ? 1 : 0
  name                         = "${var.name}-migrate"
  location                     = var.location
  resource_group_name          = azurerm_resource_group.core.name
  container_app_environment_id = azurerm_container_app_environment.core.id
  replica_timeout_in_seconds   = 600
  replica_retry_limit          = 0
  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }
  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.migration.id]
  }
  registry {
    server   = azurerm_container_registry.core.login_server
    identity = azurerm_user_assigned_identity.migration.id
  }
  template {
    container {
      name   = "migration"
      image  = var.api_image
      cpu    = 0.5
      memory = "1Gi"
      args   = ["--migrate"]
      dynamic "env" {
        for_each = { ASPNETCORE_ENVIRONMENT = "Production", AZURE_CLIENT_ID = azurerm_user_assigned_identity.migration.client_id, "ConnectionStrings__Database" = local.migration_connection, "Database__UseManagedIdentity" = "true", "Entra__Authority" = var.entra_authority, "Entra__Audience" = var.entra_audience }
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }
  depends_on = [azurerm_role_assignment.pull_migration]
  lifecycle { ignore_changes = [template[0].container[0].image] }
}
resource "azurerm_log_analytics_workspace" "operations" {
  count               = var.enable_operational_telemetry ? 1 : 0
  name                = "${var.name}-operations"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}
resource "azurerm_application_insights" "operations" {
  count               = var.enable_operational_telemetry ? 1 : 0
  name                = "${var.name}-operations"
  location            = var.location
  resource_group_name = azurerm_resource_group.core.name
  workspace_id        = azurerm_log_analytics_workspace.operations[0].id
  application_type    = "web"
}
