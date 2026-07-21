# Preliminary API Design

Base path:

```text
/api/v1
```

Planned resources:

```text
/api/v1/auth
/api/v1/users
/api/v1/drivers
/api/v1/vehicles
/api/v1/routes
/api/v1/deliveries
/api/v1/dashboard
/api/v1/health
```

## Planned Authentication Endpoints

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

## HTTP Status Codes

| Code | Meaning |
|---:|---|
| 200 | Successful request |
| 201 | Resource created |
| 204 | Successful request with no body |
| 400 | Malformed request |
| 401 | Authentication required or invalid |
| 403 | Authenticated but unauthorized |
| 404 | Resource not found |
| 409 | Conflict |
| 422 | Validation failure |
| 500 | Unexpected server error |
| 503 | Service unavailable |

Detailed controllers, routes, validation, middleware, and Swagger configuration belong to Phase 3.
