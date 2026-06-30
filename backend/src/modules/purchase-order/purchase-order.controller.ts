import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { purchaseOrderService } from './purchase-order.service';

export const purchaseOrderController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await purchaseOrderService.list(req.query as never);
    res.json(successResponse(result));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchaseOrderService.create(req.body);
    res.status(201).json(successResponse(order, '발주 전표가 등록되었습니다.'));
  }),

  approve: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchaseOrderService.approve(String(req.params.id));
    res.json(successResponse(order, '발주 전표가 승인되었습니다.'));
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchaseOrderService.complete(String(req.params.id));
    res.json(successResponse(order, '발주가 완료되었습니다.'));
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const order = await purchaseOrderService.cancel(String(req.params.id));
    res.json(successResponse(order, '발주 전표가 취소되었습니다.'));
  }),
};
