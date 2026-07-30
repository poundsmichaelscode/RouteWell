CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'DISPATCHER', 'DRIVER', 'VIEWER');
CREATE TYPE "DriverStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'OFF_DUTY', 'SUSPENDED');
CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'CAR', 'VAN', 'TRUCK', 'REFRIGERATED_TRUCK');
CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'OUT_OF_SERVICE');
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELLED');
CREATE TYPE "DeliveryPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "email" VARCHAR(255) NOT NULL UNIQUE,
  "password_hash" VARCHAR(255) NOT NULL, "first_name" VARCHAR(80) NOT NULL, "last_name" VARCHAR(80) NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'VIEWER', "active" BOOLEAN NOT NULL DEFAULT true,
  "last_login_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "refresh_token_hash" VARCHAR(64) NOT NULL, "user_agent" VARCHAR(500), "ip_address" VARCHAR(64),
  "expires_at" TIMESTAMPTZ NOT NULL, "revoked_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "customers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "name" VARCHAR(160) NOT NULL, "email" VARCHAR(255), "phone" VARCHAR(30),
  "address" VARCHAR(300) NOT NULL, "city" VARCHAR(100) NOT NULL, "state" VARCHAR(100), "country" VARCHAR(100) NOT NULL,
  "postal_code" VARCHAR(20), "notes" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "drivers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" UUID UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
  "first_name" VARCHAR(80) NOT NULL, "last_name" VARCHAR(80) NOT NULL, "email" VARCHAR(255) NOT NULL UNIQUE,
  "phone" VARCHAR(30) NOT NULL, "license_number" VARCHAR(80) NOT NULL UNIQUE, "license_expiry" DATE NOT NULL,
  "status" "DriverStatus" NOT NULL DEFAULT 'AVAILABLE', "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "vehicles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "registration_number" VARCHAR(40) NOT NULL UNIQUE,
  "make" VARCHAR(80) NOT NULL, "model" VARCHAR(80) NOT NULL, "year" INTEGER NOT NULL, "type" "VehicleType" NOT NULL,
  "capacity_kg" DECIMAL(10,2) NOT NULL, "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "last_service_at" DATE, "next_service_at" DATE, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "routes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "name" VARCHAR(160) NOT NULL, "origin" VARCHAR(250) NOT NULL,
  "destination" VARCHAR(250) NOT NULL, "distance_km" DECIMAL(10,2), "estimated_minutes" INTEGER,
  "active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "deliveries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "tracking_number" VARCHAR(40) NOT NULL UNIQUE,
  "customer_id" UUID NOT NULL REFERENCES "customers"("id") ON DELETE RESTRICT,
  "driver_id" UUID REFERENCES "drivers"("id") ON DELETE SET NULL, "vehicle_id" UUID REFERENCES "vehicles"("id") ON DELETE SET NULL,
  "route_id" UUID REFERENCES "routes"("id") ON DELETE SET NULL, "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "priority" "DeliveryPriority" NOT NULL DEFAULT 'NORMAL', "pickup_address" VARCHAR(300) NOT NULL,
  "delivery_address" VARCHAR(300) NOT NULL, "scheduled_at" TIMESTAMPTZ NOT NULL, "delivered_at" TIMESTAMPTZ,
  "weight_kg" DECIMAL(10,2), "notes" TEXT, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(), "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "delivery_events" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "delivery_id" UUID NOT NULL REFERENCES "deliveries"("id") ON DELETE CASCADE,
  "status" "DeliveryStatus" NOT NULL, "note" VARCHAR(500), "latitude" DECIMAL(9,6), "longitude" DECIMAL(9,6),
  "created_by_id" UUID REFERENCES "users"("id") ON DELETE SET NULL, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "action" VARCHAR(80) NOT NULL, "entity" VARCHAR(80) NOT NULL, "entity_id" VARCHAR(80), "ip_address" VARCHAR(64),
  "user_agent" VARCHAR(500), "metadata" JSONB, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE "notifications" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(), "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "title" VARCHAR(160) NOT NULL, "message" TEXT NOT NULL, "read_at" TIMESTAMPTZ, "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "users_role_active_idx" ON "users"("role", "active");
CREATE INDEX "sessions_user_expires_idx" ON "sessions"("user_id", "expires_at");
CREATE INDEX "customers_name_idx" ON "customers"("name");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "drivers_status_idx" ON "drivers"("status");
CREATE INDEX "vehicles_status_type_idx" ON "vehicles"("status", "type");
CREATE INDEX "routes_active_idx" ON "routes"("active");
CREATE INDEX "deliveries_status_scheduled_idx" ON "deliveries"("status", "scheduled_at");
CREATE INDEX "deliveries_customer_idx" ON "deliveries"("customer_id");
CREATE INDEX "deliveries_driver_idx" ON "deliveries"("driver_id");
CREATE INDEX "deliveries_vehicle_idx" ON "deliveries"("vehicle_id");
CREATE INDEX "delivery_events_delivery_created_idx" ON "delivery_events"("delivery_id", "created_at");
CREATE INDEX "audit_logs_entity_idx" ON "audit_logs"("entity", "entity_id");
CREATE INDEX "audit_logs_user_created_idx" ON "audit_logs"("user_id", "created_at");
CREATE INDEX "notifications_user_read_idx" ON "notifications"("user_id", "read_at");
