# Phase 1 — Project Planning

## Why This Phase Exists

A secure cloud application should not begin with virtual machines or code. It should begin by defining the business problem, user roles, system responsibilities, trust boundaries, security controls, and scalability goals.

Planning prevents common failures such as:

- Flat networks
- Public databases
- Excessive open ports
- Hard-coded secrets
- Inconsistent environments
- Undocumented infrastructure
- Expensive rework

## Project Objective

Design and prepare a secure, low-cost, scalable fleet-management application using Microsoft Azure, Ubuntu Linux, React, Node.js, Express, PostgreSQL, Nginx, JWT, Bash, Azure CLI, Git, and GitHub.

## In Scope

- Authentication and authorization
- Fleet dashboard
- Vehicle management
- Driver management
- Route management
- Delivery tracking
- Administration
- REST API
- Swagger/OpenAPI
- Azure networking
- Linux virtual machines
- Network Security Groups
- Bash automation
- Documentation
- Failure simulation
- Final presentation preparation

## Out of Scope for the Initial Version

- Physical GPS hardware integration
- Native mobile applications
- Machine-learning route optimization
- Multi-region disaster recovery
- Kubernetes
- ExpressRoute
- Enterprise identity federation
- Payment processing
- Full warehouse management
- Production CI/CD

## Main Architecture Pattern

RouteWell will use a three-tier modular-monolith architecture:

- Web tier: React application served through Nginx
- Application tier: Node.js and Express REST API
- Data tier: PostgreSQL database

The backend will start as one modular application rather than microservices. This reduces operational cost and complexity while preserving clear internal module boundaries.
