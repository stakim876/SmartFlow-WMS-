import { MovementType, Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';
import { AppError } from '../../core/middleware/errorHandler';

type TxClient = Prisma.TransactionClient;

interface MovementMeta {
  referenceType?: string;
  referenceId?: string;
  note?: string;
  createdById?: string;
}

async function getOrCreateInventory(
  tx: TxClient,
  productId: string,
  locationId: string,
) {
  const existing = await tx.inventory.findUnique({
    where: { productId_locationId: { productId, locationId } },
  });

  if (existing) {
    return existing;
  }

  return tx.inventory.create({
    data: { productId, locationId, quantity: 0 },
  });
}

async function recordMovement(
  tx: TxClient,
  data: {
    productId: string;
    locationId: string | null;
    type: MovementType;
    quantity: number;
    beforeQty: number;
    afterQty: number;
    meta?: MovementMeta;
  },
) {
  return tx.inventoryMovement.create({
    data: {
      productId: data.productId,
      locationId: data.locationId,
      type: data.type,
      quantity: data.quantity,
      beforeQty: data.beforeQty,
      afterQty: data.afterQty,
      referenceType: data.meta?.referenceType,
      referenceId: data.meta?.referenceId,
      note: data.meta?.note,
      createdById: data.meta?.createdById,
    },
  });
}

export const inventoryStockService = {
  async increaseStock(
    tx: TxClient,
    params: {
      productId: string;
      locationId: string;
      quantity: number;
      meta?: MovementMeta;
      movementType?: MovementType;
    },
  ) {
    if (params.quantity <= 0) {
      throw new AppError(400, '수량은 1 이상이어야 합니다.', 'INVALID_QUANTITY');
    }

    const inventory = await getOrCreateInventory(tx, params.productId, params.locationId);
    const beforeQty = inventory.quantity;
    const afterQty = beforeQty + params.quantity;

    await tx.inventory.update({
      where: { id: inventory.id },
      data: { quantity: afterQty },
    });

    await recordMovement(tx, {
      productId: params.productId,
      locationId: params.locationId,
      type: params.movementType ?? MovementType.INBOUND,
      quantity: params.quantity,
      beforeQty,
      afterQty,
      meta: params.meta,
    });

    return afterQty;
  },

  async decreaseStock(
    tx: TxClient,
    params: {
      productId: string;
      locationId: string;
      quantity: number;
      meta?: MovementMeta;
      movementType?: MovementType;
    },
  ) {
    if (params.quantity <= 0) {
      throw new AppError(400, '수량은 1 이상이어야 합니다.', 'INVALID_QUANTITY');
    }

    const inventory = await tx.inventory.findUnique({
      where: { productId_locationId: { productId: params.productId, locationId: params.locationId } },
    });

    if (!inventory || inventory.quantity < params.quantity) {
      throw new AppError(400, '재고가 부족합니다.', 'INSUFFICIENT_STOCK');
    }

    const beforeQty = inventory.quantity;
    const afterQty = beforeQty - params.quantity;

    await tx.inventory.update({
      where: { id: inventory.id },
      data: { quantity: afterQty },
    });

    await recordMovement(tx, {
      productId: params.productId,
      locationId: params.locationId,
      type: params.movementType ?? MovementType.OUTBOUND,
      quantity: params.quantity,
      beforeQty,
      afterQty,
      meta: params.meta,
    });

    return afterQty;
  },

  async adjustStock(
    inventoryId: string,
    newQuantity: number,
    meta?: MovementMeta,
  ) {
    if (newQuantity < 0) {
      throw new AppError(400, '재고는 0 이상이어야 합니다.', 'INVALID_QUANTITY');
    }

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { id: inventoryId } });
      if (!inventory) {
        throw new AppError(404, '재고를 찾을 수 없습니다.', 'INVENTORY_NOT_FOUND');
      }

      const beforeQty = inventory.quantity;
      const diff = newQuantity - beforeQty;

      if (diff === 0) {
        return inventory;
      }

      await tx.inventory.update({
        where: { id: inventoryId },
        data: { quantity: newQuantity },
      });

      await recordMovement(tx, {
        productId: inventory.productId,
        locationId: inventory.locationId,
        type: MovementType.ADJUSTMENT,
        quantity: Math.abs(diff),
        beforeQty,
        afterQty: newQuantity,
        meta,
      });

      return tx.inventory.findUnique({
        where: { id: inventoryId },
        include: {
          product: true,
          location: { include: { warehouse: true } },
        },
      });
    });
  },

  async transferStock(params: {
    productId: string;
    fromLocationId: string;
    toLocationId: string;
    quantity: number;
    meta?: MovementMeta;
  }) {
    if (params.fromLocationId === params.toLocationId) {
      throw new AppError(400, '동일한 로케이션으로 이동할 수 없습니다.', 'SAME_LOCATION');
    }

    return prisma.$transaction(async (tx) => {
      await inventoryStockService.decreaseStock(tx, {
        productId: params.productId,
        locationId: params.fromLocationId,
        quantity: params.quantity,
        movementType: MovementType.TRANSFER,
        meta: { ...params.meta, note: params.meta?.note ?? '재고 이동 (출고)' },
      });

      await inventoryStockService.increaseStock(tx, {
        productId: params.productId,
        locationId: params.toLocationId,
        quantity: params.quantity,
        movementType: MovementType.TRANSFER,
        meta: { ...params.meta, note: params.meta?.note ?? '재고 이동 (입고)' },
      });
    });
  },
};
