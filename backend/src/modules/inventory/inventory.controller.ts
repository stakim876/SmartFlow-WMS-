import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { successResponse } from '../../core/utils/response';
import { inventoryService } from './inventory.service';

export const inventoryController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await inventoryService.list(req.query as never);
    res.json(successResponse(result));
  }),

  listMovements: asyncHandler(async (req: Request, res: Response) => {
    const result = await inventoryService.listMovements(req.query as never);
    res.json(successResponse(result));
  }),

  getLocations: asyncHandler(async (_req: Request, res: Response) => {
    const locations = await inventoryService.getLocations();
    res.json(successResponse(locations));
  }),

  getWarehouses: asyncHandler(async (_req: Request, res: Response) => {
    const warehouses = await inventoryService.getWarehouses();
    res.json(successResponse(warehouses));
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.getById(String(req.params.id));
    res.json(successResponse(inventory));
  }),

  adjust: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.adjust(
      String(req.params.id),
      req.body,
      req.user?.userId,
    );
    res.json(successResponse(inventory, '재고가 수정되었습니다.'));
  }),

  transfer: asyncHandler(async (req: Request, res: Response) => {
    const inventory = await inventoryService.transfer(req.body, req.user?.userId);
    res.json(successResponse(inventory, '재고가 이동되었습니다.'));
  }),
};
