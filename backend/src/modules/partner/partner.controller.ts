import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { partnerService } from './partner.service';

export const partnerController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await partnerService.list(req.query as never);
    res.json(successResponse(result));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const partner = await partnerService.getById(String(req.params.id));
    res.json(successResponse(partner));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const partner = await partnerService.create(req.body);
    res.status(201).json(successResponse(partner, '거래처가 등록되었습니다.'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const partner = await partnerService.update(String(req.params.id), req.body);
    res.json(successResponse(partner, '거래처가 수정되었습니다.'));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const partner = await partnerService.remove(String(req.params.id));
    res.json(successResponse(partner, '거래처가 삭제되었습니다.'));
  }),
};
