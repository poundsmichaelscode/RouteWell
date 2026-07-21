# ADR-003: Keep PostgreSQL Private

## Status

Accepted

## Decision

The database VM will not receive a public IP.

## Why

Only the application tier needs PostgreSQL access. Removing direct Internet reachability reduces attack surface.

## Security Layers

- Private IP only
- Database subnet
- NSG
- Linux firewall
- PostgreSQL host rules
- Database authentication
