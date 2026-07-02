import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { exportService } from './export.service';
import { parseExportDateRange } from './export.query';

function sendXlsx(res: Response, buffer: Buffer, filename: string) {
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(buffer);
}

export const exportController = {
  products: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportProducts();
    sendXlsx(res, buffer, filename);
  }),

  inventory: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportInventory();
    sendXlsx(res, buffer, filename);
  }),

  movements: asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = parseExportDateRange(req.query as never);
    const { buffer, filename } = await exportService.exportMovements(5000, from, to);
    sendXlsx(res, buffer, filename);
  }),

  inbound: asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = parseExportDateRange(req.query as never);
    const { buffer, filename } = await exportService.exportInboundOrders(from, to);
    sendXlsx(res, buffer, filename);
  }),

  outbound: asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = parseExportDateRange(req.query as never);
    const { buffer, filename } = await exportService.exportOutboundOrders(from, to);
    sendXlsx(res, buffer, filename);
  }),

  inventoryPdf: asyncHandler(async (_req: Request, res: Response) => {
    const { buffer, filename } = await exportService.exportInventoryPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }),
};
