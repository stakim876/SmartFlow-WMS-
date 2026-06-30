import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { AuthPayload } from '../../core/middleware/auth';
import {
  refreshTokenRepository,
  roleRepository,
  userRepository,
} from './user.repository';
import {
  getRefreshTokenExpiry,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../../core/utils/jwt';

export const registerSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
});

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh Token이 필요합니다.'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '현재 비밀번호를 입력해주세요.'),
  newPassword: z.string().min(8, '새 비밀번호는 8자 이상이어야 합니다.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
});

function toAuthPayload(user: { id: string; roleId: string; role: { name: string } }): AuthPayload {
  return {
    userId: user.id,
    roleId: user.roleId,
    roleName: user.role.name,
  };
}

function toUserResponse(user: {
  id: string;
  email: string;
  name: string;
  roleId: string;
  role: { name: string; description: string | null };
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: {
      id: user.roleId,
      name: user.role.name,
      description: user.role.description,
    },
    createdAt: user.createdAt,
  };
}

async function issueTokens(user: { id: string; roleId: string; role: { name: string } }) {
  const payload = toAuthPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(user.id);
  const tokenHash = hashToken(refreshToken);

  await refreshTokenRepository.deleteByUserId(user.id);
  await refreshTokenRepository.create(user.id, tokenHash, getRefreshTokenExpiry());

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: z.infer<typeof registerSchema>) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 이메일입니다.', 'EMAIL_EXISTS');
    }

    const role = await roleRepository.findByName('STAFF');
    if (!role) {
      throw new AppError(500, '기본 역할이 설정되지 않았습니다.', 'ROLE_NOT_FOUND');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: { connect: { id: role.id } },
    });

    const tokens = await issueTokens(user);
    return {
      user: toUserResponse(user),
      ...tokens,
    };
  },

  async login(input: z.infer<typeof loginSchema>) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS');
    }

    const isValid = await bcrypt.compare(input.password, user.password);
    if (!isValid) {
      throw new AppError(401, '이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_CREDENTIALS');
    }

    const tokens = await issueTokens(user);
    return {
      user: toUserResponse(user),
      ...tokens,
    };
  },

  async refresh(refreshToken: string) {
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new AppError(401, '유효하지 않은 Refresh Token입니다.', 'INVALID_REFRESH_TOKEN');
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, '만료된 Refresh Token입니다.', 'EXPIRED_REFRESH_TOKEN');
    }

    const tokens = await issueTokens(stored.user);
    return {
      user: toUserResponse(stored.user),
      ...tokens,
    };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await refreshTokenRepository.deleteByTokenHash(hashToken(refreshToken));
    }
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
    }
    return toUserResponse(user);
  },

  async updateProfile(userId: string, input: z.infer<typeof updateProfileSchema>) {
    const user = await userRepository.update(userId, { name: input.name });
    return toUserResponse(user);
  },

  async changePassword(userId: string, input: z.infer<typeof changePasswordSchema>) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, '사용자를 찾을 수 없습니다.', 'USER_NOT_FOUND');
    }

    const isValid = await bcrypt.compare(input.currentPassword, user.password);
    if (!isValid) {
      throw new AppError(400, '현재 비밀번호가 올바르지 않습니다.', 'INVALID_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    await userRepository.update(userId, { password: hashedPassword });
    await refreshTokenRepository.deleteByUserId(userId);
  },
};
