import { PrismaClient, DeliveryPriority, DeliveryStatus, DriverStatus, Role, VehicleStatus, VehicleType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("RouteWellAdmin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@routewell.local" },
    update: {},
    create: { email: "admin@routewell.local", firstName: "RouteWell", lastName: "Admin", passwordHash, role: Role.ADMIN }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "10000000-0000-4000-8000-000000000001" },
    update: {},
    create: { id: "10000000-0000-4000-8000-000000000001", name: "Acme Retail Lagos", email: "operations@acme.example", phone: "+2348000000001", address: "12 Marina Road", city: "Lagos", state: "Lagos", country: "Nigeria" }
  });
  const driver = await prisma.driver.upsert({
    where: { email: "driver@routewell.local" },
    update: {},
    create: { firstName: "Tunde", lastName: "Adebayo", email: "driver@routewell.local", phone: "+2348000000002", licenseNumber: "LAG-RW-001", licenseExpiry: new Date("2028-12-31"), status: DriverStatus.AVAILABLE }
  });
  const vehicle = await prisma.vehicle.upsert({
    where: { registrationNumber: "RW-LAG-001" },
    update: {},
    create: { registrationNumber: "RW-LAG-001", make: "Ford", model: "Transit", year: 2024, type: VehicleType.VAN, capacityKg: 1400, status: VehicleStatus.AVAILABLE }
  });
  const route = await prisma.route.upsert({
    where: { id: "10000000-0000-4000-8000-000000000002" },
    update: {},
    create: { id: "10000000-0000-4000-8000-000000000002", name: "Lagos Island to Ikeja", origin: "Marina, Lagos Island", destination: "Allen Avenue, Ikeja", distanceKm: 28.5, estimatedMinutes: 70 }
  });

  await prisma.notification.upsert({
    where: { id: "10000000-0000-4000-8000-000000000003" },
    update: {},
    create: { id: "10000000-0000-4000-8000-000000000003", userId: admin.id, title: "Welcome to RouteWell", message: "Your secure logistics operations workspace is ready." }
  });

  const existing = await prisma.delivery.findUnique({ where: { trackingNumber: "RW-DEMO-0001" } });
  if (!existing) {
    await prisma.delivery.create({
      data: {
        trackingNumber: "RW-DEMO-0001", customerId: customer.id, driverId: driver.id, vehicleId: vehicle.id, routeId: route.id,
        pickupAddress: "12 Marina Road, Lagos", deliveryAddress: "25 Allen Avenue, Ikeja", scheduledAt: new Date(Date.now() + 86400000),
        priority: DeliveryPriority.HIGH, status: DeliveryStatus.ASSIGNED, weightKg: 125,
        events: { create: [{ status: DeliveryStatus.PENDING, note: "Delivery created", createdById: admin.id }, { status: DeliveryStatus.ASSIGNED, note: "Driver and vehicle assigned", createdById: admin.id }] }
      }
    });
  }
  console.log("Seed complete. Demo admin: admin@routewell.local / RouteWellAdmin123!");
}

main().finally(async () => prisma.$disconnect());
