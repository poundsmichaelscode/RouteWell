# ADR-009: Use Environment Variables

## Status

Accepted

## Decision

Store environment-specific configuration outside source code.

## Rules

- Commit .env.example only
- Never commit real secrets
- Never place backend secrets in the Vite frontend
- Rotate any leaked credential immediately
