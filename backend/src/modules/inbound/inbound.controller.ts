import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { inboundService } from './inbound.service';

export const inboundController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await inboundService.list(req.query as never);
    res.json(successResponse(result));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await inboundService.create(req.body);
    res.status(201).json(successResponse(order, '입고 전표가 등록되었습니다.'));
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const order = await inboundService.approve(String(req.params.id));
    res.json(successResponse(order, '입고 전표가 승인되었습니다.'));
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const order = await inboundService.complete(
      String(req.params.id),
      req.body,
      req.user?.userId,
    );
    res.json(successResponse(order, '입고가 완료되었습니다.'));
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await inboundService.cancel(String(req.params.id));
    res.json(successResponse(order, '입고 전표가 취소되었습니다.'));
  }),
};
