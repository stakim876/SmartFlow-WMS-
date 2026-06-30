import { prisma } from '../../core/config/database';
import { Prisma } from '@prisma/client';

export const productRepository = {
  findMany(params: {
    skip: number;
    take: number;
    search?: string;
    isActive?: boolean;
    orderBy?: Prisma.ProductOrderByWithRelationInput;
  }) {
    const where: Prisma.ProductWhereInput = {};

    if (params.search) {
      where.OR = [
        { sku: { contains: params.search } },
        { name: { contains: params.search } },
      ];
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return prisma.$transaction([
      prisma.product.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy ?? { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.product.findUnique({ where: { id } });
  },

  findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({ data });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
