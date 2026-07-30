# RouteWell requirements

## Business objective

RouteWell gives delivery companies a single operational system for customers, drivers, vehicles, reusable routes, deliveries, status events, reporting, access control, and platform monitoring.

## Actors

| Actor | Primary responsibilities |
|---|---|
| Administrator | Manage users, roles, configuration, audit and operational visibility |
| Manager | Manage operations, resources, reports and exceptions |
| Dispatcher | Create deliveries and assign drivers, vehicles and routes |
| Driver | View assigned work and update permitted delivery statuses |
| Viewer | Read dashboards, deliveries and reports without mutating data |

## MVP scope

1. Secure registration, login, refresh-token rotation and logout.
2. Role-based access control for administration and operational mutations.
3. Customer, driver, vehicle and route CRUD.
4. Delivery creation, search, assignment, tracking and state transitions.
5. Dashboard metrics and delivery report export.
6. Audit trail, structured logging, health endpoints and Prometheus metrics.
7. Docker-based local environment.
8. Azure private-tier deployment with Terraform and CI/CD.

## Functional requirements

- The system shall authenticate users with short-lived access tokens and rotating refresh sessions.
- The system shall validate all request bodies, parameters and query strings.
- The system shall prevent unauthorized roles from executing protected operations.
- The system shall generate a unique tracking number for every delivery.
- The system shall preserve delivery status history as immutable events.
- The system shall search deliveries by tracking number, customer and address.
- The system shall expose liveness, readiness and metrics endpoints.
- The admin shall list users and update roles or activation status.
- The system shall produce delivery summaries suitable for export.

## Non-functional requirements

| Area | Requirement |
|---|---|
| Availability | Health probes, restart policies and rolling image deployment path |
| Security | Private database, least privilege, WAF, RBAC, CSRF, rate limiting, validation and secrets management |
| Performance | Indexed search fields, Redis dashboard cache, connection reuse and compressed responses |
| Observability | JSON logs, request IDs, metrics, Azure Monitor, Log Analytics and alerts |
| Maintainability | TypeScript strict mode, layered backend, reusable frontend components, tests and documentation |
| Recoverability | Database backups, committed migrations, reproducible infrastructure and documented rollback |
| Scalability | Stateless frontend/backend containers; tiers can move to VM Scale Sets, Container Apps or AKS |

## User stories

- As a dispatcher, I want to create and assign a delivery so that work can begin without spreadsheets.
- As a driver, I want to update the status of my delivery so that the operations team sees progress.
- As a manager, I want to search by tracking number or customer so that I can resolve enquiries quickly.
- As a manager, I want a dashboard of pending, in-transit, failed and delivered work so that I can identify exceptions.
- As an administrator, I want to control roles and suspend access so that permissions follow job responsibilities.
- As a security engineer, I want the database to accept traffic only from the app subnet so that it cannot be reached from the Internet or web tier.
- As a DevOps engineer, I want every environment created from code so that deployments are reviewable and repeatable.
