# ADR-008: Use Private IP Communication

## Status

Accepted

## Decision

Internal tiers communicate using private Azure IP addresses or private DNS names.

## Why

- Reduces public exposure
- Keeps internal traffic inside the VNet
- Supports NSG enforcement
- Simplifies security auditing
