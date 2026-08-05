import {
  DeliveryPriority,
  DeliveryStatus,
  DriverStatus,
  Role,
  VehicleStatus,
  VehicleType
} from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../utils/pagination";

const optionalTrimmed = (max: number) => z.string().trim().max(max).optional();
const nullableUuid = z.string().uuid().nullable().optional();

export const idParams = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.unknown().optional(),
  query: z.unknown().optional()
});

export const listQuery = z.object({
  query: paginationSchema,
  body: z.unknown().optional(),
  params: z.unknown().optional()
});

const customerBody = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().toLowerCase().optional(),
  phone: optionalTrimmed(30),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  state: optionalTrimmed(80),
  country: z.string().trim().min(2).max(80),
  postalCode: optionalTrimmed(20),
  notes: optionalTrimmed(1000)
});

export const customerCreate = z.object({
  body: customerBody,
  query: z.unknown().optional(),
  params: z.unknown().optional()
});

export const customerUpdate = z.object({
  body: customerBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

const driverBody = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  email: z.string().trim().email().toLowerCase(),
  phone: z.string().trim().min(7).max(30),
  licenseNumber: z.string().trim().min(3).max(50),
  licenseExpiry: z.coerce.date(),
  status: z.nativeEnum(DriverStatus).optional()
});

export const driverCreate = z.object({
  body: driverBody,
  query: z.unknown().optional(),
  params: z.unknown().optional()
});

export const driverUpdate = z.object({
  body: driverBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

const vehicleBody = z.object({
  registrationNumber: z.string().trim().min(2).max(30),
  make: z.string().trim().min(2).max(50),
  model: z.string().trim().min(1).max(50),
  year: z.coerce.number().int().min(1990).max(new Date().getFullYear() + 1),
  type: z.nativeEnum(VehicleType),
  capacityKg: z.coerce.number().positive(),
  status: z.nativeEnum(VehicleStatus).optional(),
  lastServiceAt: z.coerce.date().nullable().optional(),
  nextServiceAt: z.coerce.date().nullable().optional()
});

export const vehicleCreate = z.object({
  body: vehicleBody,
  query: z.unknown().optional(),
  params: z.unknown().optional()
});

export const vehicleUpdate = z.object({
  body: vehicleBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

const routeBody = z.object({
  name: z.string().trim().min(2).max(100),
  origin: z.string().trim().min(2).max(160),
  destination: z.string().trim().min(2).max(160),
  distanceKm: z.coerce.number().nonnegative().nullable().optional(),
  estimatedMinutes: z.coerce.number().int().positive().nullable().optional(),
  active: z.boolean().optional()
});

export const routeCreate = z.object({
  body: routeBody,
  query: z.unknown().optional(),
  params: z.unknown().optional()
});

export const routeUpdate = z.object({
  body: routeBody.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

const deliveryBody = z.object({
  customerId: z.string().uuid(),
  driverId: z.string().uuid().optional(),
  vehicleId: z.string().uuid().optional(),
  routeId: z.string().uuid().optional(),
  pickupAddress: z.string().trim().min(5).max(250),
  deliveryAddress: z.string().trim().min(5).max(250),
  scheduledAt: z.coerce.date(),
  priority: z.nativeEnum(DeliveryPriority).optional(),
  weightKg: z.coerce.number().nonnegative().optional(),
  notes: optionalTrimmed(1000)
});

export const deliveryCreate = z.object({
  body: deliveryBody,
  query: z.unknown().optional(),
  params: z.unknown().optional()
});

// Delivery status is intentionally excluded. All status changes must use the
// dedicated state-machine endpoint so an immutable DeliveryEvent is written.
export const deliveryUpdate = z.object({
  body: deliveryBody.partial().extend({
    driverId: nullableUuid,
    vehicleId: nullableUuid,
    routeId: nullableUuid,
    weightKg: z.coerce.number().nonnegative().nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional()
  }).refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

export const deliveryStatusUpdate = z.object({
  body: z.object({
    status: z.nativeEnum(DeliveryStatus),
    note: optionalTrimmed(500),
    latitude: z.coerce.number().min(-90).max(90).optional(),
    longitude: z.coerce.number().min(-180).max(180).optional()
  }),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

export const userUpdate = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional(),
    role: z.nativeEnum(Role).optional(),
    active: z.boolean().optional()
  }).refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.object({ id: z.string().uuid() }),
  query: z.unknown().optional()
});

export const profileUpdate = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(50).optional(),
    lastName: z.string().trim().min(2).max(50).optional()
  }).refine((value) => Object.keys(value).length > 0, "At least one field is required"),
  params: z.unknown().optional(),
  query: z.unknown().optional()
});
