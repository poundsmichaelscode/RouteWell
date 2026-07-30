const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" }
} as const;

const listParameters = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 20 } },
  { name: "search", in: "query", schema: { type: "string", maxLength: 100 } }
] as const;

const readSecurity = [{ cookieAuth: [] }] as const;
const writeSecurity = [{ cookieAuth: [], csrfToken: [] }] as const;

function resourceCollection(tag: string, schema: string) {
  return {
    get: {
      tags: [tag],
      summary: `List and search ${tag.toLowerCase()}`,
      security: readSecurity,
      parameters: listParameters,
      responses: { "200": { description: `${tag} page` }, "401": { $ref: "#/components/responses/Unauthorized" } }
    },
    post: {
      tags: [tag],
      summary: `Create ${schema.toLowerCase()}`,
      security: writeSecurity,
      requestBody: { required: true, content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}Input` } } } },
      responses: { "201": { description: `${schema} created` }, "403": { $ref: "#/components/responses/Forbidden" }, "422": { $ref: "#/components/responses/ValidationError" } }
    }
  };
}

function resourceItem(tag: string, schema: string) {
  return {
    patch: {
      tags: [tag],
      summary: `Update ${schema.toLowerCase()}`,
      security: writeSecurity,
      parameters: [idParameter],
      requestBody: { required: true, content: { "application/json": { schema: { $ref: `#/components/schemas/${schema}Input` } } } },
      responses: { "200": { description: `${schema} updated` }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" } }
    },
    delete: {
      tags: [tag],
      summary: `Delete ${schema.toLowerCase()}`,
      security: writeSecurity,
      parameters: [idParameter],
      responses: { "204": { description: `${schema} deleted` }, "403": { $ref: "#/components/responses/Forbidden" }, "404": { $ref: "#/components/responses/NotFound" }, "409": { description: "Resource is referenced by another record" } }
    }
  };
}

export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "RouteWell API",
    version: "1.0.0",
    description: "Cookie-authenticated REST API for logistics, delivery, route, fleet, driver, customer, reporting and administration workflows."
  },
  servers: [{ url: "/api/v1", description: "Current origin" }],
  tags: ["Authentication", "Deliveries", "Customers", "Drivers", "Vehicles", "Routes", "Dashboard", "Notifications", "Administration", "Operations"].map((name) => ({ name })),
  components: {
    securitySchemes: {
      cookieAuth: { type: "apiKey", in: "cookie", name: "accessToken", description: "Short-lived HTTP-only access-token cookie." },
      csrfToken: { type: "apiKey", in: "header", name: "x-csrf-token", description: "Double-submit token matching the csrfToken cookie for state-changing requests." }
    },
    responses: {
      Unauthorized: { description: "Authentication required or token expired", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      Forbidden: { description: "Insufficient permissions or invalid CSRF token", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      NotFound: { description: "Resource not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      ValidationError: { description: "Request validation failed", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } }
    },
    schemas: {
      Error: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", const: false },
          error: { type: "object", required: ["code", "message", "requestId"], properties: { code: { type: "string" }, message: { type: "string" }, requestId: { type: "string" }, details: {} } }
        }
      },
      User: {
        type: "object",
        properties: { id: { type: "string", format: "uuid" }, email: { type: "string", format: "email" }, firstName: { type: "string" }, lastName: { type: "string" }, role: { $ref: "#/components/schemas/Role" }, active: { type: "boolean" }, createdAt: { type: "string", format: "date-time" } }
      },
      Role: { type: "string", enum: ["ADMIN", "MANAGER", "DISPATCHER", "DRIVER", "VIEWER"] },
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "email", "password"],
        properties: { firstName: { type: "string", minLength: 2, maxLength: 50 }, lastName: { type: "string", minLength: 2, maxLength: 50 }, email: { type: "string", format: "email" }, password: { type: "string", format: "password", minLength: 12, maxLength: 128 } }
      },
      LoginInput: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string", format: "password" } } },
      ProfileInput: { type: "object", minProperties: 1, properties: { firstName: { type: "string", minLength: 2, maxLength: 50 }, lastName: { type: "string", minLength: 2, maxLength: 50 } } },
      CustomerInput: { type: "object", required: ["name", "address", "city", "country"], properties: { name: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, address: { type: "string" }, city: { type: "string" }, state: { type: "string" }, country: { type: "string" }, postalCode: { type: "string" }, notes: { type: "string" } } },
      DriverInput: { type: "object", required: ["firstName", "lastName", "email", "phone", "licenseNumber", "licenseExpiry"], properties: { firstName: { type: "string" }, lastName: { type: "string" }, email: { type: "string", format: "email" }, phone: { type: "string" }, licenseNumber: { type: "string" }, licenseExpiry: { type: "string", format: "date" }, status: { type: "string", enum: ["AVAILABLE", "ASSIGNED", "OFF_DUTY", "SUSPENDED"] } } },
      VehicleInput: { type: "object", required: ["registrationNumber", "make", "model", "year", "type", "capacityKg"], properties: { registrationNumber: { type: "string" }, make: { type: "string" }, model: { type: "string" }, year: { type: "integer" }, type: { type: "string", enum: ["MOTORCYCLE", "CAR", "VAN", "TRUCK", "REFRIGERATED_TRUCK"] }, capacityKg: { type: "number", exclusiveMinimum: 0 }, status: { type: "string", enum: ["AVAILABLE", "ASSIGNED", "MAINTENANCE", "OUT_OF_SERVICE"] } } },
      RouteInput: { type: "object", required: ["name", "origin", "destination"], properties: { name: { type: "string" }, origin: { type: "string" }, destination: { type: "string" }, distanceKm: { type: "number", minimum: 0 }, estimatedMinutes: { type: "integer", minimum: 1 }, active: { type: "boolean" } } },
      DeliveryInput: { type: "object", required: ["customerId", "pickupAddress", "deliveryAddress", "scheduledAt"], properties: { customerId: { type: "string", format: "uuid" }, driverId: { type: "string", format: "uuid" }, vehicleId: { type: "string", format: "uuid" }, routeId: { type: "string", format: "uuid" }, pickupAddress: { type: "string" }, deliveryAddress: { type: "string" }, scheduledAt: { type: "string", format: "date-time" }, priority: { type: "string", enum: ["LOW", "NORMAL", "HIGH", "URGENT"] }, weightKg: { type: "number", minimum: 0 }, notes: { type: "string" } } },
      Delivery: { allOf: [{ $ref: "#/components/schemas/DeliveryInput" }, { type: "object", properties: { id: { type: "string", format: "uuid" }, trackingNumber: { type: "string" }, status: { type: "string", enum: ["PENDING", "ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"] }, deliveredAt: { type: ["string", "null"], format: "date-time" } } }] },
      DeliveryStatusInput: { type: "object", required: ["status"], properties: { status: { type: "string", enum: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "DELIVERED", "FAILED", "CANCELLED"] }, note: { type: "string", maxLength: 500 }, latitude: { type: "number", minimum: -90, maximum: 90 }, longitude: { type: "number", minimum: -180, maximum: 180 } } },
      UserUpdateInput: { type: "object", properties: { firstName: { type: "string" }, lastName: { type: "string" }, role: { $ref: "#/components/schemas/Role" }, active: { type: "boolean" } } },
      Notification: { type: "object", properties: { id: { type: "string", format: "uuid" }, title: { type: "string" }, message: { type: "string" }, readAt: { type: ["string", "null"], format: "date-time" }, createdAt: { type: "string", format: "date-time" } } }
    }
  },
  paths: {
    "/auth/register": { post: { tags: ["Authentication"], summary: "Register a user", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } } }, responses: { "201": { description: "Registered and authenticated" }, "409": { description: "Email already registered" }, "422": { $ref: "#/components/responses/ValidationError" } } } },
    "/auth/login": { post: { tags: ["Authentication"], summary: "Authenticate", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } } }, responses: { "200": { description: "Authenticated and secure cookies issued" }, "401": { $ref: "#/components/responses/Unauthorized" } } } },
    "/auth/refresh": { post: { tags: ["Authentication"], summary: "Rotate refresh session", security: writeSecurity, responses: { "200": { description: "Session rotated" }, "401": { $ref: "#/components/responses/Unauthorized" } } } },
    "/auth/logout": { post: { tags: ["Authentication"], summary: "Revoke session and clear cookies", security: writeSecurity, responses: { "204": { description: "Logged out" } } } },
    "/auth/me": {
      get: { tags: ["Authentication"], summary: "Get current profile", security: readSecurity, responses: { "200": { description: "Current user" }, "401": { $ref: "#/components/responses/Unauthorized" } } },
      patch: { tags: ["Authentication"], summary: "Update current profile", security: writeSecurity, requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/ProfileInput" } } } }, responses: { "200": { description: "Profile updated" }, "422": { $ref: "#/components/responses/ValidationError" } } }
    },
    "/deliveries": {
      get: { tags: ["Deliveries"], summary: "List and search deliveries", security: readSecurity, parameters: listParameters, responses: { "200": { description: "Delivery page" } } },
      post: { tags: ["Deliveries"], summary: "Create delivery", security: writeSecurity, requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DeliveryInput" } } } }, responses: { "201": { description: "Delivery created" }, "403": { $ref: "#/components/responses/Forbidden" } } }
    },
    "/deliveries/{id}": {
      get: { tags: ["Deliveries"], summary: "Get delivery and event history", security: readSecurity, parameters: [idParameter], responses: { "200": { description: "Delivery" }, "404": { $ref: "#/components/responses/NotFound" } } },
      patch: { tags: ["Deliveries"], summary: "Update delivery", security: writeSecurity, parameters: [idParameter], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DeliveryInput" } } } }, responses: { "200": { description: "Delivery updated" }, "403": { $ref: "#/components/responses/Forbidden" } } },
      delete: { tags: ["Deliveries"], summary: "Delete delivery", security: writeSecurity, parameters: [idParameter], responses: { "204": { description: "Delivery deleted" }, "403": { $ref: "#/components/responses/Forbidden" } } }
    },
    "/deliveries/{id}/status": { patch: { tags: ["Deliveries"], summary: "Transition delivery status and append a tracking event", security: writeSecurity, parameters: [idParameter], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/DeliveryStatusInput" } } } }, responses: { "200": { description: "Status updated" }, "409": { description: "Invalid status transition" } } } },
    "/customers": resourceCollection("Customers", "Customer"),
    "/customers/{id}": resourceItem("Customers", "Customer"),
    "/drivers": resourceCollection("Drivers", "Driver"),
    "/drivers/{id}": resourceItem("Drivers", "Driver"),
    "/vehicles": resourceCollection("Vehicles", "Vehicle"),
    "/vehicles/{id}": resourceItem("Vehicles", "Vehicle"),
    "/routes": resourceCollection("Routes", "Route"),
    "/routes/{id}": resourceItem("Routes", "Route"),
    "/dashboard/summary": { get: { tags: ["Dashboard"], summary: "Get cached operational KPIs and recent deliveries", security: readSecurity, responses: { "200": { description: "Dashboard summary" } } } },
    "/dashboard/reports/deliveries": { get: { tags: ["Dashboard"], summary: "Get delivery status report", security: readSecurity, responses: { "200": { description: "Delivery report" } } } },
    "/dashboard/system": { get: { tags: ["Administration"], summary: "Get API, PostgreSQL and Redis health details", security: readSecurity, responses: { "200": { description: "System status" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
    "/notifications": { get: { tags: ["Notifications"], summary: "List current user's latest notifications", security: readSecurity, responses: { "200": { description: "Notifications" } } } },
    "/notifications/read-all": { patch: { tags: ["Notifications"], summary: "Mark all notifications read", security: writeSecurity, responses: { "204": { description: "Updated" } } } },
    "/notifications/{id}/read": { patch: { tags: ["Notifications"], summary: "Mark one notification read", security: writeSecurity, parameters: [idParameter], responses: { "204": { description: "Updated" }, "404": { $ref: "#/components/responses/NotFound" } } } },
    "/users": { get: { tags: ["Administration"], summary: "List users", security: readSecurity, parameters: listParameters, responses: { "200": { description: "User page" }, "403": { $ref: "#/components/responses/Forbidden" } } } },
    "/users/{id}": { patch: { tags: ["Administration"], summary: "Update user role, status or name", security: writeSecurity, parameters: [idParameter], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UserUpdateInput" } } } }, responses: { "200": { description: "User updated" }, "409": { description: "Self-lockout prevented" } } } },
    "/health/live": { get: { tags: ["Operations"], summary: "Process liveness", servers: [{ url: "/" }], responses: { "200": { description: "Alive" } } } },
    "/health/ready": { get: { tags: ["Operations"], summary: "PostgreSQL and Redis readiness", servers: [{ url: "/" }], responses: { "200": { description: "Ready" }, "503": { description: "Dependency unavailable" } } } },
    "/metrics": { get: { tags: ["Operations"], summary: "Prometheus metrics", servers: [{ url: "/" }], responses: { "200": { description: "Prometheus text exposition" } } } }
  }
} as const;
