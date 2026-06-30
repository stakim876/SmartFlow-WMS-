import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { noticeService } from './notice.service';

export const noticeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await noticeService.list(req.query as never);
    res.json(successResponse(result));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const notice = await noticeService.getById(String(req.params.id));
    res.json(successResponse(notice));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const notice = await noticeService.create(req.body, req.user!.userId);
    res.status(201).json(successResponse(notice, '공지사항이 등록되었습니다.'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const notice = await noticeService.update(String(req.params.id), req.body);
    res.json(successResponse(notice, '공지사항이 수정되었습니다.'));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await noticeService.remove(String(req.params.id));
    res.json(successResponse(result, '공지사항이 삭제되었습니다.'));
  }),
};
