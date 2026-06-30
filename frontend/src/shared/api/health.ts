import { apiClient, ApiResponse } from './client';

export async function healthCheck() {
  const { data } = await apiClient.get<ApiResponse<{ name: string; version: string; status: string }>>('/health');
  return data;
}
