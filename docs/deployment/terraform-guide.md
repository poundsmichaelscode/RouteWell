# Terraform guide

## Prerequisites

- Terraform 1.15.x
- Azure CLI authenticated with `az login`
- An Azure subscription and permission to create networking, compute, Key Vault, monitoring and role assignments
- An SSH public key

## Remote state

Create a dedicated resource group, storage account and private blob container for state, then uncomment the `backend "azurerm" {}` block in `versions.tf`.

```bash
terraform -chdir=infrastructure/terraform init \
  -backend-config=backend.hcl
```

Never commit `.tfvars`, state files or state access keys.

## Plan and apply

```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars
terraform fmt -recursive
terraform init
terraform validate
terraform plan -out routewell.tfplan
terraform apply routewell.tfplan
terraform output
```

## HTTPS

For a real domain, import a trusted certificate into Azure Key Vault, grant the Application Gateway user-assigned identity access, set `enable_https = true`, and provide the certificate's **versionless secret ID** through `ssl_certificate_key_vault_secret_id`. Do not commit certificate material or Terraform variable files containing secret identifiers.

## Destroy

```bash
terraform destroy
```

Key Vault purge protection intentionally prevents immediate permanent deletion. This is a security control, not an error.
