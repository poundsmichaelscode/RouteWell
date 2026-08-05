# Docker guide

## Initial setup

```bash
make init
make lock
docker compose --progress=plain build frontend
docker compose --progress=plain build backend
docker compose up -d
make seed
```

`make init` creates required local secrets. `make lock` resolves dependency metadata with the same Node image used by Docker. If lockfiles are present, the Dockerfiles run `npm ci`; otherwise they use the retry-aware first-install path from `.npmrc`.

## Services

| Service | Exposure |
|---|---|
| NGINX / RouteWell | `${HTTP_PORT:-80}` on all local interfaces |
| Frontend | Internal only |
| Backend | Internal only |
| PostgreSQL | Internal data network only |
| Redis | Internal app network only |
| Prometheus | `127.0.0.1:9090`, monitoring profile |
| Grafana | `127.0.0.1:3001`, monitoring profile |

Start monitoring:

```bash
make monitoring
```

## Container hardening

- Multi-stage builds.
- Backend development packages pruned from the runtime image.
- Non-root application users.
- Read-only runtime filesystems.
- Explicit `tmpfs` write locations.
- `no-new-privileges`.
- PostgreSQL SCRAM authentication.
- Internal database network.
- File-mounted secrets in production.
- Journald logging in tier-specific production Compose.

## Troubleshooting commands

```bash
docker compose ps
docker compose logs --tail=150 backend
docker compose logs --tail=150 frontend
docker compose logs --tail=150 postgres
docker compose exec postgres pg_isready -U routewell -d routewell
docker compose exec redis redis-cli ping
curl -i http://localhost/api/health
```

Preserve data while stopping:

```bash
docker compose down --remove-orphans
```

Delete all local database, Redis, Prometheus and Grafana volumes:

```bash
make reset
```
