import { Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

export const warehouseRepository = {
  findMany(params: {
    skip: number;
    take: number;
    search?: string;
    isActive?: boolean;
  }) {
    const where: Prisma.WarehouseWhereInput = {};

    if (params.search) {
      where.OR = [
        { code: { contains: params.search } },
        { name: { contains: params.search } },
      ];
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    return prisma.$transaction([
      prisma.warehouse.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { code: 'asc' },
        include: {
          _count: { select: { locations: true } },
        },
      }),
      prisma.warehouse.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.warehouse.findUnique({
      where: { id },
      include: {
        locations: {
          orderBy: { code: 'asc' },
          include: {
            _count: { select: { inventoryItems: true } },
          },
        },
      },
    });
  },

  findByCode(code: string) {
    return prisma.warehouse.findUnique({ where: { code } });
  },

  create(data: Prisma.WarehouseCreateInput) {
    return prisma.warehouse.create({ data });
  },

  update(id: string, data: Prisma.WarehouseUpdateInput) {
    return prisma.warehouse.update({ where: { id }, data });
  },

  deactivate(id: string) {
    return prisma.warehouse.update({
      where: { id },
      data: { isActive: false },
    });
  },

  findLocations(warehouseId: string) {
    return prisma.location.findMany({
      where: { warehouseId },
      orderBy: { code: 'asc' },
      include: {
        _count: { select: { inventoryItems: true } },
      },
    });
  },

  findLocationById(id: string) {
    return prisma.location.findUnique({
      where: { id },
      include: {
        warehouse: { select: { id: true, code: true, name: true } },
        _count: { select: { inventoryItems: true } },
      },
    });
  },

  findLocationByCode(warehouseId: string, code: string) {
    return prisma.location.findUnique({
      where: { warehouseId_code: { warehouseId, code } },
    });
  },

  createLocation(data: Prisma.LocationCreateInput) {
    return prisma.location.create({ data });
  },

  updateLocation(id: string, data: Prisma.LocationUpdateInput) {
    return prisma.location.update({ where: { id }, data });
  },

  deleteLocation(id: string) {
    return prisma.location.delete({ where: { id } });
  },

  countInventoryAtLocation(locationId: string) {
    return prisma.inventory.count({
      where: { locationId, quantity: { gt: 0 } },
    });
  },
};
