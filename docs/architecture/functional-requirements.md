# Functional Requirements

## FR-01 User Registration

The system shall allow controlled account creation with full name, email address, and password.

The system shall validate email format, reject duplicate email addresses, enforce password rules, hash passwords, and never expose password hashes.

## FR-02 User Login

The system shall authenticate active users using email and password and issue a signed JWT after successful login.

## FR-03 Authorization

The backend shall enforce role-based access control using authentication and authorization middleware.

## FR-04 Protected Frontend Routes

The frontend shall prevent unauthenticated users from accessing protected pages, while the backend remains the final security enforcement point.

## FR-05 Vehicle Management

Authorized users shall create, view, update, deactivate, search, filter, sort, and paginate vehicle records.

## FR-06 Driver Management

Authorized users shall create, view, update, deactivate, and track driver licence and availability information.

## FR-07 Route Management

Authorized users shall create routes, define origin and destination, assign drivers and vehicles, and update route status.

## FR-08 Delivery Management

Authorized users shall create deliveries, generate tracking numbers, associate deliveries with routes, and update delivery status.

## FR-09 Delivery Tracking

Permitted users shall track deliveries using unique tracking numbers.

## FR-10 Dashboard

The dashboard shall display fleet and delivery statistics appropriate to the authenticated user's role.

## FR-11 Search, Filtering, Sorting, and Pagination

List endpoints and pages shall support efficient data retrieval as the system grows.

## FR-12 Swagger/OpenAPI Documentation

The backend shall expose interactive API documentation.

## FR-13 Health Checks

The backend shall expose health and readiness endpoints.

## FR-14 Logging

The backend shall log requests, responses, failures, and administrative actions without exposing secrets.

## FR-15 Audit Information

Important records shall include creation and modification metadata.
