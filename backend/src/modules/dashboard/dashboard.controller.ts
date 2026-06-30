import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  summary: asyncHandler(async (_req: Request, res: Response) => {
    const summary = await dashboardService.getSummary();
    res.json(successResponse(summary));
  }),
};
