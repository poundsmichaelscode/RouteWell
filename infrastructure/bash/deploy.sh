#!/usr/bin/env bash
set -Eeuo pipefail

# End-to-end deployment orchestrator. It provisions Azure with Terraform and
# deploys each private VM with Azure Run Command. Required environment:
# TF_VAR_admin_ssh_public_key, REPO_URL, IMAGE_PREFIX.
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
TF_DIR="$ROOT/infrastructure/terraform"
: "${REPO_URL:?Set REPO_URL, for example https://github.com/owner/routewell.git}"
: "${IMAGE_PREFIX:?Set IMAGE_PREFIX, for example ghcr.io/owner/routewell}"
IMAGE_TAG=${IMAGE_TAG:-latest}
REF=${REF:-main}

command -v az >/dev/null || { echo "Azure CLI is required" >&2; exit 1; }
command -v terraform >/dev/null || { echo "Terraform is required" >&2; exit 1; }
az account show >/dev/null

terraform -chdir="$TF_DIR" init
terraform -chdir="$TF_DIR" fmt -check -recursive
terraform -chdir="$TF_DIR" validate
terraform -chdir="$TF_DIR" apply -auto-approve

RG=$(terraform -chdir="$TF_DIR" output -raw resource_group_name)
KV=$(terraform -chdir="$TF_DIR" output -raw key_vault_name)
WEB_VM=$(terraform -chdir="$TF_DIR" output -raw web_vm_name)
APP_VM=$(terraform -chdir="$TF_DIR" output -raw app_vm_name)
DB_VM=$(terraform -chdir="$TF_DIR" output -raw db_vm_name)
APP_IP=$(terraform -chdir="$TF_DIR" output -raw app_private_ip)
PUBLIC_URL=$(terraform -chdir="$TF_DIR" output -raw application_url)
SCRIPT="$ROOT/infrastructure/bash/deploy-tier.sh"

invoke() {
  local vm=$1 tier=$2
  az vm run-command invoke -g "$RG" -n "$vm" --command-id RunShellScript --scripts "@$SCRIPT" --parameters \
    "tier=$tier" "repo_url=$REPO_URL" "ref=$REF" "key_vault=$KV" "image_prefix=$IMAGE_PREFIX" "image_tag=$IMAGE_TAG" "app_ip=$APP_IP" "public_url=$PUBLIC_URL" --only-show-errors
}
invoke "$DB_VM" db
invoke "$APP_VM" app
invoke "$WEB_VM" web
"$ROOT/infrastructure/bash/health-check.sh" "$PUBLIC_URL"
