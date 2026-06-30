import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { authService } from './auth.service';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    res.status(201).json(successResponse(result, '회원가입이 완료되었습니다.'));
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body);
    res.json(successResponse(result, '로그인되었습니다.'));
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.refresh(req.body.refreshToken);
    res.json(successResponse(result, '토큰이 갱신되었습니다.'));
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    res.json(successResponse(null, '로그아웃되었습니다.'));
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.getProfile(req.user!.userId);
    res.json(successResponse(profile));
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await authService.updateProfile(req.user!.userId, req.body);
    res.json(successResponse(profile, '프로필이 수정되었습니다.'));
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.userId, req.body);
    res.json(successResponse(null, '비밀번호가 변경되었습니다.'));
  }),
};
