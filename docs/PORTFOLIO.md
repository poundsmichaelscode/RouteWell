# Presenting RouteWell in interviews

## One-minute explanation

RouteWell is a full-stack logistics platform I designed as a secure three-tier Azure workload. A Next.js web tier proxies requests to a private Express API, which uses Prisma with a private PostgreSQL database and Redis cache. I implemented rotating refresh sessions, CSRF, RBAC, validation, audit logs, structured observability, Docker hardening, Terraform, GitHub Actions, Key Vault managed identity, Application Gateway WAF, Log Analytics and failure runbooks.

## Demonstration flow

1. Show the architecture and network diagram.
2. Run the local stack and log in with seed data.
3. Create operational resources and a delivery.
4. Show status history, dashboard cache and API docs.
5. Open CI/CD and Terraform code.
6. Explain why the database has no public access.
7. Demonstrate a failure simulation and the readiness signal.

## Trade-offs to discuss

- VMs were selected to demonstrate host-level DevOps and subnet controls; managed container services reduce operations overhead.
- PostgreSQL on a VM demonstrates private networking and backups, while Azure Database for PostgreSQL is the preferred commercial managed service.
- The included refresh-token design is suitable for this portfolio; enterprise SSO and MFA should use Microsoft Entra ID or another mature identity provider.
- Strict outbound control requires Azure Firewall/NAT and explicit egress rules, which are a documented next step.
