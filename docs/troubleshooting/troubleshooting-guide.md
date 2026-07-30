# Troubleshooting guide

## `EADDRINUSE: 8080`

```bash
sudo lsof -iTCP:8080 -sTCP:LISTEN
sudo ss -lntp | grep :8080
docker ps --filter publish=8080
```

Stop the old process or container; do not randomly change production ports without updating NSGs, probes and Compose files.

## Backend cannot reach PostgreSQL

1. Confirm the DB container is healthy.
2. From app VM run `nc -vz 10.10.3.10 5432`.
3. Inspect effective NSG rules on both app and DB NICs.
4. Verify the Key Vault database URL without exposing its password.
5. Check Prisma migration status.

## Application Gateway unhealthy backend

- Confirm web VM NGINX returns `200` at `/healthz`.
- Confirm the gateway probe uses HTTP port 80 and the web private IP.
- Inspect backend health in Application Gateway.
- Review WAF and access logs in Log Analytics.

## Login succeeds but mutations return 403

Check that the `csrfToken` cookie exists and Axios sends `x-csrf-token`. Also verify the user's RBAC role permits the operation.

## Docker pull denied

Confirm `routewell-ghcr-username` and `routewell-ghcr-token` exist in Key Vault, the VM managed identity can read them, and the token has `read:packages` permission for private images.

## Migration failure

```bash
docker compose -f infrastructure/docker/compose.app.yml logs backend
# From a controlled admin shell with DATABASE_URL set:
npx prisma migrate status --schema database/prisma/schema.prisma
```

Never run `prisma migrate reset` against production.
