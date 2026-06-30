import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { outboundService } from './outbound.service';

export const outboundController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await outboundService.list(req.query as never);
    res.json(successResponse(result));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await outboundService.create(req.body);
    res.status(201).json(successResponse(order, '출고 전표가 등록되었습니다.'));
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const order = await outboundService.approve(String(req.params.id));
    res.json(successResponse(order, '출고 전표가 승인되었습니다.'));
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const order = await outboundService.complete(
      String(req.params.id),
      req.body,
      req.user?.userId,
    );
    res.json(successResponse(order, '출고가 완료되었습니다.'));
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await outboundService.cancel(String(req.params.id));
    res.json(successResponse(order, '출고 전표가 취소되었습니다.'));
  }),
};
