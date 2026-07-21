# Azure Well-Architected Framework Alignment

## Reliability

- Health endpoints
- PM2 process supervision
- Nginx and PostgreSQL system services
- Database backups
- Reproducible scripts
- Documented recovery procedures

Known limitation: one VM per tier is not highly available.

## Security

- Dedicated subnets
- NSGs
- Private database
- Minimum required ports
- SSH keys
- No root SSH
- JWT authentication
- Role-based authorization
- Input validation
- HTTPS target architecture

## Cost Optimization

- Right-sized Linux VMs
- One Azure region
- Limited public IPs
- Deallocate lab VMs when unused
- Avoid premature microservices
- Document Application Gateway cost impact

## Operational Excellence

- Git and GitHub
- Structured repository
- Bash and Azure CLI automation
- Logging
- Health checks
- Runbooks
- Failure simulations
- Troubleshooting documentation

## Performance Efficiency

- Nginx static asset delivery
- Database indexes
- Pagination
- Independent tier scaling
- Application Gateway expansion path
