import { MovementType } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../core/config/database';
import { AppError } from '../../core/middleware/errorHandler';
import { inventoryRepository } from './inventory.repository';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';

export const inventoryListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
});

export const movementListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  productId: z.string().uuid().optional(),
  type: z.nativeEnum(MovementType).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const adjustInventorySchema = z.object({
  quantity: z.coerce.number().int().min(0, '재고는 0 이상이어야 합니다.'),
  note: z.string().max(500).optional(),
});

export const transferInventorySchema = z.object({
  inventoryId: z.string().uuid('재고를 선택해주세요.'),
  toLocationId: z.string().uuid('이동할 로케이션을 선택해주세요.'),
  quantity: z.coerce.number().int().positive('이동 수량은 1 이상이어야 합니다.'),
  note: z.string().max(500).optional(),
});

type InventoryWithRelations = NonNullable<
  Awaited<ReturnType<typeof inventoryRepository.findById>>
>;

function toInventoryResponse(inventory: InventoryWithRelations) {
  return {
    id: inventory.id,
    quantity: inventory.quantity,
    updatedAt: inventory.updatedAt,
    product: inventory.product,
    location: inventory.location,
  };
}

function toMovementResponse(movement: {
  id: string;
  type: MovementType;
  quantity: number;
  beforeQty: number | null;
  afterQty: number | null;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: Date;
  createdById?: string | null;
  createdByName?: string | null;
  product: { id: string; sku: string; name: string };
  location: {
    id: string;
    code: string;
    name: string | null;
    warehouse: { id: string; code: string; name: string };
  } | null;
}) {
  return {
    id: movement.id,
    type: movement.type,
    quantity: movement.quantity,
    beforeQty: movement.beforeQty,
    afterQty: movement.afterQty,
    referenceType: movement.referenceType,
    referenceId: movement.referenceId,
    note: movement.note,
    createdAt: movement.createdAt,
    createdById: movement.createdById ?? null,
    createdByName: movement.createdByName ?? null,
    product: movement.product,
    location: movement.location,
  };
}

