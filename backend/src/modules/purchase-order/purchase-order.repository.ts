import { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

const orderInclude = {
  partner: { select: { id: true, code: true, name: true } },
  inboundOrder: { select: { id: true, orderNo: true, status: true } },
  items: {
    include: {
      product: { select: { id: true, sku: true, name: true, unit: true } },
    },
  },
} satisfies Prisma.PurchaseOrderInclude;

export const purchaseOrderRepository = {
  findMany(params: { skip: number; take: number; status?: OrderStatus }) {
    const where: Prisma.PurchaseOrderWhereInput = {};
    if (params.status) {
      where.status = params.status;
    }

    return prisma.$transaction([
      prisma.purchaseOrder.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include: orderInclude,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.purchaseOrder.findUnique({
      where: { id },
      include: orderInclude,
    });
  },

  create(data: Prisma.PurchaseOrderCreateInput) {
    return prisma.purchaseOrder.create({
      data,
      include: orderInclude,
    });
  },

  update(id: string, data: Prisma.PurchaseOrderUpdateInput) {
    return prisma.purchaseOrder.update({
      where: { id },
      data,
      include: orderInclude,
    });
  },
};
