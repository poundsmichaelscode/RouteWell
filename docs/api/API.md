# RouteWell API documentation

Interactive Swagger UI is available at `/api-docs`; the OpenAPI 3.1 document is available at `/api-docs.json`. Public browser traffic uses same-origin `/api/v1`, which Next.js proxies to the private backend tier.

## Conventions

Authenticated requests use an HTTP-only `accessToken` cookie. State-changing cookie-authenticated requests also send the readable `csrfToken` cookie value in the `x-csrf-token` header. The RouteWell Axios client adds this header automatically.

List endpoints accept `page` (default `1`), `limit` (default `20`, maximum `100`) and optional `search`.

Successful list response:

```json
{"success":true,"data":[],"meta":{"page":1,"limit":20,"total":0,"pages":0}}
```

Normalized error response:

```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Request validation failed","requestId":"...","details":[]}}
```

## Authentication and profile

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register and issue access, refresh and CSRF cookies |
| POST | `/auth/login` | Public | Authenticate and create a refresh session |
| POST | `/auth/refresh` | Refresh cookie + CSRF | Rotate and revoke the previous refresh session |
| POST | `/auth/logout` | Cookie session + CSRF | Revoke the session and clear cookies |
| GET | `/auth/me` | Authenticated | Return the current profile |
| PATCH | `/auth/me` | Authenticated + CSRF | Update first and last name |

## Deliveries

| Method | Endpoint | Minimum role | Purpose |
|---|---|---|---|
| GET | `/deliveries` | Any authenticated role | List/search deliveries |
| GET | `/deliveries/:id` | Any authenticated role | Read one delivery and event history |
| POST | `/deliveries` | Dispatcher | Create a delivery |
| PATCH | `/deliveries/:id` | Dispatcher | Update assignment and delivery data |
| PATCH | `/deliveries/:id/status` | Driver | Apply a validated state transition and tracking event |
| DELETE | `/deliveries/:id` | Manager | Delete a delivery |

Role inheritance is explicit in middleware: administrators and managers can perform dispatcher actions; administrators, managers, dispatchers and drivers can update delivery status.

Example status update:

```json
{
  "status": "IN_TRANSIT",
  "note": "Departed the sorting hub",
  "latitude": 6.5244,
  "longitude": 3.3792
}
```

Supported progression is `PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED`, with controlled failure, reassignment and cancellation branches. Invalid transitions return `409`.

## Operational resources

Customers, drivers, vehicles and routes use the same endpoint pattern:

| Method | Endpoint pattern | Minimum role |
|---|---|---|
| GET | `/{resource}` | Any authenticated role |
| POST | `/{resource}` | Dispatcher |
| PATCH | `/{resource}/:id` | Dispatcher |
| DELETE | `/{resource}/:id` | Manager |

Resources are `/customers`, `/drivers`, `/vehicles` and `/routes`.

## Dashboard, reports and monitoring

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/dashboard/summary` | Authenticated | Cached KPIs, status counts and recent deliveries |
| GET | `/dashboard/reports/deliveries` | Authenticated | Delivery counts and average weight grouped by status |
| GET | `/dashboard/system` | Administrator | Runtime, memory, PostgreSQL and Redis status |

## Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/notifications` | Return the latest 50 notifications for the current user |
| PATCH | `/notifications/:id/read` | Mark one owned notification read |
| PATCH | `/notifications/read-all` | Mark all current-user notifications read |

## User administration

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/users` | Administrator | Paginated user search |
| PATCH | `/users/:id` | Administrator | Update name, role or active status |

The API prevents an administrator from demoting or suspending their own account. Suspending another user revokes all active refresh sessions immediately; existing access tokens remain bounded by the short access-token TTL.

## Health and observability

These paths are mounted at the backend root, not under `/api/v1`:

| Endpoint | Purpose |
|---|---|
| `GET /health/live` | Process liveness |
| `GET /health/ready` | PostgreSQL and Redis readiness |
| `GET /metrics` | Prometheus text exposition |
| `GET /api-docs` | Swagger UI |
| `GET /api-docs.json` | OpenAPI 3.1 JSON |
