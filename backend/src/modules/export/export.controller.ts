import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { exportService } from './export.service';

export const exportController = {
  products: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportProducts();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),

  inventory: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportInventory();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),

  movements: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportMovements();
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),

  inventoryPdf: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportInventoryPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),
};
