# High-Level Architecture

## Request Flow

```text
Internet User
    |
    | HTTPS 443
    v
Azure Application Gateway
    |
    v
Web Tier: Ubuntu + Nginx + React
    |
    | Private API traffic
    v
Application Tier: Ubuntu + Node.js + Express + PM2
    |
    | PostgreSQL TCP 5432
    v
Data Tier: Ubuntu + PostgreSQL
No Public IP
```

## Security Boundaries

1. Internet to Application Gateway
2. Application Gateway to Web tier
3. Web tier to Application tier
4. Application tier to Database tier
5. Administrator to management interfaces

## Critical Rule

The database cannot be reached directly from the Internet or from the web subnet. Only the application subnet may initiate PostgreSQL connections on TCP port 5432.
