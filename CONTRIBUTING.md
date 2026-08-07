# Contributing to RouteWell

RouteWell uses a lightweight GitFlow-inspired workflow suitable for a portfolio
project and a small engineering team.

## Branches

- `main` — stable, releasable code.
- `develop` — integration branch for completed work.
- `feature/<short-name>` — product/application features.
- `fix/<short-name>` — bug fixes.
- `chore/<short-name>` — maintenance, dependencies and tooling.
- `docs/<short-name>` — documentation-only changes.

Do not develop directly on `main`.

## Development workflow

1. Update `develop`.
2. Create a short-lived branch from `develop`.
3. Make focused commits.
4. Run local checks.
5. Push the branch.
6. Open a pull request into `develop`.
7. Wait for CI/security checks and review.
8. Merge after the branch is green.

A release is promoted with a pull request from `develop` into `main`.

## Commit convention

Use Conventional Commit-style messages:

- `feat: add delivery assignment workflow`
- `fix: correct refresh token rotation`
- `test: cover delivery state transitions`
- `docs: document Azure network topology`
- `ci: add container build validation`
- `chore: update dependencies`

## Local validation

Before opening a pull request:

```bash
npm --prefix backend run lint
npm --prefix backend test
npm --prefix backend run build

npm --prefix frontend run lint
npm --prefix frontend test
npm --prefix frontend run build

cp .env.example .env
docker compose config --quiet
rm -f .env
```

Never commit `.env`, private keys, access tokens, Terraform state, database
backups, or generated credentials.
