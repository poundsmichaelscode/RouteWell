# Preliminary ER Diagram

The Phase 1 ER model contains five required entities:

- Users
- Drivers
- Vehicles
- Routes
- Deliveries

## Relationships

- A user may have one driver profile.
- A driver may be assigned to many routes over time.
- A vehicle may be used by many routes over time.
- A route may contain many deliveries.

The executable PostgreSQL schema, constraints, indexes, and seed data belong to Phase 2.
