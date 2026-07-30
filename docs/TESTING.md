# Testing strategy

## Automated

- Backend unit/integration-style HTTP tests: Vitest + Supertest.
- Frontend component tests: Vitest + Testing Library.
- TypeScript strict compilation and ESLint.
- Docker image builds on every pull request.
- Terraform format and validation.
- Compose YAML parsing.
- CodeQL and Trivy security checks.

## Recommended additions before commercial launch

- Testcontainers for PostgreSQL/Redis repository integration tests.
- Playwright end-to-end tests for login, CRUD and delivery status transitions.
- k6 load tests for list/search/dashboard endpoints.
- OWASP ZAP baseline scanning against staging.
- Terraform policy tests with Checkov or Trivy IaC.
- Backup restore drills and chaos experiments.

## Manual acceptance checklist

1. Register and log in.
2. Create customer, driver, vehicle and route.
3. Create delivery and confirm tracking number.
4. Search the delivery.
5. Move it through permitted statuses.
6. Confirm invalid transitions return `409`.
7. Confirm viewer cannot mutate resources.
8. Confirm audit records are written.
9. Stop Redis/PostgreSQL and inspect readiness.
10. Confirm web tier cannot connect directly to port 5432.
