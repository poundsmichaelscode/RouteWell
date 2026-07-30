# RouteWell database

The canonical Prisma schema is `prisma/schema.prisma`. Development migrations are created with `npm run prisma:migrate:dev --prefix backend`; production applies committed migrations with `npm run prisma:migrate:deploy --prefix backend`.

The seed creates a portfolio demo tenant, driver, vehicle, route, delivery, and a local-only administrator. Change or disable the seeded password before any shared environment.
