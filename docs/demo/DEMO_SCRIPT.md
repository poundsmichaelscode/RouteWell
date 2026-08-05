# RouteWell demo video script

Target length: 6–8 minutes.

1. **Business problem:** Explain that RouteWell replaces delivery spreadsheets and disconnected fleet records.
2. **Architecture:** Show `infrastructure/diagrams/architecture.mmd` and explain the public gateway/private tiers.
3. **Local health:** Show `docker compose ps`, `/healthz` and `/api/health`.
4. **Authentication:** Sign in as the seeded administrator and explain HTTP-only cookies, refresh rotation and CSRF.
5. **Operations:** Create a customer, driver, vehicle, route and delivery.
6. **Tracking:** Assign a driver, change delivery status and open the immutable event timeline.
7. **Analytics:** Show the dashboard, report export and notifications.
8. **Administration:** Change a role, explain immediate role revalidation and show system monitoring.
9. **API:** Open Swagger UI and show one validated endpoint.
10. **DevOps:** Show Dockerfiles, Compose networks, Terraform NSGs, CI/CD and security workflows.
11. **Failure exercise:** Stop PostgreSQL and show the readiness failure, then restore it.
12. **Trade-offs:** Explain why VMs were chosen for learning and why managed PostgreSQL/container platforms are the commercial evolution.

Never show real secrets, `.env`, private keys, access tokens or GitHub secret values in the recording.
