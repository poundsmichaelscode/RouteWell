# Validation record

This generated repository received repository-wide static validation before packaging.

## Passed in the generation environment

- JSON parsing for every JSON file.
- YAML parsing for GitHub Actions, Docker Compose and monitoring configuration.
- Bash syntax validation with `bash -n` for every shell script.
- TypeScript and TSX parser validation for backend, frontend and tests.
- Terraform lexical validation for balanced blocks, collections, strings and heredocs.
- Relative Markdown link validation.
- Secret-pattern hygiene scan.

## CI validation provided by the repository

The GitHub Actions workflows perform the checks that require downloadable dependencies or cloud provider schemas:

- `npm install`, lint, unit tests and production builds for frontend/backend.
- Prisma Client generation and OpenAPI publication check.
- `terraform fmt`, `terraform init -backend=false` and `terraform validate`.
- Docker image builds.
- CodeQL and Trivy scanning.
- Image publication with SBOM and provenance.
- Post-deployment public health checks.

## Environment limitation

The artifact-generation environment could not resolve the public npm registry and did not contain Docker or Terraform. Dependency installation, full semantic TypeScript compilation, container startup and provider-backed Terraform validation were therefore not run locally. Those checks are deliberately encoded as required CI gates and must pass before merging to `main` or deploying.

Run locally after extraction:

```bash
cp .env.example .env
npm run install:all
npm run lint
npm test
npm run build
docker compose config
docker compose up --build -d
```

Run Terraform validation:

```bash
terraform -chdir=infrastructure/terraform fmt -recursive
terraform -chdir=infrastructure/terraform init -backend=false
terraform -chdir=infrastructure/terraform validate
```

Commit the generated `.terraform.lock.hcl` and npm lockfiles after the first trusted dependency installation so future builds can switch from `npm install` to `npm ci`.