export const inventoryService = {
  async list(query: z.infer<typeof inventoryListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await inventoryRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      warehouseId: query.warehouseId,
    });

    return {
      items: items.map(toInventoryResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    const inventory = await inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError(404, '재고를 찾을 수 없습니다.', 'INVENTORY_NOT_FOUND');
    }
    return toInventoryResponse(inventory);
  },

  async listMovements(query: z.infer<typeof movementListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(`${query.to}T23:59:59.999`) : undefined;
    const [items, total] = await inventoryRepository.findMovements({
      skip,
      take: limit,
      productId: query.productId,
      type: query.type,
      from,
      to,
    });

    const actorIds = [
      ...new Set(items.map((item) => item.createdById).filter((id): id is string => Boolean(id))),
    ];
    const actors =
      actorIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: actorIds } },
            select: { id: true, name: true },
          })
        : [];
    const actorMap = new Map(actors.map((actor) => [actor.id, actor.name]));

    return {
      items: items.map((item) =>
        toMovementResponse({
          ...item,
          createdByName: item.createdById ? actorMap.get(item.createdById) ?? null : null,
        }),
      ),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getLocations() {
    const locations = await inventoryRepository.findLocations();
    return locations.map((location) => ({
      id: location.id,
      code: location.code,
      name: location.name,
      warehouse: location.warehouse,
      label: `${location.warehouse.name} / ${location.code}${
        location.name ? ` (${location.name})` : ''
      }`,
    }));
  },

  async getWarehouses() {
    return inventoryRepository.findWarehouses();
  },

  async adjust(id: string, input: z.infer<typeof adjustInventorySchema>, userId?: string) {
    const inventory = await inventoryRepository.findById(id);
    if (!inventory) {
      throw new AppError(404, '재고를 찾을 수 없습니다.', 'INVENTORY_NOT_FOUND');
    }

    const beforeQty = inventory.quantity;
    const afterQty = input.quantity;

    if (beforeQty === afterQty) {
      throw new AppError(400, '변경할 재고 수량이 기존과 동일합니다.', 'SAME_QUANTITY');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.inventory.update({
        where: { id },
        data: { quantity: afterQty },
        include: {
          product: {
            select: { id: true, sku: true, name: true, unit: true, isActive: true },
          },
          location: {
            select: {
              id: true,
              code: true,
              name: true,
              warehouse: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: inventory.productId,
          locationId: inventory.locationId,
          type: MovementType.ADJUSTMENT,
          quantity: Math.abs(afterQty - beforeQty),
          beforeQty,
          afterQty,
          referenceType: 'INVENTORY',
          referenceId: id,
          note: input.note,
          createdById: userId,
        },
      });

      return result;
    });

    return toInventoryResponse(updated);
  },

  async transfer(input: z.infer<typeof transferInventorySchema>, userId?: string) {
    const source = await inventoryRepository.findById(input.inventoryId);
    if (!source) {
      throw new AppError(404, '재고를 찾을 수 없습니다.', 'INVENTORY_NOT_FOUND');
    }

    if (source.locationId === input.toLocationId) {
      throw new AppError(400, '같은 로케이션으로 이동할 수 없습니다.', 'SAME_LOCATION');
    }

    if (source.quantity < input.quantity) {
      throw new AppError(400, '이동 수량이 현재 재고보다 많습니다.', 'INSUFFICIENT_STOCK');
    }

    const destinationLocation = await prisma.location.findUnique({
      where: { id: input.toLocationId },
      include: { warehouse: true },
    });

    if (!destinationLocation) {
      throw new AppError(404, '이동할 로케이션을 찾을 수 없습니다.', 'LOCATION_NOT_FOUND');
    }

    const transferGroupId = crypto.randomUUID();

    const result = await prisma.$transaction(async (tx) => {
      const sourceBefore = source.quantity;
      const sourceAfter = sourceBefore - input.quantity;

      await tx.inventory.update({
        where: { id: source.id },
        data: { quantity: sourceAfter },
      });

      const destination = await tx.inventory.upsert({
        where: {
          productId_locationId: {
            productId: source.productId,
            locationId: input.toLocationId,
          },
        },
        update: {
          quantity: { increment: input.quantity },
        },
        create: {
          productId: source.productId,
          locationId: input.toLocationId,
          quantity: input.quantity,
        },
      });

      const destinationBefore = destination.quantity - input.quantity;

      await tx.inventoryMovement.createMany({
        data: [
          {
            productId: source.productId,
            locationId: source.locationId,
            type: MovementType.TRANSFER,
            quantity: input.quantity,
            beforeQty: sourceBefore,
            afterQty: sourceAfter,
            referenceType: 'TRANSFER',
            referenceId: transferGroupId,
            note: input.note ?? `${destinationLocation.warehouse.code} ${destinationLocation.code}(으)로 이동`,
            createdById: userId,
          },
          {
            productId: source.productId,
            locationId: input.toLocationId,
            type: MovementType.TRANSFER,
            quantity: input.quantity,
            beforeQty: destinationBefore,
            afterQty: destination.quantity,
            referenceType: 'TRANSFER',
            referenceId: transferGroupId,
            note: input.note ?? `${source.location.warehouse.code} ${source.location.code}에서 이동`,
            createdById: userId,
          },
        ],
      });

      return tx.inventory.findUnique({
        where: { id: source.id },
        include: {
          product: {
            select: { id: true, sku: true, name: true, unit: true, isActive: true },
          },
          location: {
            select: {
              id: true,
              code: true,
              name: true,
              warehouse: { select: { id: true, code: true, name: true } },
            },
          },
        },
      });
    });

    if (!result) {
      throw new AppError(500, '재고 이동 처리에 실패했습니다.', 'TRANSFER_FAILED');
    }

    return toInventoryResponse(result);
  },
};
