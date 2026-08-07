# Security Policy

## Reporting a vulnerability

Do not publish exploitable vulnerability details in a public issue.

For a portfolio repository owned by one maintainer, use GitHub's private
vulnerability reporting feature when enabled. If private reporting is not
available, contact the repository owner through a private channel listed on
their GitHub profile.

Include:

- affected component and version/commit;
- reproduction steps;
- impact;
- suggested remediation, if known.

## Security expectations

RouteWell is designed around:

- private database networking;
- RBAC and least privilege;
- short-lived access tokens and rotated refresh tokens;
- password hashing;
- CSRF protection for cookie-authenticated state changes;
- Zod input validation;
- Helmet/NGINX security headers;
- rate limiting;
- environment/secret separation;
- dependency, CodeQL and Trivy scanning;
- auditable application events.

Never commit production credentials or `.env` files.
