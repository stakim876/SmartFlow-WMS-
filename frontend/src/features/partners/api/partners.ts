import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export type PartnerType = 'SUPPLIER' | 'CUSTOMER' | 'BOTH';

export interface Partner {
  id: string;
  code: string;
  name: string;
  type: PartnerType;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerInput {
  code: string;
  name: string;
  type: PartnerType;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export async function fetchPartners(params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: PartnerType;
  isActive?: boolean;
}) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: Partner[]; meta: PaginationMeta }>
  >('/partners', { params });
  return data.data!;
}

/** 입고/출고 폼용 활성 거래처 목록 */
export async function fetchActivePartners() {
  const result = await fetchPartners({ isActive: true, limit: 100 });
  return result.items;
}

export async function createPartner(input: PartnerInput) {
  const { data } = await apiClient.post<ApiResponse<Partner>>('/partners', input);
  return data.data!;
}

export async function updatePartner(id: string, input: Partial<PartnerInput>) {
  const { data } = await apiClient.put<ApiResponse<Partner>>(`/partners/${id}`, input);
  return data.data!;
}

export async function deletePartner(id: string) {
  const { data } = await apiClient.delete<ApiResponse<Partner>>(`/partners/${id}`);
  return data.data!;
}
