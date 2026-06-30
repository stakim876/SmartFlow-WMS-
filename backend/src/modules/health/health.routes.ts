import { Router, Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(
      successResponse({
        name: 'SmartFlow WMS API',
        version: '0.1.0',
        status: 'running',
      }),
    );
  }),
);

export default router;
