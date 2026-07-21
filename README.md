# RouteWell Fleet Management System

## Phase 1 — Project Planning and Architecture

RouteWell is a logistics fleet-management capstone project designed to demonstrate secure three-tier application architecture on Microsoft Azure.

This Phase 1 package contains planning and architecture artifacts only. It intentionally does not contain the PostgreSQL schema, backend implementation, frontend implementation, Azure deployment, or automation scripts that belong to later phases.

## Business Problem

RouteWell's existing frontend, backend, and database operate inside one flat network. This design creates an unacceptable risk because a compromised laptop or public-facing server could potentially reach the database.

The new design separates the system into three controlled tiers:

1. Web tier — React application served by Nginx.
2. Application tier — Node.js and Express REST API.
3. Data tier — PostgreSQL database with no public IP.

## Target Request Flow

```text
Internet
   ↓
Azure Application Gateway
   ↓
Nginx + React Web Tier
   ↓
Node.js + Express Application Tier
   ↓
Private PostgreSQL Database Tier
```

## Phase 1 Deliverables

- Functional requirements
- Non-functional requirements
- User stories and acceptance criteria
- Architecture decisions
- Technology justification
- Project folder structure
- Preliminary ER diagram
- High-level Azure architecture
- Trust-boundary analysis
- Preliminary API structure
- Initial Azure resource inventory
- Azure Well-Architected Framework alignment
- Security principles
- Interview questions
- Common mistakes
- Phase completion checklist

## Repository Structure

```text
frontend/      Planned React/Vite/Tailwind application
backend/       Planned Node.js/Express REST API
database/      Planned PostgreSQL migrations, schema, and seeds
azure/         Planned Azure CLI and infrastructure files
docs/          Architecture, security, deployment, and planning documents
scripts/       Planned Bash automation
diagrams/      Mermaid diagram source files
screenshots/   Evidence folders for the final capstone
```

## Important Security Decision

The PostgreSQL database will never be directly accessible from the public Internet.

The target database VM will:

- Have no public IP.
- Reside in a dedicated database subnet.
- Accept TCP port 5432 only from the application subnet.
- Reject direct access from the Internet and web subnet.
- Use PostgreSQL authentication and least-privilege accounts.
- Be protected by NSGs, Linux firewall rules, and PostgreSQL host rules.

## Current Project Status

Phase 1 is complete.

The next phase is Phase 2: PostgreSQL database design.

Do not begin Phase 2 until the project owner explicitly requests it.
