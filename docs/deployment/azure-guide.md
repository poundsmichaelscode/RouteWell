# Azure deployment guide

## Resource order

1. Resource group.
2. VNet and dedicated gateway/web/app/database/Bastion subnets.
3. NSGs and subnet associations.
4. Private NICs and Linux VMs.
5. Key Vault and managed-identity role assignments.
6. Application Gateway WAF v2 and public IP.
7. Log Analytics, Azure Monitor Agent, DCR, diagnostics and alerts.
8. Runtime secrets in Key Vault.
9. Database, backend and frontend container deployments.
10. DNS, trusted TLS certificate and final health validation.

## Key Vault secret names

- `routewell-postgres-password`
- `routewell-database-url`
- `routewell-jwt-access-secret`
- `routewell-jwt-refresh-secret`
- `routewell-ghcr-username`
- `routewell-ghcr-token`

The production `DATABASE_URL` uses the private database address:

```text
postgresql://routewell:<encoded-password>@10.10.3.10:5432/routewell?schema=public
```

URL-encode special characters in the password.

## Secure SSH

Enable Terraform variable `enable_bastion = true`, then connect in Azure Portal through Bastion. The VMs have no public IP addresses. The alternative `cd-ssh.yml` workflow requires a hardened self-hosted GitHub runner inside the VNet.

## Connectivity tests

From web VM:

```bash
nc -vz 10.10.2.10 8080
nc -vz 10.10.3.10 5432  # expected to fail
```

From app VM:

```bash
nc -vz 10.10.3.10 5432
curl -fsS http://127.0.0.1:8080/health/ready
```

From database VM:

```bash
docker compose -f /opt/routewell/repo/infrastructure/docker/compose.db.yml ps
ss -lntp | grep 5432
```
