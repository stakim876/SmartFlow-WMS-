import { Application, Request, Response } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
  });
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: unknown,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    success: false,
    message: '서버 내부 오류가 발생했습니다.',
  });
}

export function setupErrorHandling(app: Application): void {
  app.use(notFoundHandler);
  app.use(errorHandler);
}
