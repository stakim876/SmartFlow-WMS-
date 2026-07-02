import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { warehouseService } from './warehouse.service';

export const warehouseController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await warehouseService.list(req.query as never);
    res.json(successResponse(result));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.getById(String(req.params.id));
    res.json(successResponse(warehouse));
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.create(req.body);
    res.status(201).json(successResponse(warehouse, '창고가 등록되었습니다.'));
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.update(String(req.params.id), req.body);
    res.json(successResponse(warehouse, '창고가 수정되었습니다.'));
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const warehouse = await warehouseService.remove(String(req.params.id));
    res.json(successResponse(warehouse, '창고가 비활성화되었습니다.'));
  }),

  listLocations: asyncHandler(async (req: Request, res: Response) => {
    const locations = await warehouseService.listLocations(String(req.params.warehouseId));
    res.json(successResponse(locations));
  }),

  createLocation: asyncHandler(async (req: Request, res: Response) => {
    const location = await warehouseService.createLocation(String(req.params.warehouseId), req.body);
    res.status(201).json(successResponse(location, '로케이션이 등록되었습니다.'));
  }),

  updateLocation: asyncHandler(async (req: Request, res: Response) => {
    const location = await warehouseService.updateLocation(String(req.params.locationId), req.body);
    res.json(successResponse(location, '로케이션이 수정되었습니다.'));
  }),

  removeLocation: asyncHandler(async (req: Request, res: Response) => {
    const location = await warehouseService.removeLocation(String(req.params.locationId));
    res.json(successResponse(location, '로케이션이 삭제되었습니다.'));
  }),
};
