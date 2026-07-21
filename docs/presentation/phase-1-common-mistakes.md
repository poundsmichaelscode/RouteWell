# Common Mistakes

1. Assigning a public IP to every VM.
2. Opening PostgreSQL port 5432 to the Internet.
3. Allowing the entire VNet to access PostgreSQL.
4. Treating frontend route protection as backend security.
5. Committing real .env files.
6. Starting with microservices without a proven need.
7. Using identical NSG rules for every tier.
8. Forgetting Application Gateway requires a dedicated subnet.
9. Using a PostgreSQL superuser from the application.
10. Claiming that a single-VM design is highly available.
