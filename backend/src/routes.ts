import { Router } from 'express';
import healthRoutes from './modules/health/health.routes';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import inventoryRoutes from './modules/inventory/inventory.routes';
import inboundRoutes from './modules/inbound/inbound.routes';
import outboundRoutes from './modules/outbound/outbound.routes';
import partnerRoutes from './modules/partner/partner.routes';
import purchaseOrderRoutes from './modules/purchase-order/purchase-order.routes';
import userRoutes from './modules/user/user.routes';
import noticeRoutes from './modules/notice/notice.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import uploadRoutes from './modules/upload/upload.routes';
import exportRoutes from './modules/export/export.routes';
import importRoutes from './modules/import/import.routes';
import notificationRoutes from './modules/notification/notification.routes';
import shopIntegrationRoutes from './modules/shop-integration/shop-integration.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/inbound', inboundRoutes);
router.use('/outbound', outboundRoutes);
router.use('/partners', partnerRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/users', userRoutes);
router.use('/notices', noticeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/export', exportRoutes);
router.use('/import', importRoutes);
router.use('/notifications', notificationRoutes);
router.use('/shop-integration', shopIntegrationRoutes);

export default router;
