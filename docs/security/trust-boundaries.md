# Trust Boundaries

## Internet to Azure

Internet traffic is untrusted.

Controls:

- Application Gateway
- HTTPS
- Limited public ports
- Logging
- Future Web Application Firewall

## Gateway to Web Tier

Only Application Gateway should deliver normal public web traffic to the web tier in the target architecture.

## Web Tier to Application Tier

The application tier should accept only required API traffic from approved sources.

## Application Tier to Database Tier

This is the most sensitive boundary.

Controls:

- No public database IP
- Database subnet NSG
- TCP 5432 allowed only from the application subnet
- Linux firewall
- PostgreSQL listen-address restrictions
- PostgreSQL pg_hba.conf rules
- Least-privilege database account

## Administrator to Infrastructure

Administrative access must use:

- SSH keys
- Restricted source IP
- No root login
- No SSH password authentication
- Logged access
- Future Azure Bastion or VPN where appropriate
