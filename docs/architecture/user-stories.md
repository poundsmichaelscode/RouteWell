# User Stories and Acceptance Criteria

## US-01 Secure Login

As a registered RouteWell user, I want to log in securely so that I can access permitted features.

Acceptance criteria:

- Valid credentials allow login.
- Invalid credentials return a generic error.
- Disabled users cannot log in.
- Protected endpoints reject missing, invalid, or expired tokens.

## US-02 Create a Vehicle

As an administrator, I want to register a vehicle so that it can be assigned to routes.

Acceptance criteria:

- Registration number is required and unique.
- Invalid years are rejected.
- New vehicles receive a valid default status.
- Unauthorized users receive HTTP 403.

## US-03 Manage Drivers

As an administrator, I want to maintain driver records so that only active and qualified drivers receive assignments.

Acceptance criteria:

- Driver name and licence number are required.
- Licence numbers are unique.
- Expired licences are identifiable.
- Inactive drivers cannot receive new route assignments.

## US-04 Create a Route

As a dispatcher, I want to create a route so that a driver and vehicle can complete deliveries.

Acceptance criteria:

- Origin and destination are required.
- Driver and vehicle must exist and be active.
- Conflicting active assignments are rejected.

## US-05 Create a Delivery

As a dispatcher, I want to create a delivery so that it can be tracked.

Acceptance criteria:

- A unique tracking number is generated.
- Required sender and recipient fields are validated.
- The initial status is stored.
- Creation metadata is recorded.

## US-06 Update Delivery Status

As an assigned driver, I want to update delivery status so that operations staff can follow progress.

Acceptance criteria:

- Only the assigned driver or authorized staff may update the status.
- Invalid status transitions are rejected.
- Updates are timestamped.

## US-07 Public Tracking

As a customer, I want to enter a tracking number so that I can see permitted delivery status information.

Acceptance criteria:

- Valid tracking numbers return limited information.
- Invalid tracking numbers return a safe not-found response.
- Sensitive operational and personal data are not exposed.

## US-08 View Dashboard

As an operations manager, I want a dashboard so that I can understand current fleet activity.

Acceptance criteria:

- Dashboard totals match the database.
- Results follow role restrictions.
- Loading and error states are shown.

## US-09 Protect the Database

As a security engineer, I want the database isolated from the Internet.

Acceptance criteria:

- Database VM has no public IP.
- Internet-to-database traffic is blocked.
- Web-to-database traffic is blocked.
- App-to-database TCP 5432 is allowed.
- External PostgreSQL connection attempts fail.

## US-10 Diagnose Failures

As a Linux administrator, I want logs and health checks so that I can identify service failures.

Acceptance criteria:

- Nginx, application, and PostgreSQL logs are accessible.
- Service status can be inspected.
- Connectivity can be tested.
- Troubleshooting steps are documented.
