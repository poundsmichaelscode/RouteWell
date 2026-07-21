# ADR-007: Use Nginx

## Status

Accepted

## Decision

Use Nginx on the web tier.

## Responsibilities

- Serve React static assets
- Support SPA route fallback
- Proxy /api traffic
- Record access and error logs
- Apply selected security headers
