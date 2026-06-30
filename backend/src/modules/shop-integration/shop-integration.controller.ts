import { Request, Response, NextFunction } from 'express';
import {
  fulfillOrderSchema,
  shopIntegrationService,
} from './shop-integration.service';

export const shopIntegrationController = {
  async status(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.getStatus();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listMappings(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.listMappings();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async listOrderSyncs(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.listOrderSyncs();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async syncProducts(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.syncProducts();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async pushStock(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.pushStock();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async pullOrders(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await shopIntegrationService.pullOrders();
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async fulfillOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const shopOrderId = Number(req.params.shopOrderId);
      const input = fulfillOrderSchema.parse(req.body);
      const data = await shopIntegrationService.fulfillOrder(shopOrderId, input);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },
};
