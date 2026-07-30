#!/usr/bin/env bash
set -Eeuo pipefail

# Learning-only Azure CLI path that mirrors the Terraform network. Terraform is
# the source of truth for repeatable production infrastructure.
LOCATION=${LOCATION:-westeurope}
RG=${RG:-rg-routewell-lab}
VNET=${VNET:-vnet-routewell-lab}
ADMIN_USER=${ADMIN_USER:-azureadmin}
SSH_KEY=${SSH_KEY:-$HOME/.ssh/id_ed25519.pub}
APPGW_PIP=${APPGW_PIP:-pip-routewell-lab-gateway}

[[ -f "$SSH_KEY" ]] || { echo "SSH public key not found: $SSH_KEY" >&2; exit 1; }
az account show >/dev/null

az group create -n "$RG" -l "$LOCATION" --tags application=RouteWell environment=lab managed_by=AzureCLI -o none
az network vnet create -g "$RG" -n "$VNET" --address-prefix 10.10.0.0/16 \
  --subnet-name ApplicationGatewaySubnet --subnet-prefix 10.10.0.0/24 -o none
az network vnet subnet create -g "$RG" --vnet-name "$VNET" -n snet-web --address-prefixes 10.10.1.0/27 -o none
az network vnet subnet create -g "$RG" --vnet-name "$VNET" -n snet-app --address-prefixes 10.10.2.0/27 -o none
az network vnet subnet create -g "$RG" --vnet-name "$VNET" -n snet-db --address-prefixes 10.10.3.0/28 -o none
az network vnet subnet create -g "$RG" --vnet-name "$VNET" -n AzureBastionSubnet --address-prefixes 10.10.5.0/26 -o none

for tier in web app db; do az network nsg create -g "$RG" -n "nsg-routewell-$tier" -o none; done
az network nsg rule create -g "$RG" --nsg-name nsg-routewell-web -n Allow-AppGateway-HTTP --priority 100 \
  --source-address-prefixes 10.10.0.0/24 --destination-port-ranges 80 --access Allow --protocol Tcp -o none
az network nsg rule create -g "$RG" --nsg-name nsg-routewell-app -n Allow-Web-API --priority 100 \
  --source-address-prefixes 10.10.1.0/27 --destination-port-ranges 8080 --access Allow --protocol Tcp -o none
az network nsg rule create -g "$RG" --nsg-name nsg-routewell-db -n Allow-App-PostgreSQL --priority 100 \
  --source-address-prefixes 10.10.2.0/27 --destination-port-ranges 5432 --access Allow --protocol Tcp -o none

for tier in web app db; do
  az network vnet subnet update -g "$RG" --vnet-name "$VNET" -n "snet-$tier" --network-security-group "nsg-routewell-$tier" -o none
done

create_vm() {
  local tier=$1 ip=$2 size=$3
  az network nic create -g "$RG" -n "nic-routewell-$tier" --vnet-name "$VNET" --subnet "snet-$tier" \
    --private-ip-address "$ip" --network-security-group "nsg-routewell-$tier" -o none
  az vm create -g "$RG" -n "vm-routewell-$tier" --nics "nic-routewell-$tier" --image Ubuntu2404 \
    --size "$size" --admin-username "$ADMIN_USER" --ssh-key-values "$SSH_KEY" --public-ip-address "" \
    --security-type TrustedLaunch --enable-secure-boot true --enable-vtpm true -o none
}
create_vm web 10.10.1.10 Standard_B2s
create_vm app 10.10.2.10 Standard_B2s
create_vm db 10.10.3.10 Standard_B2ms

az network public-ip create -g "$RG" -n "$APPGW_PIP" --sku Standard --allocation-method Static -o none
az network application-gateway create -g "$RG" -n agw-routewell-lab -l "$LOCATION" --sku WAF_v2 \
  --capacity 1 --vnet-name "$VNET" --subnet ApplicationGatewaySubnet --public-ip-address "$APPGW_PIP" \
  --servers 10.10.1.10 --http-settings-port 80 --http-settings-protocol Http --frontend-port 80 -o none

echo "Manual lab created. Add WAF policy, HTTPS certificate, Bastion, Key Vault and monitoring through Terraform for the complete design."
