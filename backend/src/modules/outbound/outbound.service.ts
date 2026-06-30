import { OrderStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../core/config/database';
import { AppError } from '../../core/middleware/errorHandler';
import { generateOrderNo } from '../../core/utils/orderNo';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { inventoryStockService } from '../inventory/inventoryStock.service';
import { notificationService } from '../notification/notification.service';
import { outboundRepository } from './outbound.repository';

export const outboundListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

const orderItemSchema = z.object({
  productId: z.string().uuid('상품 ID가 올바르지 않습니다.'),
  quantity: z.coerce.number().int().positive('수량은 1 이상이어야 합니다.'),
  locationId: z.string().uuid().optional(),
});

export const createOutboundSchema = z.object({
  partnerId: z.string().uuid().optional(),
  note: z.string().max(500).optional(),
  items: z.array(orderItemSchema).min(1, '품목을 1개 이상 추가해주세요.'),
});

export const completeOutboundSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().uuid(),
        locationId: z.string().uuid(),
      }),
    )
    .optional(),
});

type OutboundWithRelations = NonNullable<Awaited<ReturnType<typeof outboundRepository.findById>>>;

function toOutboundResponse(order: OutboundWithRelations) {
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
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      locationId: item.locationId,
      product: item.product,
    })),
  };
}

export const outboundService = {
  async list(query: z.infer<typeof outboundListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await outboundRepository.findMany({
      skip,
      take: limit,
      status: query.status,
    });

    return {
      items: items.map(toOutboundResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async create(input: z.infer<typeof createOutboundSchema>) {
    const productIds = [...new Set(input.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: { id: true },
    });

    if (products.length !== productIds.length) {
      throw new AppError(400, '유효하지 않은 상품이 포함되어 있습니다.', 'INVALID_PRODUCT');
    }

    if (input.partnerId) {
      const partner = await prisma.partner.findFirst({
        where: { id: input.partnerId, isActive: true },
      });
      if (!partner) {
        throw new AppError(400, '거래처를 찾을 수 없습니다.', 'PARTNER_NOT_FOUND');
      }
    }

    const order = await outboundRepository.create({
      orderNo: generateOrderNo('OUT'),
      status: OrderStatus.PENDING,
      note: input.note,
      partner: input.partnerId ? { connect: { id: input.partnerId } } : undefined,
      items: {
        create: input.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          locationId: item.locationId,
        })),
      },
    });

    return toOutboundResponse(order);
  },

  async approve(id: string) {
    const order = await outboundRepository.findById(id);
    if (!order) {
      throw new AppError(404, '출고 전표를 찾을 수 없습니다.', 'OUTBOUND_NOT_FOUND');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError(400, '승인 대기 상태의 전표만 승인할 수 있습니다.', 'INVALID_STATUS');
    }

    const updated = await outboundRepository.update(id, {
      status: OrderStatus.APPROVED,
      approvedAt: new Date(),
    });

    void notificationService.refreshAllUsers();
    return toOutboundResponse(updated);
  },

  async complete(
    id: string,
    input: z.infer<typeof completeOutboundSchema>,
    userId?: string,
  ) {
    const order = await outboundRepository.findById(id);
    if (!order) {
      throw new AppError(404, '출고 전표를 찾을 수 없습니다.', 'OUTBOUND_NOT_FOUND');
    }
    if (order.status !== OrderStatus.APPROVED) {
      throw new AppError(400, '승인 완료된 전표만 완료 처리할 수 있습니다.', 'INVALID_STATUS');
    }

    const locationMap = new Map(
      (input.items ?? []).map((item) => [item.itemId, item.locationId]),
    );

    const updated = await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        const locationId = locationMap.get(item.id) ?? item.locationId;
        if (!locationId) {
          throw new AppError(
            400,
            '모든 품목에 출고 로케이션을 지정해주세요.',
            'LOCATION_REQUIRED',
          );
        }

        await tx.outboundItem.update({
          where: { id: item.id },
          data: { locationId },
        });

        await inventoryStockService.decreaseStock(tx, {
          productId: item.productId,
          locationId,
          quantity: item.quantity,
          meta: {
            referenceType: 'OUTBOUND',
            referenceId: order.id,
            note: `출고 완료 (${order.orderNo})`,
            createdById: userId,
          },
        });
      }

      return tx.outboundOrder.update({
        where: { id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
        },
        include: {
          partner: { select: { id: true, code: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, sku: true, name: true, unit: true } },
            },
          },
        },
      });
    });

    void notificationService.refreshAllUsers();
    return toOutboundResponse(updated);
  },

  async cancel(id: string) {
    const order = await outboundRepository.findById(id);
    if (!order) {
      throw new AppError(404, '출고 전표를 찾을 수 없습니다.', 'OUTBOUND_NOT_FOUND');
    }
    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.APPROVED) {
      throw new AppError(400, '취소할 수 없는 상태입니다.', 'INVALID_STATUS');
    }

    const updated = await outboundRepository.update(id, {
      status: OrderStatus.CANCELLED,
    });

    return toOutboundResponse(updated);
  },
};
