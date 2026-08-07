# Phase 6 — GitHub, Branching and CI

## Goal

Turn the working local RouteWell MVP into a controlled GitHub engineering
workflow without enabling production deployment before Azure is ready.

## Repository model

`main` is stable and releasable. `develop` is the integration branch.
Short-lived feature/fix/chore/docs branches are created from `develop`.

Flow:

```text
feature/* ─┐
fix/* ─────┼──> develop ──PR──> main
chore/* ───┤
docs/* ────┘
```

## CI checks

Pull requests into `develop` or `main` run:

- backend install, Prisma generation, lint, tests, OpenAPI check and TypeScript build;
- frontend install, lint, tests and Next.js production build;
- Terraform format/init/validate and Compose validation;
- backend and frontend Docker image builds;
- CodeQL;
- Trivy filesystem scanning.

Automatic Azure CD is intentionally disabled until Phase 12.

## Recommended `main` ruleset

Target the default branch and enable:

- require a pull request before merging;
- require one approval (for a solo portfolio, temporarily use zero if GitHub
  does not allow self-approval);
- dismiss stale approvals;
- require conversation resolution;
- require status checks:
  - `Backend quality`
  - `Frontend quality`
  - `Infrastructure validation`
  - `Container build`
  - `CodeQL`
  - `Trivy filesystem`
- require the branch to be up to date before merging;
- block force pushes;
- block branch deletion.

For `develop`, require the four CI checks and block force pushes.

## Release workflow

1. feature branch -> PR to `develop`;
2. CI/security passes;
3. merge feature PR;
4. when a release is ready, PR `develop` -> `main`;
5. required checks pass again;
6. merge to `main`;
7. tag the release, for example `v0.1.0`.

## Phase 6 completion criteria

- GitHub repository created and remote configured;
- both `main` and `develop` exist remotely;
- no `.env` or secrets are tracked;
- CI and security workflows pass;
- ruleset/branch protection is active;
- at least one feature branch is merged by PR;
- a `v0.1.0` tag can be created after the release PR.
