# Phase 1 Interview Questions

## Why are you using three tiers?

To separate responsibilities and security boundaries. The public-facing web tier does not require direct database access.

## Why does the database not have a public IP?

No Internet user has a valid reason to connect directly to PostgreSQL. Removing the public IP eliminates direct Internet routing.

## Is no public IP enough?

No. The design also requires NSGs, Linux firewall rules, PostgreSQL listener restrictions, pg_hba.conf, authentication, and least privilege.

## Why not place all VMs in one subnet?

Different tiers require different traffic rules. Separate subnets make trust boundaries easier to enforce and audit.

## Why use Nginx with Application Gateway?

Application Gateway is the Azure entry layer. Nginx serves React files, supports SPA routing, records logs, and proxies API requests.

## Why not use microservices?

The current application does not justify the operational complexity. A modular monolith is simpler and less expensive.

## What is the biggest limitation of one VM per tier?

Each tier has a single point of failure. The design can scale later, but the initial deployment is not highly available.

## Authentication versus authorization?

Authentication identifies the user. Authorization determines what that user may do.

## How is least privilege applied?

Only required users, services, ports, and network paths are allowed. Only the application tier may access PostgreSQL on TCP 5432.

## Why use database constraints when the API validates data?

Database constraints provide the final integrity boundary and protect against application bugs, scripts, or alternative clients.
