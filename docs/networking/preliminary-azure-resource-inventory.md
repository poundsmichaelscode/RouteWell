# Preliminary Azure Resource Inventory

| Resource | Purpose |
|---|---|
| Resource Group | Logical lifecycle container |
| Virtual Network | Private Azure network |
| Application Gateway Subnet | Dedicated Application Gateway subnet |
| Web Subnet | Web VM network boundary |
| App Subnet | Express API VM network boundary |
| Database Subnet | PostgreSQL VM network boundary |
| Network Security Groups | Tier-specific traffic filtering |
| Public IP | Approved public entry point |
| Application Gateway | HTTP/HTTPS entry and routing |
| Web VM | Nginx and React |
| App VM | Node.js, Express, and PM2 |
| Database VM | PostgreSQL with no public IP |
| NICs | Connect VMs to subnets |
| Managed Disks | Persistent storage |
| SSH Keys | Secure administration |
| Backup Destination | PostgreSQL backup retention |
| Monitoring Components | Future centralized logs and metrics |

Detailed CIDR and subnet calculations belong to Phase 6.
