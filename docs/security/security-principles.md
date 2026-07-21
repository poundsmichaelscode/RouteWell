# Security Principles

## Deny by Default

Traffic is denied unless a documented business or operational need exists.

## Least Privilege

Users, services, network paths, and database accounts receive only required permissions.

## Minimize Public Exposure

Only the approved web entry point should be publicly reachable.

## Separate Data Access

Internet users never access PostgreSQL directly. They interact with data through controlled backend API operations.

## Defence in Depth

The database is protected by:

1. No public IP
2. Dedicated subnet
3. NSG rules
4. Linux firewall
5. PostgreSQL listening configuration
6. pg_hba.conf
7. Database authentication
8. Least-privilege SQL permissions

## Assume Breach

The architecture assumes that a public-facing system could be compromised. A compromised web server must not automatically grant database access.
