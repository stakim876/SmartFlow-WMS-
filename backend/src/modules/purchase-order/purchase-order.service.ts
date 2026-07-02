import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../core/config/database';
import { AppError } from '../../core/middleware/errorHandler';
import { generateOrderNo } from '../../core/utils/orderNo';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { inboundRepository } from '../inbound/inbound.repository';
import { purchaseOrderRepository } from './purchase-order.repository';

export const purchaseOrderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().uuid('상품 ID가 올바르지 않습니다.'),
  quantity: z.coerce.number().int().positive('수량은 1 이상이어야 합니다.'),
  unitPrice: z.coerce.number().min(0, '단가는 0 이상이어야 합니다.'),
});

export const createPurchaseOrderSchema = z.object({
  partnerId: z.string().uuid('거래처를 선택해주세요.'),
  note: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, '품목을 1개 이상 추가해주세요.'),
});

type PurchaseOrderWithRelations = NonNullable<
  Awaited<ReturnType<typeof purchaseOrderRepository.findById>>
>;

function toNumber(value: { toNumber(): number } | number) {
  return typeof value === 'number' ? value : value.toNumber();
}

function toPurchaseOrderResponse(order: PurchaseOrderWithRelations) {
  const items = order.items.map((item) => {
    const unitPrice = toNumber(item.unitPrice);
    return {
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice,
      lineAmount: item.quantity * unitPrice,
      product: item.product,
    };
  });

  return {
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    note: order.note,
    requestedAt: order.requestedAt,
    approvedAt: order.approvedAt,
    completedAt: order.completedAt,
    createdAt: order.createdAt,
    partner: order.partner,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineAmount, 0),
    inboundOrder: order.inboundOrder ?? null,
  };
}

export const purchaseOrderService = {
  async list(query: z.infer<typeof purchaseOrderListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await purchaseOrderRepository.findMany({
      skip,
      take: limit,
      status: query.status,
    });

    return {
      items: items.map(toPurchaseOrderResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async create(input: z.infer<typeof createPurchaseOrderSchema>) {
    const partner = await prisma.partner.findFirst({
      where: { id: input.partnerId, isActive: true },
    });
    if (!partner) {
      throw new AppError(400, '거래처를 찾을 수 없습니다.', 'PARTNER_NOT_FOUND');
    }

    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new AppError(400, '유효하지 않은 상품이 포함되어 있습니다.', 'INVALID_PRODUCT');
    }

    const order = await purchaseOrderRepository.create({
      orderNo: generateOrderNo('PO'),
      status: OrderStatus.PENDING,
      note: input.note,
      partner: { connect: { id: input.partnerId } },
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    });

    return toPurchaseOrderResponse(order);
  },

  async approve(id: string) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) {
      throw new AppError(404, '발주 전표를 찾을 수 없습니다.', 'PURCHASE_ORDER_NOT_FOUND');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError(400, '승인 대기 상태의 전표만 승인할 수 있습니다.', 'INVALID_STATUS');
    }

    const updated = await purchaseOrderRepository.update(id, {
      status: OrderStatus.APPROVED,
      approvedAt: new Date(),
    });

    return toPurchaseOrderResponse(updated);
  },

  async complete(id: string) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) {
      throw new AppError(404, '발주 전표를 찾을 수 없습니다.', 'PURCHASE_ORDER_NOT_FOUND');
    }
    if (order.status !== OrderStatus.APPROVED) {
      throw new AppError(400, '승인 완료된 전표만 완료 처리할 수 있습니다.', 'INVALID_STATUS');
    }
    if (!order.inboundOrder || order.inboundOrder.status !== OrderStatus.COMPLETED) {
      throw new AppError(
        400,
        '연결된 입고 전표가 완료된 후에만 발주를 완료할 수 있습니다.',
        'INBOUND_NOT_COMPLETED',
      );
    }

    const updated = await purchaseOrderRepository.update(id, {
      status: OrderStatus.COMPLETED,
      completedAt: new Date(),
    });

    return toPurchaseOrderResponse(updated);
  },

  async convertToInbound(id: string) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) {
      throw new AppError(404, '발주 전표를 찾을 수 없습니다.', 'PURCHASE_ORDER_NOT_FOUND');
    }
    if (order.status !== OrderStatus.APPROVED) {
      throw new AppError(400, '승인 완료된 발주만 입고 전환할 수 있습니다.', 'INVALID_STATUS');
    }
    if (order.inboundOrder) {
      throw new AppError(409, '이미 입고 전표가 생성된 발주입니다.', 'INBOUND_ALREADY_EXISTS');
    }

    const inbound = await inboundRepository.create({
      orderNo: generateOrderNo('IN'),
      status: OrderStatus.PENDING,
      note: `발주 ${order.orderNo} 연동`,
      partner: { connect: { id: order.partnerId } },
      purchaseOrder: { connect: { id: order.id } },
      items: {
        create: order.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    });

    const refreshed = await purchaseOrderRepository.findById(id);
    return {
      purchaseOrder: toPurchaseOrderResponse(refreshed!),
      inbound: {
        id: inbound.id,
        orderNo: inbound.orderNo,
        status: inbound.status,
      },
    };
  },

  async cancel(id: string) {
    const order = await purchaseOrderRepository.findById(id);
    if (!order) {
      throw new AppError(404, '발주 전표를 찾을 수 없습니다.', 'PURCHASE_ORDER_NOT_FOUND');
    }
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.APPROVED) {
      throw new AppError(400, '취소할 수 없는 상태입니다.', 'INVALID_STATUS');
    }
    if (
      order.inboundOrder &&
      order.inboundOrder.status !== OrderStatus.CANCELLED &&
      order.inboundOrder.status !== OrderStatus.COMPLETED
    ) {
      throw new AppError(
        400,
        '연결된 입고 전표를 먼저 처리해주세요.',
        'INBOUND_IN_PROGRESS',
      );
    }

    const updated = await purchaseOrderRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });

    return toPurchaseOrderResponse(updated);
  },
};
