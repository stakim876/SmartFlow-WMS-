import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorHandler';

export interface AuthPayload {
  userId: string;
  roleId: string;
  roleName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new AppError(401, '인증이 필요합니다.', 'UNAUTHORIZED');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwt.secret) as AuthPayload;
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, '유효하지 않은 토큰입니다.', 'INVALID_TOKEN'));
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, '인증이 필요합니다.', 'UNAUTHORIZED'));
      return;
    }

    if (roles.length > 0 && !roles.includes(req.user.roleName)) {
      next(new AppError(403, '접근 권한이 없습니다.', 'FORBIDDEN'));
      return;
    }

    next();
  };
}
