import { ZodError, ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, error.errors[0]?.message ?? '입력값이 올바르지 않습니다.', 'VALIDATION_ERROR'));
        return;
      }
      next(error);
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as Request['query'];
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new AppError(400, error.errors[0]?.message ?? '쿼리 파라미터가 올바르지 않습니다.', 'VALIDATION_ERROR'));
        return;
      }
      next(error);
    }
  };
}
