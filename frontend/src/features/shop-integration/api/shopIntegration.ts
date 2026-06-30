import { apiClient, ApiResponse } from '@/shared/api/client';

export interface ShopIntegrationStatus {
  configured: boolean;
  connected: boolean;
  shopApiUrl: string;
  shopService?: string;
  mappingCount: number;
  orderSyncCount: number;
}

export interface ShopProductMapping {
  id: string;
  shopProductId: number;
  shopSku: string | null;
  shopName: string | null;
  productId: string;
  lastStockPush: string | null;
  product: {
    id: string;
    sku: string;
    name: string;
    isActive: boolean;
  };
}

export interface ShopOrderSync {
  id: string;
  shopOrderId: number;
  outboundOrderId: string | null;
  shopStatus: string | null;
  syncedAt: string;
  fulfilledAt: string | null;
  errorMessage: string | null;
  outboundOrder: {
    id: string;
    orderNo: string;
    status: string;
  } | null;
}

export interface SyncProductsResult {
  totalShopProducts: number;
  mappedCount: number;
  skippedCount: number;
}

export interface PushStockResult {
  pushedCount: number;
}

export interface PullOrdersResult {
  shopOrderCount: number;
  createdCount: number;
  skippedCount: number;
}

export interface FulfillOrderInput {
  carrierCode: string;
  trackingNumber: string;
  status?: 'preparing' | 'shipping' | 'done';
}

export async function fetchShopStatus() {
  const { data } = await apiClient.get<ApiResponse<ShopIntegrationStatus>>(
    '/shop-integration/status',
  );
  return data.data!;
}

export async function fetchShopMappings() {
  const { data } = await apiClient.get<ApiResponse<ShopProductMapping[]>>(
    '/shop-integration/mappings',
  );
  return data.data!;
}

export async function fetchShopOrderSyncs() {
  const { data } = await apiClient.get<ApiResponse<ShopOrderSync[]>>('/shop-integration/orders');
  return data.data!;
}

export async function syncShopProducts() {
  const { data } = await apiClient.post<ApiResponse<SyncProductsResult>>(
    '/shop-integration/sync-products',
  );
  return data.data!;
}

export async function pushShopStock() {
  const { data } = await apiClient.post<ApiResponse<PushStockResult>>(
    '/shop-integration/push-stock',
  );
  return data.data!;
}

export async function pullShopOrders() {
  const { data } = await apiClient.post<ApiResponse<PullOrdersResult>>(
    '/shop-integration/pull-orders',
  );
  return data.data!;
}

export async function fulfillShopOrder(shopOrderId: number, input: FulfillOrderInput) {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/shop-integration/orders/${shopOrderId}/fulfill`,
    input,
  );
  return data.data!;
}
