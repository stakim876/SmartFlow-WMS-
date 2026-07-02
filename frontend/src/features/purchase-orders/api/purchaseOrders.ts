import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export type OrderStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  product: { id: string; sku: string; name: string; unit: string };
}

export interface PurchaseOrder {
  id: string;
  orderNo: string;
  status: OrderStatus;
  note: string | null;
  requestedAt: string;
  approvedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  partner: { id: string; code: string; name: string };
  items: PurchaseOrderItem[];
  totalAmount: number;
  inboundOrder: { id: string; orderNo: string; status: OrderStatus } | null;
}

export interface CreatePurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export async function fetchPurchaseOrders(params?: { page?: number; status?: OrderStatus }) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: PurchaseOrder[]; meta: PaginationMeta }>
  >('/purchase-orders', { params });
  return data.data!;
}

export async function createPurchaseOrder(input: {
  partnerId: string;
  note?: string;
  items: CreatePurchaseOrderItem[];
}) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>('/purchase-orders', input);
  return data.data!;
}

export async function approvePurchaseOrder(id: string) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}/approve`,
  );
  return data.data!;
}

export async function completePurchaseOrder(id: string) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}/complete`,
  );
  return data.data!;
}

export async function convertPurchaseOrderToInbound(id: string) {
  const { data } = await apiClient.post<
    ApiResponse<{
      purchaseOrder: PurchaseOrder;
      inbound: { id: string; orderNo: string; status: OrderStatus };
    }>
  >(`/purchase-orders/${id}/convert-to-inbound`);
  return data.data!;
}

export async function cancelPurchaseOrder(id: string) {
  const { data } = await apiClient.post<ApiResponse<PurchaseOrder>>(
    `/purchase-orders/${id}/cancel`,
  );
  return data.data!;
}
