import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface Notice {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NoticeInput {
  title: string;
  content: string;
  isPinned?: boolean;
}

export async function fetchNotices(params?: { page?: number; limit?: number; search?: string }) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: Notice[]; meta: PaginationMeta }>
  >('/notices', { params });
  return data.data!;
}

export async function fetchNotice(id: string) {
  const { data } = await apiClient.get<ApiResponse<Notice>>(`/notices/${id}`);
  return data.data!;
}

export async function createNotice(input: NoticeInput) {
  const { data } = await apiClient.post<ApiResponse<Notice>>('/notices', input);
  return data.data!;
}

export async function updateNotice(id: string, input: Partial<NoticeInput>) {
  const { data } = await apiClient.put<ApiResponse<Notice>>(`/notices/${id}`, input);
  return data.data!;
}

export async function deleteNotice(id: string) {
  const { data } = await apiClient.delete<ApiResponse<{ id: string }>>(`/notices/${id}`);
  return data.data!;
}
