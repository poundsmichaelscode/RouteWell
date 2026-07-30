# Git workflow

1. Create an issue with acceptance criteria.
2. Branch from `develop`: `feature/RW-123-delivery-filter`.
3. Commit small, reviewable changes using Conventional Commits.
4. Open a pull request to `develop`.
5. Require CI, security checks and one approval.
6. Promote a tested release pull request from `develop` to `main`.
7. Tag releases using semantic versioning, for example `v1.0.0`.

Recommended branch protection: no direct pushes, no force pushes, signed commits where practical, required status checks, required review, conversation resolution and environment approval for production.
