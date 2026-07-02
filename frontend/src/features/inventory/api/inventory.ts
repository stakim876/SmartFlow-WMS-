import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface InventoryItem {
  id: string;
  quantity: number;
  updatedAt: string;
  product: {
    id: string;
    sku: string;
    name: string;
    unit: string;
    isActive: boolean;
  };
  location: {
    id: string;
    code: string;
    name: string | null;
    warehouse: {
      id: string;
      code: string;
      name: string;
    };
  };
}

export interface WarehouseOption {
  id: string;
  code: string;
  name: string;
}

export interface LocationOption {
  id: string;
  code: string;
  name: string | null;
  label: string;
  warehouse: {
    id: string;
    code: string;
    name: string;
  };
}

export interface InventoryListResponse {
  items: InventoryItem[];
  meta: PaginationMeta;
}

export async function fetchInventory(params?: {
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
}) {
  const { data } = await apiClient.get<ApiResponse<InventoryListResponse>>('/inventory', {
    params,
  });
  return data.data!;
}

export async function fetchWarehouses() {
  const { data } = await apiClient.get<ApiResponse<WarehouseOption[]>>('/inventory/warehouses');
  return data.data!;
}

export async function adjustInventory(id: string, quantity: number, note?: string) {
  const { data } = await apiClient.patch<ApiResponse<InventoryItem>>(`/inventory/${id}/adjust`, {
    quantity,
    note,
  });
  return data.data!;
}

export async function fetchLocations() {
  const { data } = await apiClient.get<ApiResponse<LocationOption[]>>('/inventory/locations');
  return data.data!;
}

export async function transferInventory(input: {
  inventoryId: string;
  toLocationId: string;
  quantity: number;
  note?: string;
}) {
  const { data } = await apiClient.post<ApiResponse<InventoryItem>>('/inventory/transfer', input);
  return data.data!;
}

export type MovementType = 'INBOUND' | 'OUTBOUND' | 'ADJUSTMENT' | 'TRANSFER';

export interface InventoryMovement {
  id: string;
  type: MovementType;
  quantity: number;
  beforeQty: number | null;
  afterQty: number | null;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
  createdById: string | null;
  createdByName: string | null;
  product: { id: string; sku: string; name: string };
  location: {
    id: string;
    code: string;
    name: string | null;
    warehouse: { id: string; code: string; name: string };
  } | null;
}

export interface MovementListResponse {
  items: InventoryMovement[];
  meta: PaginationMeta;
}

export async function fetchMovements(params?: {
  page?: number;
  limit?: number;
  productId?: string;
  type?: MovementType;
}) {
  const { data } = await apiClient.get<ApiResponse<MovementListResponse>>('/inventory/movements', {
    params,
  });
  return data.data!;
}
