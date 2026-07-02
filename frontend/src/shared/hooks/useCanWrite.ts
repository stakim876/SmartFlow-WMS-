import { useAuthStore } from '@/features/auth/stores/authStore';

export function useCanWrite() {
  return useAuthStore((state) => {
    const role = state.user?.role.name;
    return role === 'ADMIN' || role === 'STAFF';
  });
}
