# Security design

## Controls implemented

| Threat | Control |
|---|---|
| Credential theft | bcrypt cost factor 12, HTTP-only cookies, refresh rotation, token hashing at rest |
| CSRF | Strict SameSite cookies plus double-submit CSRF token header |
| XSS | React escaping, enforced Content Security Policy, secure headers and no token storage in localStorage |
| SQL injection | Prisma parameterization and Zod input validation |
| Brute force | Global and stricter authentication rate limits |
| Privilege escalation | Central authentication middleware and explicit RBAC role lists |
| Session replay | Refresh token hash, expiry, rotation and revocation |
| Secret leakage | `.gitignore`, GitHub secrets, Key Vault, managed identity and Docker secret files |
| Database exposure | No public IP and NSG allows 5432 only from app subnet |
| Supply-chain risk | Container SBOM/provenance, Trivy, CodeQL and protected pull requests |
| Repudiation | Structured request logs, request IDs and database audit records |

## NSG rule matrix

| NSG | Priority | Source | Destination port | Purpose |
|---|---:|---|---:|---|
| Web | 100 | `10.10.0.0/24` | 80 | Application Gateway health probes and user traffic |
| Web | 110 | `10.10.5.0/26` | 22 | Optional Azure Bastion administration |
| App | 100 | `10.10.1.0/27` | 8080 | Next.js private API proxy |
| App | 110 | `10.10.5.0/26` | 22 | Optional Azure Bastion administration |
| DB | 100 | `10.10.2.0/27` | 5432 | PostgreSQL from backend only |
| DB | 110 | `10.10.5.0/26` | 22 | Optional Azure Bastion administration |
| Web | 200 | `VirtualNetwork` | Any | Deny all other lateral VNet traffic |
| App | 200 | `VirtualNetwork` | Any | Deny all other lateral VNet traffic |
| DB | 200 | `VirtualNetwork` | Any | Deny all other lateral VNet traffic |

Azure NSGs include a default `AllowVnetInBound` rule. The explicit priority-200 denies are therefore required after the narrow allow rules above; without them, traffic such as web-to-database could still be accepted by the default rule. All Internet-initiated inbound traffic is denied, and the web, app and database VMs have no public IP addresses.

## Production hardening checklist

- Use a trusted domain certificate and force HTTPS.
- Replace seeded credentials and disable public registration when onboarding is invite-only.
- Configure email verification, password reset and MFA through an identity provider.
- Add Azure Firewall or NAT Gateway with explicit egress policy for strict outbound control.
- Use private endpoints for Key Vault and Log Analytics where the subscription design supports them.
- Enable Defender for Cloud and vulnerability assessment.
- Send backups to an encrypted, immutable storage account and test restores quarterly.
- Rotate JWT, database and registry credentials on a defined schedule.
- Run a DAST scan against staging and perform threat modelling before public launch.
