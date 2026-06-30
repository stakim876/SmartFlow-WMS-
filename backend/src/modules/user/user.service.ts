import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { refreshTokenRepository } from '../auth/user.repository';
import { userAdminRepository } from './user.repository';

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  roleId: z.string().uuid().optional(),
});

export const createUserSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  roleId: z.string().uuid('역할을 선택해주세요.'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
  roleId: z.string().uuid('역할을 선택해주세요.'),
});

export const resetUserPasswordSchema = z.object({
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
});

type UserWithRole = NonNullable<Awaited<ReturnType<typeof userAdminRepository.findById>>>;

function toUserResponse(user: UserWithRole) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export const userService = {
  async listRoles() {
    return userAdminRepository.findAllRoles();
  },

  async list(query: z.infer<typeof userListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await userAdminRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      roleId: query.roleId,
    });

    return {
      items: items.map(toUserResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async create(input: z.infer<typeof createUserSchema>) {
    const existing = await userAdminRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 이메일입니다.', 'EMAIL_EXISTS');
    }

    const roles = await userAdminRepository.findAllRoles();
    const selectedRole = roles.find((r) => r.id === input.roleId);
    if (!selectedRole) {
      throw new AppError(400, '유효하지 않은 역할입니다.', 'INVALID_ROLE');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = await userAdminRepository.create({
      email: input.email,
      password: hashedPassword,
      name: input.name,
      role: { connect: { id: input.roleId } },
    });

    return toUserResponse(user);
  },

  async update(id: string, input: z.infer<typeof updateUserSchema>, actorId: string) {
    const user = await userAdminRepository.findById(id);
    if (!user) {
      throw new AppError(404, '직원을 찾을 수 없습니다.', 'USER_NOT_FOUND');
    }

    if (user.role.name === 'ADMIN' && user.id !== actorId) {
      const newRole = await userAdminRepository.findAllRoles();
      const targetRole = newRole.find((r) => r.id === input.roleId);
      if (targetRole?.name !== 'ADMIN') {
        const adminCount = await userAdminRepository.countByRoleName('ADMIN');
        if (adminCount <= 1) {
          throw new AppError(400, '마지막 관리자의 역할은 변경할 수 없습니다.', 'LAST_ADMIN');
        }
      }
    }

    const updated = await userAdminRepository.update(id, {
      name: input.name,
      role: { connect: { id: input.roleId } },
    });

    if (user.roleId !== input.roleId) {
      await refreshTokenRepository.deleteByUserId(id);
    }

    return toUserResponse(updated);
  },

  async resetPassword(id: string, input: z.infer<typeof resetUserPasswordSchema>) {
    const user = await userAdminRepository.findById(id);
    if (!user) {
      throw new AppError(404, '직원을 찾을 수 없습니다.', 'USER_NOT_FOUND');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    await userAdminRepository.update(id, { password: hashedPassword });
    await refreshTokenRepository.deleteByUserId(id);
  },

  async remove(id: string, actorId: string) {
    const user = await userAdminRepository.findById(id);
    if (!user) {
      throw new AppError(404, '직원을 찾을 수 없습니다.', 'USER_NOT_FOUND');
    }

    if (user.id === actorId) {
      throw new AppError(400, '본인 계정은 삭제할 수 없습니다.', 'CANNOT_DELETE_SELF');
    }

    if (user.role.name === 'ADMIN') {
      const adminCount = await userAdminRepository.countByRoleName('ADMIN');
      if (adminCount <= 1) {
        throw new AppError(400, '마지막 관리자는 삭제할 수 없습니다.', 'LAST_ADMIN');
      }
    }

    await refreshTokenRepository.deleteByUserId(id);
    const deleted = await userAdminRepository.delete(id);
    return toUserResponse(deleted);
  },
};
