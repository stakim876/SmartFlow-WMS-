import { apiClient, ApiResponse } from '@/shared/api/client';
import { PaginationMeta } from '@/shared/types';

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateUserInput {
  name: string;
  roleId: string;
}

export async function fetchRoles() {
  const { data } = await apiClient.get<ApiResponse<Role[]>>('/users/roles');
  return data.data!;
}

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}) {
  const { data } = await apiClient.get<
    ApiResponse<{ items: User[]; meta: PaginationMeta }>
  >('/users', { params });
  return data.data!;
}

export async function createUser(input: CreateUserInput) {
  const { data } = await apiClient.post<ApiResponse<User>>('/users', input);
  return data.data!;
}

export async function updateUser(id: string, input: UpdateUserInput) {
  const { data } = await apiClient.put<ApiResponse<User>>(`/users/${id}`, input);
  return data.data!;
}

export async function resetUserPassword(id: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<null>>(`/users/${id}/reset-password`, {
    password,
  });
  return data.data;
}

export async function deleteUser(id: string) {
  const { data } = await apiClient.delete<ApiResponse<User>>(`/users/${id}`);
  return data.data!;
}
