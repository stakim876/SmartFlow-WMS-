import { OrderStatus } from '@prisma/client';
import { prisma } from '../../core/config/database';

export const LOW_STOCK_THRESHOLD = 10;
const RECENT_LIMIT = 5;
const NOTICE_LIMIT = 3;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

const recentOrderSelect = {
  id: true,
  orderNo: true,
  status: true,
  createdAt: true,
  partner: { select: { name: true } },
  _count: { select: { items: true } },
} as const;

export const dashboardRepository = {
  countActiveProducts() {
    return prisma.product.count({ where: { isActive: true } });
  },

  sumInventoryQuantity() {
    return prisma.inventory.aggregate({ _sum: { quantity: true } });
  },

  countPendingInbound() {
    return prisma.inboundOrder.count({ where: { status: OrderStatus.PENDING } });
  },

  countPendingOutbound() {
    return prisma.outboundOrder.count({ where: { status: OrderStatus.PENDING } });
  },

  countTodayCompletedInbound() {
    return prisma.inboundOrder.count({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: { gte: startOfToday() },
      },
    });
  },

  countTodayCompletedOutbound() {
    return prisma.outboundOrder.count({
      where: {
        status: OrderStatus.COMPLETED,
        completedAt: { gte: startOfToday() },
      },
    });
  },

  async findLowStockProducts(limit = RECENT_LIMIT) {
    const grouped = await prisma.inventory.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const lowStockIds = grouped
      .filter((row) => (row._sum.quantity ?? 0) <= LOW_STOCK_THRESHOLD)
      .map((row) => row.productId);

    if (lowStockIds.length === 0) {
      return [];
    }

    const quantityMap = new Map(
      grouped.map((row) => [row.productId, row._sum.quantity ?? 0]),
    );

    const products = await prisma.product.findMany({
      where: { id: { in: lowStockIds }, isActive: true },
      select: { id: true, sku: true, name: true, unit: true },
      orderBy: { name: 'asc' },
      take: limit,
    });

    return products
      .map((product) => ({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        unit: product.unit,
        quantity: quantityMap.get(product.id) ?? 0,
      }))
      .sort((a, b) => a.quantity - b.quantity);
  },

  async countLowStockProducts() {
    const grouped = await prisma.inventory.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });
    return grouped.filter((row) => (row._sum.quantity ?? 0) <= LOW_STOCK_THRESHOLD).length;
  },

  findRecentInbound() {
    return prisma.inboundOrder.findMany({
      take: RECENT_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: recentOrderSelect,
    });
  },

  findRecentOutbound() {
    return prisma.outboundOrder.findMany({
      take: RECENT_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: recentOrderSelect,
    });
  },

  findPinnedNotices() {
    return prisma.notice.findMany({
      where: { isPinned: true },
      take: NOTICE_LIMIT,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
      },
    });
  },
};
