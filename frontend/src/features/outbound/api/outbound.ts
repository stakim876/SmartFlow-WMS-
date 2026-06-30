import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export type OrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  locationId: string | null;
  product: { id: string; sku: string; name: string; unit: string };
}

export interface OutboundOrder {
  id: string;
  orderNo: string;
  status: OrderStatus;
  note: string | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  partner: { id: string; code: string; name: string } | null;
  items: OrderItem[];
}

export interface CreateOrderItem {
  productId: string;
  quantity: number;
  locationId?: string;
}

export async function fetchOutboundOrders(params?: { page?: number; status?: OrderStatus }) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: OutboundOrder[]; meta: PaginationMeta }>
  >('/outbound', { params });
  return data.data!;
}

export async function createOutboundOrder(input: {
  partnerId?: string;
  note?: string;
  items: CreateOrderItem[];
}) {
  const { data } = await apiClient.post<ApiResponse<OutboundOrder>>('/outbound', input);
  return data.data!;
}

export async function approveOutbound(id: string) {
  const { data } = await apiClient.post<ApiResponse<OutboundOrder>>(`/outbound/${id}/approve`);
  return data.data!;
}

export async function completeOutbound(
  id: string,
  items?: { itemId: string; locationId: string }[],
) {
  const { data } = await apiClient.post<ApiResponse<OutboundOrder>>(`/outbound/${id}/complete`, {
    items,
  });
  return data.data!;
}

export async function cancelOutbound(id: string) {
  const { data } = await apiClient.post<ApiResponse<OutboundOrder>>(`/outbound/${id}/cancel`);
  return data.data!;
}
