import { OrderStatus } from '@prisma/client';
import { emitNotificationsRefresh } from '../../core/realtime/socket';
import { prisma } from '../../core/config/database';import { LOW_STOCK_THRESHOLD } from '../dashboard/dashboard.repository';

export const notificationRepository = {
  findMany(userId: string, params: { skip: number; take: number; unreadOnly?: boolean }) {
    const where = {
      userId,
      ...(params.unreadOnly ? { isRead: false } : {}),
    };

    return prisma.$transaction([
      prisma.notification.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  upsertAlert(
    userId: string,
    type: string,
    data: { title: string; message: string; link?: string },
  ) {
    return prisma.notification.upsert({
      where: { userId_type: { userId, type } },
      create: {
        userId,
        type,
        title: data.title,
        message: data.message,
        link: data.link ?? null,
      },
      update: {
        title: data.title,
        message: data.message,
        link: data.link ?? null,
        isRead: false,
      },
    });
  },

  deleteAlert(userId: string, type: string) {
    return prisma.notification.deleteMany({ where: { userId, type } });
  },
};

async function countLowStock() {
  const grouped = await prisma.inventory.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
  });
  return grouped.filter((row) => (row._sum.quantity ?? 0) <= LOW_STOCK_THRESHOLD).length;
}

export const notificationService = {
  async syncAlerts(userId: string) {
    const [pendingInbound, pendingOutbound, lowStockCount] = await Promise.all([
      prisma.inboundOrder.count({ where: { status: OrderStatus.PENDING } }),
      prisma.outboundOrder.count({ where: { status: OrderStatus.PENDING } }),
      countLowStock(),
    ]);

    if (pendingInbound > 0) {
      await notificationRepository.upsertAlert(userId, 'PENDING_INBOUND', {
        title: '승인대기 입고',
        message: `승인이 필요한 입고 전표가 ${pendingInbound}건 있습니다.`,
        link: '/inbound',
      });
    } else {
      await notificationRepository.deleteAlert(userId, 'PENDING_INBOUND');
    }

    if (pendingOutbound > 0) {
      await notificationRepository.upsertAlert(userId, 'PENDING_OUTBOUND', {
        title: '승인대기 출고',
        message: `승인이 필요한 출고 전표가 ${pendingOutbound}건 있습니다.`,
        link: '/outbound',
      });
    } else {
      await notificationRepository.deleteAlert(userId, 'PENDING_OUTBOUND');
    }

    if (lowStockCount > 0) {
      await notificationRepository.upsertAlert(userId, 'LOW_STOCK', {
        title: '재고 부족',
        message: `재고가 ${LOW_STOCK_THRESHOLD}개 이하인 상품이 ${lowStockCount}종 있습니다.`,
        link: '/inventory',
      });
    } else {
      await notificationRepository.deleteAlert(userId, 'LOW_STOCK');
    }

    emitNotificationsRefresh(userId);
  },

  async list(userId: string, query: { page?: number; limit?: number; unreadOnly?: boolean }) {
    await this.syncAlerts(userId);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 20));
    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await notificationRepository.findMany(userId, {
      skip,
      take: limit,
      unreadOnly: query.unreadOnly,
    });

    return {
      items: items.map((item) => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        link: item.link,
        isRead: item.isRead,
        createdAt: item.createdAt,
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
      unreadCount,
    };
  },

  async markRead(userId: string, id: string) {
    await notificationRepository.markRead(id, userId);
    emitNotificationsRefresh(userId);
    return { id };
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
    emitNotificationsRefresh(userId);
    return { success: true };
  },

  async refreshAllUsers() {
    const users = await prisma.user.findMany({ select: { id: true } });
    await Promise.all(users.map((user) => this.syncAlerts(user.id)));
    emitNotificationsRefresh();
  },
};
