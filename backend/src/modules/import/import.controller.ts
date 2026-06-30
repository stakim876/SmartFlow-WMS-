import { Request, Response } from 'express';
import fs from 'fs';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { importService } from './import.service';

export const importController = {
  products: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: '파일이 없습니다.' });
      return;
    }

    try {
      const buffer = fs.readFileSync(req.file.path);
      const result = await importService.importProducts(buffer);
      res.json(successResponse(result, '상품 가져오기가 완료되었습니다.'));
    } finally {
      if (req.file.path) {
        fs.unlink(req.file.path, () => undefined);
      }
    }
  }),
};
