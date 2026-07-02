import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

vi.mock('./user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshTokenRepository: {
    deleteByUserId: vi.fn(),
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    deleteByTokenHash: vi.fn(),
  },
  roleRepository: {
    findByName: vi.fn(),
  },
}));

vi.mock('../../core/utils/jwt', () => ({
  signAccessToken: vi.fn(() => 'access-token'),
  signRefreshToken: vi.fn(() => 'refresh-token'),
  hashToken: vi.fn((token: string) => `hash:${token}`),
  getRefreshTokenExpiry: vi.fn(() => new Date('2030-01-01T00:00:00.000Z')),
  verifyRefreshToken: vi.fn(),
}));

import { authService } from './auth.service';
import { refreshTokenRepository, userRepository } from './user.repository';

const mockUser = {
  id: 'user-1',
  email: 'admin@smartflow.com',
  password: '',
  name: '관리자',
  roleId: 'role-1',
  role: { id: 'role-1', name: 'ADMIN', description: '시스템 관리자' },
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('authService.login', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUser.password = await bcrypt.hash('admin1234', 10);
  });

  it('returns user and tokens for valid credentials', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'admin@smartflow.com',
      password: 'admin1234',
    });

    expect(result.user.email).toBe('admin@smartflow.com');
    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith('user-1');
    expect(refreshTokenRepository.create).toHaveBeenCalled();
  });

  it('rejects unknown email', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

    await expect(
      authService.login({
        email: 'missing@smartflow.com',
        password: 'admin1234',
      }),
    ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('rejects invalid password', async () => {
    vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'admin@smartflow.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({ statusCode: 401, code: 'INVALID_CREDENTIALS' });
  });
});
