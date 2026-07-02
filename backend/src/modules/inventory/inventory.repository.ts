import { prisma } from '../../core/config/database';
import { MovementType, Prisma } from '@prisma/client';

export const inventoryRepository = {
  findMany(params: {
    skip: number;
    take: number;
    search?: string;
    warehouseId?: string;
  }) {
    const where: Prisma.InventoryWhereInput = {};

    if (params.search) {
      where.product = {
        OR: [
          { sku: { contains: params.search } },
          { name: { contains: params.search } },
        ],
      };
    }

    if (params.warehouseId) {
      where.location = { warehouseId: params.warehouseId };
    }

    const include = {
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
    };

    return prisma.$transaction([
      prisma.inventory.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { updatedAt: 'desc' },
        include,
      }),
      prisma.inventory.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.inventory.findUnique({
      where: { id },
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
  },

  findByProductAndLocation(productId: string, locationId: string) {
    return prisma.inventory.findUnique({
      where: {
        productId_locationId: { productId, locationId },
      },
    });
  },

  findMovements(params: {
    skip: number;
    take: number;
    productId?: string;
    type?: MovementType;
    from?: Date;
    to?: Date;
  }) {
    const where: Prisma.InventoryMovementWhereInput = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.type) {
      where.type = params.type;
    }

    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from ? { gte: params.from } : {}),
        ...(params.to ? { lte: params.to } : {}),
      };
    }

    const include = {
      product: { select: { id: true, sku: true, name: true } },
      location: {
        select: {
          id: true,
          code: true,
          name: true,
          warehouse: { select: { id: true, code: true, name: true } },
        },
      },
    };

    return prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
        include,
      }),
      prisma.inventoryMovement.count({ where }),
    ]);
  },

  findLocations() {
    return prisma.location.findMany({
      where: { warehouse: { isActive: true } },
      orderBy: [{ warehouse: { code: 'asc' } }, { code: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        warehouse: { select: { id: true, code: true, name: true } },
      },
    });
  },

  findWarehouses() {
    return prisma.warehouse.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' },
      select: { id: true, code: true, name: true },
    });
  },
};
