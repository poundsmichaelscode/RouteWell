# ADR-005: Use Azure Application Gateway

## Status

Accepted

## Decision

Use Azure Application Gateway as the target public HTTP/HTTPS entry point.

## Why

- HTTP-aware routing
- Health probes
- TLS support
- Future multi-instance scaling
- Future WAF option

## Important Constraint

Application Gateway requires a dedicated subnet.

## Trade-Off

Application Gateway increases cost. The final project will distinguish a low-cost learning deployment from a stronger production recommendation.
