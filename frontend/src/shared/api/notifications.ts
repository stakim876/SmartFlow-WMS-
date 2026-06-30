import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResult {
  items: Notification[];
  meta: PaginationMeta;
  unreadCount: number;
}

export async function fetchNotifications(params?: { page?: number; limit?: number }) {
  const { data } = await apiClient.get<ApiResponse<NotificationListResult>>('/notifications', {
    params,
  });
  return data.data!;
}

export async function markNotificationRead(id: string) {
  const { data } = await apiClient.patch<ApiResponse<{ id: string }>>(`/notifications/${id}/read`);
  return data.data!;
}

export async function markAllNotificationsRead() {
  const { data } = await apiClient.patch<ApiResponse<{ success: boolean }>>(
    '/notifications/read-all',
  );
  return data.data!;
}
