# ADR-006: Use JWT Authentication

## Status

Accepted

## Decision

Use signed, short-lived JWT access tokens.

## Conditions

- Short expiry
- Strong signing secret or asymmetric keys
- No sensitive personal data inside tokens
- Validate tokens on every protected request
- Enforce authorization separately
