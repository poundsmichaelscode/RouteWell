import { Role } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { paginationMeta } from "../utils/pagination";

export class CrudService {
  async customers(page: number, limit: number, search?: string) {
    const where: Prisma.CustomerWhereInput = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {};
    const [data, total] = await prisma.$transaction([prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }), prisma.customer.count({ where })]);
    return { data, meta: paginationMeta(total, page, limit) };
  }
  createCustomer(data: Prisma.CustomerCreateInput) { return prisma.customer.create({ data }); }
  updateCustomer(id: string, data: Prisma.CustomerUpdateInput) { return prisma.customer.update({ where: { id }, data }); }
  deleteCustomer(id: string) { return prisma.customer.delete({ where: { id } }); }

  async drivers(page: number, limit: number, search?: string) {
    const where: Prisma.DriverWhereInput = search ? { OR: [{ firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] } : {};
    const [data, total] = await prisma.$transaction([prisma.driver.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }), prisma.driver.count({ where })]);
    return { data, meta: paginationMeta(total, page, limit) };
  }
  async createDriver(data: Prisma.DriverUncheckedCreateInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    return prisma.driver.create({
      data: {
        ...data,
        userId: user?.role === Role.DRIVER ? user.id : undefined
      }
    });
  }

  async updateDriver(id: string, data: Prisma.DriverUncheckedUpdateInput) {
    const current = await prisma.driver.findUniqueOrThrow({ where: { id } });
    const email = typeof data.email === "string" ? data.email : current.email;
    const user = await prisma.user.findUnique({ where: { email } });
    return prisma.driver.update({
      where: { id },
      data: {
        ...data,
        userId: user?.role === Role.DRIVER ? user.id : null
      }
    });
  }
  deleteDriver(id: string) { return prisma.driver.delete({ where: { id } }); }

  async vehicles(page: number, limit: number, search?: string) {
    const where: Prisma.VehicleWhereInput = search ? { OR: [{ registrationNumber: { contains: search, mode: "insensitive" } }, { make: { contains: search, mode: "insensitive" } }, { model: { contains: search, mode: "insensitive" } }] } : {};
    const [data, total] = await prisma.$transaction([prisma.vehicle.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }), prisma.vehicle.count({ where })]);
    return { data, meta: paginationMeta(total, page, limit) };
  }
  createVehicle(data: Prisma.VehicleCreateInput) { return prisma.vehicle.create({ data }); }
  updateVehicle(id: string, data: Prisma.VehicleUpdateInput) { return prisma.vehicle.update({ where: { id }, data }); }
  deleteVehicle(id: string) { return prisma.vehicle.delete({ where: { id } }); }

  async routes(page: number, limit: number, search?: string) {
    const where: Prisma.RouteWhereInput = search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { origin: { contains: search, mode: "insensitive" } }, { destination: { contains: search, mode: "insensitive" } }] } : {};
    const [data, total] = await prisma.$transaction([prisma.route.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }), prisma.route.count({ where })]);
    return { data, meta: paginationMeta(total, page, limit) };
  }
  createRoute(data: Prisma.RouteCreateInput) { return prisma.route.create({ data }); }
  updateRoute(id: string, data: Prisma.RouteUpdateInput) { return prisma.route.update({ where: { id }, data }); }
  deleteRoute(id: string) { return prisma.route.delete({ where: { id } }); }
}
