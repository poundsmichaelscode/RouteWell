import { prisma } from "../config/prisma";

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true, updatedAt: true } });
  }

  create(data: { firstName: string; lastName: string; email: string; passwordHash: string }) {
    return prisma.user.create({ data, select: { id: true, email: true, firstName: true, lastName: true, role: true, active: true, createdAt: true } });
  }
}
