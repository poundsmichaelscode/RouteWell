# Docker guide

## Local stack

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service | Address |
|---|---|
| RouteWell | `http://localhost` |
| Swagger (direct backend) | `http://localhost/api-docs` through the Next proxy only if routed; direct container is internal |
| Grafana | `http://127.0.0.1:3001` |
| Prometheus | `http://127.0.0.1:9090` |

Seed the local database:

```bash
docker compose exec backend npm run prisma:seed:prod
```

Demo login: `admin@routewell.local` / `RouteWellAdmin123!`. This credential is for local demonstration only.

## Container security decisions

- Multi-stage builds keep compilers out of runtime images.
- Application processes run as non-root users.
- Runtime filesystems are read-only with explicit `tmpfs` paths.
- `no-new-privileges` is enabled.
- PostgreSQL is attached only to the internal data network locally.
- Production containers use the `journald` logging driver.
- Production secrets are mounted as files and loaded with `_FILE` environment variables.

## Useful commands

```bash
docker compose config
docker compose ps
docker compose logs -f backend
docker compose exec postgres psql -U routewell -d routewell
docker compose down
docker compose down -v   # destructive: removes local data
```
