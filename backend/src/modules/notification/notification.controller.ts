import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { notificationService } from './notification.service';

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  unreadOnly: z
    .preprocess((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
});

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const result = await notificationService.list(req.user!.userId, query);
    res.json(successResponse(result));
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markRead(req.user!.userId, String(req.params.id));
    res.json(successResponse(result));
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    const result = await notificationService.markAllRead(req.user!.userId);
    res.json(successResponse(result, '모든 알림을 읽음 처리했습니다.'));
  }),
};
