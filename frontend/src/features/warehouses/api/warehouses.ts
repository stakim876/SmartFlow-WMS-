import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
  locationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseDetail extends Warehouse {
  locations: Location[];
}

export interface Location {
  id: string;
  warehouseId: string;
  code: string;
  name: string | null;
  inventoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WarehouseInput {
  code: string;
  name: string;
  address?: string;
}

export interface LocationInput {
  code: string;
  name?: string;
}

export async function fetchWarehouses(params?: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: Warehouse[]; meta: PaginationMeta }>
  >('/warehouses', { params });
  return data.data!;
}

export async function fetchWarehouse(id: string) {
  const { data } = await apiClient.get<ApiResponse<WarehouseDetail>>(`/warehouses/${id}`);
  return data.data!;
}

export async function createWarehouse(input: WarehouseInput) {
  const { data } = await apiClient.post<ApiResponse<Warehouse>>('/warehouses', input);
  return data.data!;
}

export async function updateWarehouse(id: string, input: Partial<WarehouseInput & { isActive: boolean }>) {
  const { data } = await apiClient.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, input);
  return data.data!;
}

export async function deleteWarehouse(id: string) {
  const { data } = await apiClient.delete<ApiResponse<Warehouse>>(`/warehouses/${id}`);
  return data.data!;
}

export async function fetchLocations(warehouseId: string) {
  const { data } = await apiClient.get<ApiResponse<Location[]>>(
    `/warehouses/${warehouseId}/locations`,
  );
  return data.data!;
}

export async function createLocation(warehouseId: string, input: LocationInput) {
  const { data } = await apiClient.post<ApiResponse<Location>>(
    `/warehouses/${warehouseId}/locations`,
    input,
  );
  return data.data!;
}

export async function updateLocation(locationId: string, input: Partial<LocationInput>) {
  const { data } = await apiClient.put<ApiResponse<Location>>(`/locations/${locationId}`, input);
  return data.data!;
}

export async function deleteLocation(locationId: string) {
  const { data } = await apiClient.delete<ApiResponse<Location>>(`/locations/${locationId}`);
  return data.data!;
}
