import { Request, Response } from 'express';
import path from 'path';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { env } from '../../core/config/env';

export const uploadController = {
  image: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: '파일이 없습니다.' });
      return;
    }

    const url = `${env.apiBaseUrl}/uploads/${req.file.filename}`;
    res.status(201).json(
      successResponse(
        {
          url,
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
        },
        '파일이 업로드되었습니다.',
      ),
    );
  }),
};

export function getUploadPublicPath(filename: string) {
  return path.join(process.cwd(), 'uploads', filename);
}
