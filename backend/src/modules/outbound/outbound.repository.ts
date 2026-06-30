import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

const orderInclude = {
  partner: { select: { id: true, code: true, name: true } },
  items: {
    include: {
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
  },
} satisfies Prisma.OutboundOrderInclude;

export const outboundRepository = {
  findMany(params: { skip: number; take: number; status?: OrderStatus }) {
    const where: Prisma.OutboundOrderWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }

    return prisma.$transaction([
      prisma.outboundOrder.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      }),
      prisma.outboundOrder.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.outboundOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  create(data: Prisma.OutboundOrderCreateInput) {
    return prisma.outboundOrder.create({
      data,
      include: orderInclude,
    });
  },

  update(id: string, data: Prisma.OutboundOrderUpdateInput) {
    return prisma.outboundOrder.update({
      where: { id },
      data,
      include: orderInclude,
    });
  },
};
