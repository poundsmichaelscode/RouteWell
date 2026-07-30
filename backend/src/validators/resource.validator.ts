import { z } from "zod";
import { DeliveryPriority, DeliveryStatus, DriverStatus, Role, VehicleStatus, VehicleType } from "@prisma/client";
import { paginationSchema } from "../utils/pagination";

export const idParams = z.object({ params: z.object({ id: z.string().uuid() }), body: z.unknown().optional(), query: z.unknown().optional() });
export const listQuery = z.object({ query: paginationSchema, body: z.unknown().optional(), params: z.unknown().optional() });

export const customerCreate = z.object({ body: z.object({
  name: z.string().trim().min(2).max(120), email: z.string().email().optional(), phone: z.string().trim().min(7).max(30).optional(),
  address: z.string().trim().min(5).max(250), city: z.string().trim().min(2).max(80), state: z.string().trim().max(80).optional(), country: z.string().trim().min(2).max(80), postalCode: z.string().trim().max(20).optional(), notes: z.string().max(1000).optional()
}), query: z.unknown().optional(), params: z.unknown().optional() });
export const customerUpdate = z.object({ body: customerCreate.shape.body.partial(), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const driverCreate = z.object({ body: z.object({
  firstName: z.string().trim().min(2).max(50), lastName: z.string().trim().min(2).max(50), email: z.string().email(), phone: z.string().min(7).max(30),
  licenseNumber: z.string().min(3).max(50), licenseExpiry: z.coerce.date(), status: z.nativeEnum(DriverStatus).default(DriverStatus.AVAILABLE)
}), query: z.unknown().optional(), params: z.unknown().optional() });
export const driverUpdate = z.object({ body: driverCreate.shape.body.partial(), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const vehicleCreate = z.object({ body: z.object({
  registrationNumber: z.string().trim().min(2).max(30), make: z.string().trim().min(2).max(50), model: z.string().trim().min(1).max(50), year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  type: z.nativeEnum(VehicleType), capacityKg: z.number().positive(), status: z.nativeEnum(VehicleStatus).default(VehicleStatus.AVAILABLE)
}), query: z.unknown().optional(), params: z.unknown().optional() });
export const vehicleUpdate = z.object({ body: vehicleCreate.shape.body.partial(), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const routeCreate = z.object({ body: z.object({
  name: z.string().trim().min(2).max(100), origin: z.string().trim().min(2).max(160), destination: z.string().trim().min(2).max(160), distanceKm: z.number().nonnegative().optional(), estimatedMinutes: z.number().int().positive().optional(), active: z.boolean().default(true)
}), query: z.unknown().optional(), params: z.unknown().optional() });
export const routeUpdate = z.object({ body: routeCreate.shape.body.partial(), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const deliveryCreate = z.object({ body: z.object({
  customerId: z.string().uuid(), driverId: z.string().uuid().optional(), vehicleId: z.string().uuid().optional(), routeId: z.string().uuid().optional(),
  pickupAddress: z.string().min(5).max(250), deliveryAddress: z.string().min(5).max(250), scheduledAt: z.coerce.date(),
  priority: z.nativeEnum(DeliveryPriority).default(DeliveryPriority.NORMAL), weightKg: z.number().nonnegative().optional(), notes: z.string().max(1000).optional()
}), query: z.unknown().optional(), params: z.unknown().optional() });
export const deliveryUpdate = z.object({ body: deliveryCreate.shape.body.partial().extend({ status: z.nativeEnum(DeliveryStatus).optional() }), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });
export const deliveryStatusUpdate = z.object({ body: z.object({ status: z.nativeEnum(DeliveryStatus), note: z.string().max(500).optional(), latitude: z.number().min(-90).max(90).optional(), longitude: z.number().min(-180).max(180).optional() }), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const userUpdate = z.object({ body: z.object({ firstName: z.string().min(2).max(50).optional(), lastName: z.string().min(2).max(50).optional(), role: z.nativeEnum(Role).optional(), active: z.boolean().optional() }), params: z.object({ id: z.string().uuid() }), query: z.unknown().optional() });

export const profileUpdate = z.object({ body: z.object({ firstName: z.string().trim().min(2).max(50).optional(), lastName: z.string().trim().min(2).max(50).optional() }).refine((value) => Object.keys(value).length > 0, "At least one field is required"), params: z.unknown().optional(), query: z.unknown().optional() });
