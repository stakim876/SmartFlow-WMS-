import { apiClient, ApiResponse } from '@/shared/api/client';

export interface DashboardKpi {
  activeProducts: number;
  totalStockQty: number;
  pendingInbound: number;
  pendingOutbound: number;
  todayInboundCompleted: number;
  todayOutboundCompleted: number;
  lowStockCount: number;
  lowStockThreshold: number;
}

export interface DashboardLowStockItem {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNo: string;
  status: string;
  partnerName: string | null;
  itemCount: number;
  createdAt: string;
}

export interface DashboardNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface DashboardSummary {
  kpi: DashboardKpi;
  lowStockItems: DashboardLowStockItem[];
  recentInbound: DashboardRecentOrder[];
  recentOutbound: DashboardRecentOrder[];
  pinnedNotices: DashboardNotice[];
}

export async function fetchDashboardSummary() {
  const { data } = await apiClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  return data.data!;
}
