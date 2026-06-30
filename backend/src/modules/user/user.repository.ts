import { Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

const userInclude = {
  role: { select: { id: true, name: true, description: true } },
} satisfies Prisma.UserInclude;

export const userAdminRepository = {
  findMany(params: { skip: number; take: number; search?: string; roleId?: string }) {
    const where: Prisma.UserWhereInput = {};

    if (params.search) {
      where.OR = [
        { email: { contains: params.search } },
        { name: { contains: params.search } },
      ];
    }

    if (params.roleId) {
      where.roleId = params.roleId;
    }

    return prisma.$transaction([
      prisma.user.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: userInclude,
      }),
      prisma.user.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: userInclude,
    });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: userInclude,
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: userInclude,
    });
  },

  delete(id: string) {
    return prisma.user.delete({
      where: { id },
      include: userInclude,
    });
  },

  countByRoleName(roleName: string) {
    return prisma.user.count({
      where: { role: { name: roleName } },
    });
  },

  findAllRoles() {
    return prisma.role.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, description: true },
    });
  },
};
