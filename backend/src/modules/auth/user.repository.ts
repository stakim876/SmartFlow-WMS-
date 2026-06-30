import { prisma } from '../../core/config/database';
import { Prisma } from '@prisma/client';

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });
  },

  findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });
  },

  create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: { role: true },
    });
  },

  update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: { role: true },
    });
  },
};

export const refreshTokenRepository = {
  create(userId: string, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token: tokenHash, expiresAt },
    });
  },

  findByTokenHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: { user: { include: { role: true } } },
    });
  },

  deleteByTokenHash(tokenHash: string) {
    return prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  },

  deleteByUserId(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } });
  },
};

export const roleRepository = {
  findByName(name: string) {
    return prisma.role.findUnique({ where: { name } });
  },
};
