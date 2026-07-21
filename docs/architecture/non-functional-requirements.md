# Non-Functional Requirements

## Security

- PostgreSQL must not be publicly accessible.
- The database VM must not have a public IP.
- NSGs must permit only documented traffic.
- Passwords must be securely hashed.
- Inputs must be validated.
- Database operations must use parameterized queries or a secure ORM/query builder.
- Secrets must not be committed to Git.
- Production traffic must use HTTPS.
- SSH must use keys, not passwords.
- Services and users must follow least privilege.

## Availability

The low-cost first deployment may use one VM per tier. This is not fully highly available and must be documented as a limitation.

## Performance

- Common API reads should normally complete within 500 ms under expected project load.
- Dashboard queries should use appropriate indexes.
- Responses must be paginated.
- Nginx should serve static assets efficiently.

## Scalability

The architecture must allow independent scaling of the web, application, and data tiers.

## Maintainability

The project shall use modular code, centralized error handling, reusable middleware, migrations, API versioning, documentation, and automation.

## Observability

The system shall provide application logs, Nginx logs, PostgreSQL logs, health checks, timestamps, and troubleshooting commands.

## Cost Optimization

The project shall use right-sized Linux VMs, one Azure region, limited public IPs, and deallocation when the lab is not in use.

## Recoverability

The system shall support PostgreSQL backup and restore procedures and reproducible infrastructure and deployment scripts.

## Accessibility

The frontend should use semantic HTML, keyboard-accessible controls, visible focus states, labels, sufficient contrast, and clear validation messages.

## Data Integrity

The database shall enforce primary keys, foreign keys, unique constraints, required fields, valid statuses, and appropriate delete behaviour.
