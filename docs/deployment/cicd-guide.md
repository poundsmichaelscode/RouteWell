# CI/CD guide

## Branch workflow

- `main`: protected production branch.
- `develop`: integration branch.
- `feature/<ticket>-<description>`: short-lived work.
- Pull requests require CI, review and resolved conversations.

## CI

`.github/workflows/ci.yml` performs backend/frontend install, lint, test and build; Prisma client generation; Terraform formatting and validation; Compose YAML validation; and Docker image builds.

`.github/workflows/security.yml` runs CodeQL and Trivy on pull requests, main and a weekly schedule.

## CD

`.github/workflows/cd.yml`:

1. Builds backend and frontend OCI images.
2. Pushes SHA and `latest` tags to GHCR with provenance and SBOM metadata.
3. Authenticates to Azure with workload identity federation—no long-lived Azure password.
4. Updates protected Key Vault secrets.
5. Uses Azure VM Run Command to deploy database, app and web tiers in order.
6. Runs public health checks.

## Required GitHub secrets

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `GHCR_USERNAME`
- `GHCR_READ_TOKEN`

## Required GitHub environment variables

- `AZURE_RESOURCE_GROUP`
- `AZURE_KEY_VAULT_NAME`
- `AZURE_WEB_VM_NAME`
- `AZURE_APP_VM_NAME`
- `AZURE_DB_VM_NAME`
- `AZURE_WEB_PRIVATE_IP`
- `AZURE_APP_PRIVATE_IP`
- `AZURE_DB_PRIVATE_IP`
- `ROUTEWELL_PUBLIC_URL`
- `ROUTEWELL_COOKIE_DOMAIN`

Protect the `production` environment with required reviewers and restrict deployment branches to `main`.

## Rollback

Re-run the workflow with a known-good Git SHA as `image_tag`, or manually update the production Compose image variables and run `docker compose up -d`. Database migrations must be backward compatible; use expand-and-contract changes rather than destructive in-place changes.
