# ADR-001: Use a Three-Tier Architecture

## Status

Accepted

## Decision

Separate the web, application, and database tiers.

## Why

- Creates clear security boundaries
- Supports tier-specific NSG rules
- Allows independent scaling
- Protects PostgreSQL from public exposure

## Rejected Alternative

One flat subnet.

## Reason Rejected

A compromised public-facing component would have an easier path to the database.
