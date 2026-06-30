import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

const orderInclude = {
  partner: { select: { id: true, code: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
  },
} satisfies Prisma.InboundOrderInclude;

export const inboundRepository = {
  findMany(params: { skip: number; take: number; status?: OrderStatus }) {
    const where: Prisma.InboundOrderWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }

    return prisma.$transaction([
      prisma.inboundOrder.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      }),
      prisma.inboundOrder.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.inboundOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  create(data: Prisma.InboundOrderCreateInput) {
    return prisma.inboundOrder.create({
      data,
      include: orderInclude,
    });
  },

  update(id: string, data: Prisma.InboundOrderUpdateInput) {
    return prisma.inboundOrder.update({
      where: { id },
      data,
      include: orderInclude,
    });
  },
};
