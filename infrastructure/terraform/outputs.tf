output "resource_group" { value = azurerm_resource_group.core.name }
output "acr_name" { value = azurerm_container_registry.core.name }
output "acr_server" { value = azurerm_container_registry.core.login_server }
output "api_url" { value = "https://${local.api_host}" }
output "web_url" { value = "https://${local.web_host}" }
output "runtime_principal" { value = azurerm_user_assigned_identity.runtime.name }
output "migration_principal" { value = azurerm_user_assigned_identity.migration.name }
output "postgres_host" { value = azurerm_postgresql_flexible_server.core.fqdn }
