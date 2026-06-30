import { PartnerType, Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

export const partnerRepository = {
  findMany(params: {
    skip: number;
    take: number;
    search?: string;
    type?: PartnerType;
    isActive?: boolean;
  }) {
    const where: Prisma.PartnerWhereInput = {};

    if (params.search) {
      where.OR = [
        { code: { contains: params.search } },
        { name: { contains: params.search } },
      ];
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return prisma.$transaction([
      prisma.partner.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.partner.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.partner.findUnique({ where: { id } });
  },

  findByCode(code: string) {
    return prisma.partner.findUnique({ where: { code } });
  },

  create(data: Prisma.PartnerCreateInput) {
    return prisma.partner.create({ data });
  },

  update(id: string, data: Prisma.PartnerUpdateInput) {
    return prisma.partner.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.partner.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
