import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  items: Product[];
  meta: PaginationMeta;
}

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  price: number;
}

export async function fetchProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'sku' | 'name' | 'price';
  sortOrder?: 'asc' | 'desc';
}) {
  const { data } = await apiClient.get<ApiResponse<ProductListResponse>>('/products', {
    params,
  });
  return data.data!;
}

export async function createProduct(input: ProductInput) {
  const { data } = await apiClient.post<ApiResponse<Product>>('/products', input);
  return data.data!;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { data } = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, input);
  return data.data!;
}

export async function deleteProduct(id: string) {
  const { data } = await apiClient.delete<ApiResponse<Product>>(`/products/${id}`);
  return data.data!;
}
