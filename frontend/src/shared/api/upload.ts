import { apiClient, ApiResponse } from '@/shared/api/client';

export interface UploadResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ApiResponse<UploadResult>>('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data!;
}
