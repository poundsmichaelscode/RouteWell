# End-to-end deployment

## 1. Prepare the repository

```bash
git init
git add .
git commit -m "feat: initialize RouteWell enterprise platform"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

Create `develop`, protect `main`, and configure pull-request rules described in `docs/BRANCHING.md`.

## 2. Run locally

```bash
cp .env.example .env
docker compose up --build -d
docker compose exec backend npm run prisma:seed:prod
curl http://localhost/healthz
```

Open `http://localhost` and sign in with the local seed account.

## 3. Create Azure identity for GitHub OIDC

Create an Entra application/service principal, configure a federated credential for your GitHub production environment, and grant only the resource-group and Key Vault roles required by the pipeline. Store identifiers—not a client secret—as GitHub secrets.

## 4. Create remote Terraform state

Create a separate state resource group and storage account, enable blob versioning and soft delete, and restrict access with Azure RBAC. Configure `backend.hcl` from the example.

## 5. Provision infrastructure

```bash
export TF_VAR_admin_ssh_public_key="$(cat ~/.ssh/id_ed25519.pub)"
terraform -chdir=infrastructure/terraform init -backend-config=backend.hcl
terraform -chdir=infrastructure/terraform plan -out routewell.tfplan
terraform -chdir=infrastructure/terraform apply routewell.tfplan
```

## 6. Configure GitHub production environment

Add the secrets and variables listed in `cicd-guide.md`. Require reviewer approval for the `production` environment.

## 7. Configure DNS and TLS

Create an `A` record pointing your domain to the Application Gateway public IP. Import a trusted certificate into Key Vault, set `enable_https = true` and `ssl_certificate_key_vault_secret_id` to the versionless secret ID, then apply Terraform. Verify the certificate chain, hostname, listener and HTTP-to-HTTPS redirect.

## 8. Deploy

Push to `main` or manually run **Build and deploy**. The pipeline publishes images, updates Key Vault, deploys DB → app → web, applies Prisma migrations during backend startup, and performs health checks.

## 9. Verify

```bash
curl -I https://your-domain.example/healthz
curl https://your-domain.example/api/health
```

Use Azure Portal to inspect Application Gateway backend health, Log Analytics, VM metrics and alerts. Test network boundaries from the web and app VMs.

## 10. Back up and restore

Schedule `backup-db.sh` through systemd or migrate to Azure Backup/managed PostgreSQL backups. Copy encrypted backups to a separate storage account and document a tested restore procedure.
