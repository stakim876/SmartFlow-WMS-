import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { userService } from './user.service';

export const userController = {
  listRoles: asyncHandler(async (_req: Request, res: Response) => {
    const roles = await userService.listRoles();
    res.json(successResponse(roles));
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.list(req.query as never);
    res.json(successResponse(result));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.create(req.body);
    res.status(201).json(successResponse(user, '직원이 등록되었습니다.'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.update(
      String(req.params.id),
      req.body,
      req.user!.userId,
    );
    res.json(successResponse(user, '직원 정보가 수정되었습니다.'));
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await userService.resetPassword(String(req.params.id), req.body);
    res.json(successResponse(null, '비밀번호가 변경되었습니다.'));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.remove(String(req.params.id), req.user!.userId);
    res.json(successResponse(user, '직원이 삭제되었습니다.'));
  }),
};
