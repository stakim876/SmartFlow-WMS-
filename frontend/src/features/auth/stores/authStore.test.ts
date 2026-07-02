import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from './authStore';

const mockUser = {
  id: 'user-1',
  email: 'admin@smartflow.com',
  name: '관리자',
  role: { id: 'role-1', name: 'ADMIN', description: '시스템 관리자' },
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  });

  it('setAuth persists tokens and marks session authenticated', () => {
    useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(localStorage.getItem('accessToken')).toBe('access-token');
    expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
  });

  it('logout clears persisted session', () => {
    useAuthStore.getState().setAuth(mockUser, 'access-token', 'refresh-token');
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });
});
