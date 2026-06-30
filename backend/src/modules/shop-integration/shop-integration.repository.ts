import { prisma } from '../../core/config/database';

export const shopIntegrationRepository = {
  listMappings() {
    return prisma.shopProductMapping.findMany({
      include: {
        product: { select: { id: true, sku: true, name: true, isActive: true } },
      },
      orderBy: { shopProductId: 'asc' },
    });
  },

  findMappingByShopProductId(shopProductId: number) {
    return prisma.shopProductMapping.findUnique({ where: { shopProductId } });
  },

  upsertMapping(data: {
    shopProductId: number;
    shopSku: string | null;
    shopName: string | null;
    productId: string;
  }) {
    return prisma.shopProductMapping.upsert({
      where: { shopProductId: data.shopProductId },
      create: data,
      update: {
        shopSku: data.shopSku,
        shopName: data.shopName,
        productId: data.productId,
      },
      include: {
        product: { select: { id: true, sku: true, name: true, isActive: true } },
      },
    });
  },

  updateStockPushTime(id: string) {
    return prisma.shopProductMapping.update({
      where: { id },
      data: { lastStockPush: new Date() },
    });
  },

  listOrderSyncs() {
    return prisma.shopOrderSync.findMany({
      include: {
        outboundOrder: {
          select: { id: true, orderNo: true, status: true },
        },
      },
      orderBy: { syncedAt: 'desc' },
    });
  },

  findOrderSyncByShopOrderId(shopOrderId: number) {
    return prisma.shopOrderSync.findUnique({ where: { shopOrderId } });
  },

  createOrderSync(data: {
    shopOrderId: number;
    outboundOrderId: string;
    shopStatus: string;
  }) {
    return prisma.shopOrderSync.create({ data });
  },

  markOrderFulfilled(shopOrderId: number) {
    return prisma.shopOrderSync.update({
      where: { shopOrderId },
      data: { fulfilledAt: new Date() },
    });
  },

  recordOrderSyncError(shopOrderId: number, message: string) {
    return prisma.shopOrderSync.upsert({
      where: { shopOrderId },
      create: { shopOrderId, errorMessage: message },
      update: { errorMessage: message },
    });
  },
};
