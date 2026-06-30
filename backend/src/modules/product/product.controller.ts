import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { productService } from './product.service';

export const productController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.list(req.query as never);
    res.json(successResponse(result));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.getById(String(req.params.id));
    res.json(successResponse(product));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.create(req.body);
    res.status(201).json(successResponse(product, '상품이 등록되었습니다.'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.update(String(req.params.id), req.body);
    res.json(successResponse(product, '상품이 수정되었습니다.'));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const product = await productService.remove(String(req.params.id));
    res.json(successResponse(product, '상품이 삭제되었습니다.'));
  }),
};
