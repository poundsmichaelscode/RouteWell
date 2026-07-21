# ADR-002: Use a Modular Monolith Backend

## Status

Accepted

## Decision

Build one Express API organized into feature modules.

## Why

- Lower operational complexity
- Lower cost
- Easier debugging and deployment
- Suitable for the project size
- Preserves future service boundaries

## Rejected Alternative

Immediate microservices architecture.

## Reason Rejected

The project does not yet justify distributed-system complexity.
