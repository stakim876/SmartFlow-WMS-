import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../core/config/database';
import { shopConfig } from '../../core/config/shop';
import { AppError } from '../../core/middleware/errorHandler';
import { generateOrderNo } from '../../core/utils/orderNo';
import { productRepository } from '../product/product.repository';
import { outboundRepository } from '../outbound/outbound.repository';
import { ShopApiClient } from './shop.client';
import { shopIntegrationRepository } from './shop-integration.repository';

const MY_SHOP_PARTNER_CODE = 'MY-SHOP';

function getShopClient() {
  if (!shopConfig.enabled) {
    throw new AppError(
      503,
      '쇼핑몰 연동이 설정되지 않았습니다. SHOP_API_URL, SHOP_API_KEY를 확인하세요.',
      'SHOP_NOT_CONFIGURED',
    );
  }
  return new ShopApiClient(shopConfig.apiUrl, shopConfig.apiKey);
}

async function ensureMyShopPartner() {
  return prisma.partner.upsert({
    where: { code: MY_SHOP_PARTNER_CODE },
    update: {},
    create: {
      code: MY_SHOP_PARTNER_CODE,
      name: 'my-shop 온라인몰',
      type: 'CUSTOMER',
    },
  });
}

async function getTotalStock(productId: string) {
  const result = await prisma.inventory.aggregate({
    where: { productId },
    _sum: { quantity: true },
  });
  return result._sum.quantity ?? 0;
}

export const fulfillOrderSchema = z.object({
  carrierCode: z.string().min(1, '택배사 코드가 필요합니다.'),
  trackingNumber: z.string().min(1, '송장번호가 필요합니다.'),
  status: z.enum(['preparing', 'shipping', 'done']).default('shipping'),
});

export const shopIntegrationService = {
  async getStatus() {
    const mappingCount = await prisma.shopProductMapping.count();
    const orderSyncCount = await prisma.shopOrderSync.count();

    if (!shopConfig.enabled) {
      return {
        configured: false,
        connected: false,
        shopApiUrl: shopConfig.apiUrl,
        mappingCount,
        orderSyncCount,
      };
    }

    try {
      const client = getShopClient();
      const health = await client.health();
      return {
        configured: true,
        connected: true,
        shopApiUrl: shopConfig.apiUrl,
        shopService: health.service ?? 'my-shop',
        mappingCount,
        orderSyncCount,
      };
    } catch {
      return {
        configured: true,
        connected: false,
        shopApiUrl: shopConfig.apiUrl,
        mappingCount,
        orderSyncCount,
      };
    }
  },

  async listMappings() {
    return shopIntegrationRepository.listMappings();
  },

  async listOrderSyncs() {
    return shopIntegrationRepository.listOrderSyncs();
  },

  async syncProducts() {
    const client = getShopClient();
    const shopProducts = await client.listProducts();

    const mapped: Array<{ shopProductId: number; productSku: string }> = [];
    const skipped: Array<{ shopProductId: number; sku: string | null; reason: string }> = [];

    for (const shopProduct of shopProducts) {
      const sku = shopProduct.sku?.trim();
      if (!sku) {
        skipped.push({
          shopProductId: shopProduct.id,
          sku: shopProduct.sku,
          reason: 'SKU 없음',
        });
        continue;
      }

      const wmsProduct = await productRepository.findBySku(sku);
      if (!wmsProduct || !wmsProduct.isActive) {
        skipped.push({
          shopProductId: shopProduct.id,
          sku,
          reason: 'WMS에 동일 SKU 상품 없음',
        });
        continue;
      }

      await shopIntegrationRepository.upsertMapping({
        shopProductId: shopProduct.id,
        shopSku: sku,
        shopName: shopProduct.name,
        productId: wmsProduct.id,
      });
      mapped.push({ shopProductId: shopProduct.id, productSku: sku });
    }

    return {
      totalShopProducts: shopProducts.length,
      mappedCount: mapped.length,
      skippedCount: skipped.length,
      mapped,
      skipped,
    };
  },

  async pushStock() {
    const client = getShopClient();
    const mappings = await shopIntegrationRepository.listMappings();
    const results: Array<{
      shopProductId: number;
      productSku: string;
      wmsStock: number;
      pushed: boolean;
    }> = [];

    for (const mapping of mappings) {
      const wmsStock = await getTotalStock(mapping.productId);
      await client.updateProductStock(mapping.shopProductId, wmsStock);
      await shopIntegrationRepository.updateStockPushTime(mapping.id);
      results.push({
        shopProductId: mapping.shopProductId,
        productSku: mapping.product.sku,
        wmsStock,
        pushed: true,
      });
    }

    return {
      pushedCount: results.length,
      results,
    };
  },

  async pullOrders() {
    const client = getShopClient();
    const partner = await ensureMyShopPartner();
    const shopOrders = await client.listOrders();
    const mappings = await shopIntegrationRepository.listMappings();
    const mappingByShopProductId = new Map(mappings.map((m) => [m.shopProductId, m]));

    const created: Array<{ shopOrderId: number; outboundOrderId: string; orderNo: string }> = [];
    const skipped: Array<{ shopOrderId: number; reason: string }> = [];

    for (const order of shopOrders) {
      const existing = await shopIntegrationRepository.findOrderSyncByShopOrderId(order.id);
      if (existing?.outboundOrderId) {
        skipped.push({ shopOrderId: order.id, reason: '이미 동기화됨' });
        continue;
      }

      const outboundItems: Array<{ productId: string; quantity: number }> = [];
      for (const item of order.items) {
        const mapping = mappingByShopProductId.get(item.product_id);
        if (!mapping) {
          skipped.push({
            shopOrderId: order.id,
            reason: `미매핑 상품 ID ${item.product_id}`,
          });
          outboundItems.length = 0;
          break;
        }
        outboundItems.push({
          productId: mapping.productId,
          quantity: item.quantity,
        });
      }

      if (outboundItems.length === 0) {
        continue;
      }

      const outbound = await outboundRepository.create({
        orderNo: generateOrderNo('OUT'),
        status: OrderStatus.PENDING,
        note: `my-shop 주문 #${order.id} · ${order.recipient_name} · ${order.address}`,
        partner: { connect: { id: partner.id } },
        items: {
          create: outboundItems,
        },
      });

      await shopIntegrationRepository.createOrderSync({
        shopOrderId: order.id,
        outboundOrderId: outbound.id,
        shopStatus: order.status,
      });

      created.push({
        shopOrderId: order.id,
        outboundOrderId: outbound.id,
        orderNo: outbound.orderNo,
      });
    }

    return {
      shopOrderCount: shopOrders.length,
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped,
    };
  },

  async fulfillOrder(shopOrderId: number, input: z.infer<typeof fulfillOrderSchema>) {
    const client = getShopClient();
    const sync = await shopIntegrationRepository.findOrderSyncByShopOrderId(shopOrderId);
    if (!sync) {
      throw new AppError(404, '동기화된 주문을 찾을 수 없습니다.', 'SHOP_ORDER_NOT_FOUND');
    }

    await client.updateOrderFulfillment(shopOrderId, {
      status: input.status,
      carrier_code: input.carrierCode,
      tracking_number: input.trackingNumber,
    });

    await shopIntegrationRepository.markOrderFulfilled(shopOrderId);

    return {
      shopOrderId,
      outboundOrderId: sync.outboundOrderId,
      status: input.status,
      carrierCode: input.carrierCode,
      trackingNumber: input.trackingNumber,
    };
  },
};
