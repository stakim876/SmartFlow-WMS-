import { apiClient, ApiResponse } from '@/shared/api/client';

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', {
    email,
    password,
  });
  return data.data!;
}

export async function refreshToken(refreshTokenValue: string) {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh', {
    refreshToken: refreshTokenValue,
  });
  return data.data!;
}

export async function logout(refreshTokenValue?: string) {
  await apiClient.post('/auth/logout', { refreshToken: refreshTokenValue });
}

export async function getProfile() {
  const { data } = await apiClient.get<ApiResponse<User>>('/auth/profile');
  return data.data!;
}

export async function updateProfile(name: string) {
  const { data } = await apiClient.patch<ApiResponse<User>>('/auth/profile', { name });
  return data.data!;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.patch('/auth/password', { currentPassword, newPassword });
}
