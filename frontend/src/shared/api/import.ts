import { apiClient, ApiResponse } from '@/shared/api/client';

export interface ImportProductsResult {
  created: number;
  skipped: number;
  errors: string[];
  total: number;
}

export async function importProductsExcel(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ApiResponse<ImportProductsResult>>(
    '/import/products',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data!;
}
