# Failure simulations and runbooks

Perform these exercises only in a non-production environment. Record timestamps and Azure activity-log evidence.

## 1. Block app port 8080

**Change:** Add a higher-priority app NSG deny rule for TCP 8080 from the web subnet.

**Symptoms:** Dashboard API calls return `502` or `504`; web health remains healthy; app container is healthy locally.

**Investigation:**

```bash
# Web VM
curl -v http://10.10.2.10:8080/health/live
# Azure
az network nsg rule list -g <rg> --nsg-name <app-nsg> -o table
```

**Root cause:** Network policy blocks web-to-app traffic.

**Fix:** Remove the deny rule or restore the documented allow rule. Re-test from the web VM.

**Lesson:** Separate application health from network reachability; inspect the closest trust boundary first.

## 2. Remove database access

**Change:** Disable or override the DB NSG allow rule for TCP 5432 from `10.10.2.0/27`.

**Symptoms:** `/health/live` succeeds but `/health/ready` returns `503`; backend logs contain Prisma connection errors.

**Investigation:**

```bash
# App VM
nc -vz 10.10.3.10 5432
journalctl CONTAINER_TAG=routewell-backend --since '10 minutes ago'
```

**Root cause:** App subnet cannot establish a PostgreSQL TCP connection.

**Fix:** Restore `Allow-App-PostgreSQL`, verify effective NSG rules, then re-run readiness.

**Lesson:** Readiness should include critical dependencies while liveness should not.

## 3. Misconfigure database host

**Change:** Set Key Vault secret `routewell-database-url` to an invalid host and redeploy the app tier.

**Symptoms:** Backend container repeatedly fails readiness or restarts after migration failure.

**Investigation:**

```bash
az keyvault secret show --vault-name <kv> --name routewell-database-url --query id -o tsv
docker compose -f infrastructure/docker/compose.app.yml logs backend
getent hosts <configured-host>
```

Do not print the complete secret in shared terminals or CI logs.

**Root cause:** Incorrect runtime configuration.

**Fix:** Restore the secret to `10.10.3.10`, redeploy, and confirm migrations and readiness.

**Lesson:** Validate configuration format and connectivity before replacing healthy containers.

## 4. Stop PostgreSQL

**Change:** `docker stop routewell-db-postgres-1` on the database VM.

**Symptoms:** Readiness fails, delivery mutations fail, dashboard cache may temporarily serve stale data, Azure alerts/logs show dependency errors.

**Investigation:** Check DB container state, host disk/memory, PostgreSQL logs and app readiness.

**Fix:** Start the container, verify `pg_isready`, then verify `/health/ready` from the app VM.

**Lesson:** Health probes, alert routing, backup restoration and recovery-time objectives must be tested, not assumed.
