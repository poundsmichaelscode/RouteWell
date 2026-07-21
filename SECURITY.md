# Security Policy

## Security Principles

- Do not commit secrets, passwords, JWT keys, SSH private keys, or Azure credentials.
- The PostgreSQL database must never receive a public IP.
- Only the application tier may connect to PostgreSQL on TCP port 5432.
- Authentication must be enforced by the backend.
- Authorization must be enforced on every protected backend operation.
- SSH password authentication must be disabled in the Azure deployment.
- Root SSH login must be disabled.
- Production traffic must use HTTPS.
- Logs must not contain passwords, tokens, secrets, or database credentials.

## Reporting Security Issues

Do not publish sensitive vulnerabilities in a public GitHub issue. Report them privately to the project maintainer.
