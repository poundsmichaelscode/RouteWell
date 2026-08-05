# Validation record

## Static validation completed in the artifact environment

The following checks pass through `make validate`:

- JSON parsing.
- YAML parsing for Compose, GitHub Actions, monitoring and Dependabot.
- Bash syntax for every shell script.
- TypeScript and TSX parser validation.
- Local and `@/` import target resolution.
- Required runtime file checks.
- Dockerfile cache and lockfile-aware install policy.
- Required-secret policy in local Compose.
- Azure subnet overlap detection.
- Terraform lexical structure.
- Relative Markdown links.
- Secret-bearing/generated artifact hygiene.
- Docker Compose expansion when a Docker CLI is available.


The captured artifact-time output is available in [`STATIC_VALIDATION.txt`](STATIC_VALIDATION.txt).

## Runtime gates included in the repository

`make validate-full` and GitHub Actions perform the dependency-enabled checks:

1. Install backend and frontend packages.
2. Generate Prisma Client.
3. Run ESLint.
4. Run backend and frontend tests.
5. Compile the TypeScript backend.
6. Produce the Next.js standalone build.
7. Validate Compose and build both container images.
8. Run `terraform fmt`, provider initialization and `terraform validate` when Terraform is installed.
9. Run CodeQL and Trivy in the security workflow.
10. Run post-deployment health checks in CD.

## Environment limitation

The artifact environment does not expose a Docker daemon or Terraform binary and cannot resolve the public npm registry. It therefore cannot honestly execute dependency installation, semantic compilation against installed package types, live containers, migrations, or provider-backed Terraform validation.

To complete those runtime checks after extraction:

```bash
make init
make lock
make validate-full
```

For the exact production-like local path:

```bash
docker compose --progress=plain build frontend
docker compose --progress=plain build backend
docker compose up -d
make seed
./infrastructure/bash/health-check.sh http://localhost
```

Do not treat static validation as a substitute for CI, container health checks, database migration testing or Terraform planning against your Azure subscription.
