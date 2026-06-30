import { dashboardRepository, LOW_STOCK_THRESHOLD } from './dashboard.repository';

function toRecentOrder(
  order: Awaited<ReturnType<typeof dashboardRepository.findRecentInbound>>[number],
) {
  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    partnerName: order.partner?.name ?? null,
    itemCount: order._count.items,
    createdAt: order.createdAt,
  };
}

export const dashboardService = {
  async getSummary() {
    const [
      activeProducts,
      inventorySum,
      pendingInbound,
      pendingOutbound,
      todayInboundCompleted,
      todayOutboundCompleted,
      lowStockCount,
      lowStockItems,
      recentInbound,
      recentOutbound,
      pinnedNotices,
    ] = await Promise.all([
      dashboardRepository.countActiveProducts(),
      dashboardRepository.sumInventoryQuantity(),
      dashboardRepository.countPendingInbound(),
      dashboardRepository.countPendingOutbound(),
      dashboardRepository.countTodayCompletedInbound(),
      dashboardRepository.countTodayCompletedOutbound(),
      dashboardRepository.countLowStockProducts(),
      dashboardRepository.findLowStockProducts(),
      dashboardRepository.findRecentInbound(),
      dashboardRepository.findRecentOutbound(),
      dashboardRepository.findPinnedNotices(),
    ]);

    return {
      kpi: {
        activeProducts,
        totalStockQty: inventorySum._sum.quantity ?? 0,
        pendingInbound,
        pendingOutbound,
        todayInboundCompleted,
        todayOutboundCompleted,
        lowStockCount,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
      },
      lowStockItems,
      recentInbound: recentInbound.map(toRecentOrder),
      recentOutbound: recentOutbound.map(toRecentOrder),
      pinnedNotices: pinnedNotices.map((notice) => ({
        id: notice.id,
        title: notice.title,
        content: notice.content,
        createdAt: notice.createdAt,
      })),
    };
  },
};
