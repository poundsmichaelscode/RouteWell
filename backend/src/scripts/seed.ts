import "dotenv/config";
import {
  DeliveryPriority,
  DeliveryStatus,
  DriverStatus,
  PrismaClient,
  Role,
  VehicleStatus,
  VehicleType
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const driverPassword = process.env.SEED_DRIVER_PASSWORD;
  if (!adminPassword || adminPassword.length < 12 || !driverPassword || driverPassword.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD and SEED_DRIVER_PASSWORD must each contain at least 12 characters");
  }
  const [adminPasswordHash, driverPasswordHash] = await Promise.all([
    bcrypt.hash(adminPassword, 12),
    bcrypt.hash(driverPassword, 12)
  ]);

  const admin = await prisma.user.upsert({
    where: { email: "admin@routewell.local" },
    update: {
      active: true,
      role: Role.ADMIN,
      firstName: "RouteWell",
      lastName: "Admin",
      passwordHash: adminPasswordHash
    },
    create: {
      email: "admin@routewell.local",
      firstName: "RouteWell",
      lastName: "Admin",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN
    }
  });

  const driverUser = await prisma.user.upsert({
    where: { email: "driver@routewell.local" },
    update: {
      active: true,
      role: Role.DRIVER,
      firstName: "Tunde",
      lastName: "Adebayo",
      passwordHash: driverPasswordHash
    },
    create: {
      email: "driver@routewell.local",
      firstName: "Tunde",
      lastName: "Adebayo",
      passwordHash: driverPasswordHash,
      role: Role.DRIVER
    }
  });

  const customer = await prisma.customer.upsert({
    where: { id: "10000000-0000-4000-8000-000000000001" },
    update: {
      name: "Acme Retail Lagos",
      email: "operations@acme.example",
      phone: "+2348000000001",
      address: "12 Marina Road",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria",
      active: true
    },
    create: {
      id: "10000000-0000-4000-8000-000000000001",
      name: "Acme Retail Lagos",
      email: "operations@acme.example",
      phone: "+2348000000001",
      address: "12 Marina Road",
      city: "Lagos",
      state: "Lagos",
      country: "Nigeria"
    }
  });

  const driver = await prisma.driver.upsert({
    where: { email: "driver@routewell.local" },
    update: {
      userId: driverUser.id,
      firstName: "Tunde",
      lastName: "Adebayo",
      phone: "+2348000000002",
      licenseNumber: "LAG-RW-001",
      licenseExpiry: new Date("2028-12-31"),
      status: DriverStatus.AVAILABLE
    },
    create: {
      userId: driverUser.id,
      firstName: "Tunde",
      lastName: "Adebayo",
      email: "driver@routewell.local",
      phone: "+2348000000002",
      licenseNumber: "LAG-RW-001",
      licenseExpiry: new Date("2028-12-31"),
      status: DriverStatus.AVAILABLE
    }
  });

  const vehicle = await prisma.vehicle.upsert({
    where: { registrationNumber: "RW-LAG-001" },
    update: {
      make: "Ford",
      model: "Transit",
      year: 2024,
      type: VehicleType.VAN,
      capacityKg: 1400,
      status: VehicleStatus.AVAILABLE
    },
    create: {
      registrationNumber: "RW-LAG-001",
      make: "Ford",
      model: "Transit",
      year: 2024,
      type: VehicleType.VAN,
      capacityKg: 1400,
      status: VehicleStatus.AVAILABLE
    }
  });

  const route = await prisma.route.upsert({
    where: { id: "10000000-0000-4000-8000-000000000002" },
    update: {
      name: "Lagos Island to Ikeja",
      origin: "Marina, Lagos Island",
      destination: "Allen Avenue, Ikeja",
      distanceKm: 28.5,
      estimatedMinutes: 70,
      active: true
    },
    create: {
      id: "10000000-0000-4000-8000-000000000002",
      name: "Lagos Island to Ikeja",
      origin: "Marina, Lagos Island",
      destination: "Allen Avenue, Ikeja",
      distanceKm: 28.5,
      estimatedMinutes: 70
    }
  });

  await prisma.notification.upsert({
    where: { id: "10000000-0000-4000-8000-000000000003" },
    update: {
      userId: admin.id,
      title: "Welcome to RouteWell",
      message: "Your secure logistics operations workspace is ready.",
      readAt: null
    },
    create: {
      id: "10000000-0000-4000-8000-000000000003",
      userId: admin.id,
      title: "Welcome to RouteWell",
      message: "Your secure logistics operations workspace is ready."
    }
  });

  const existing = await prisma.delivery.findUnique({
    where: { trackingNumber: "RW-DEMO-0001" }
  });

  if (!existing) {
    await prisma.$transaction(async (transaction) => {
      const delivery = await transaction.delivery.create({
        data: {
          trackingNumber: "RW-DEMO-0001",
          customerId: customer.id,
          driverId: driver.id,
          vehicleId: vehicle.id,
          routeId: route.id,
          pickupAddress: "12 Marina Road, Lagos",
          deliveryAddress: "25 Allen Avenue, Ikeja",
          scheduledAt: new Date(Date.now() + 86_400_000),
          priority: DeliveryPriority.HIGH,
          status: DeliveryStatus.ASSIGNED,
          weightKg: 125
        }
      });

      await transaction.deliveryEvent.createMany({
        data: [
          {
            deliveryId: delivery.id,
            status: DeliveryStatus.PENDING,
            note: "Delivery created",
            createdById: admin.id
          },
          {
            deliveryId: delivery.id,
            status: DeliveryStatus.ASSIGNED,
            note: "Driver and vehicle assigned",
            createdById: admin.id
          }
        ]
      });
    });
  }

  console.log("Seed complete.");
  console.log("Admin: admin@routewell.local");
  console.log("Driver: driver@routewell.local");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
