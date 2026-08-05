# Database seed

The authoritative, repeatable seed implementation is `backend/src/scripts/seed.ts` because it executes with the backend's generated Prisma Client and dependency graph.

From the repository root:

```bash
docker compose --profile tools run --rm seed
```

For a direct local Node workflow:

```bash
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:seed
```

Passwords are read from `SEED_ADMIN_PASSWORD` and `SEED_DRIVER_PASSWORD`. The Docker workflow requires those values from the generated root `.env` file.
