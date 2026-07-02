import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { warehouseRepository } from './warehouse.repository';

export const warehouseListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  isActive: z
    .preprocess((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
});

export const createWarehouseSchema = z.object({
  code: z.string().min(1, '창고 코드는 필수입니다.').max(50),
  name: z.string().min(1, '창고명은 필수입니다.').max(200),
  address: z.string().max(500).optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const createLocationSchema = z.object({
  code: z.string().min(1, '로케이션 코드는 필수입니다.').max(50),
  name: z.string().max(200).optional(),
});

export const updateLocationSchema = createLocationSchema.partial();

type WarehouseRecord = NonNullable<Awaited<ReturnType<typeof warehouseRepository.findById>>>;
type LocationRecord = NonNullable<Awaited<ReturnType<typeof warehouseRepository.findLocationById>>>;

function toWarehouseSummary(
  warehouse: WarehouseRecord | Awaited<ReturnType<typeof warehouseRepository.findMany>>[0][number],
) {
  return {
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    address: warehouse.address,
    isActive: warehouse.isActive,
    locationCount: '_count' in warehouse ? warehouse._count.locations : warehouse.locations.length,
    createdAt: warehouse.createdAt,
    updatedAt: warehouse.updatedAt,
  };
}

function toLocationResponse(location: LocationRecord | Awaited<ReturnType<typeof warehouseRepository.findLocations>>[number]) {
  return {
    id: location.id,
    warehouseId: location.warehouseId,
    code: location.code,
    name: location.name,
    inventoryCount: location._count.inventoryItems,
    createdAt: location.createdAt,
    updatedAt: location.updatedAt,
    warehouse: 'warehouse' in location ? location.warehouse : undefined,
  };
}

export const warehouseService = {
  async list(query: z.infer<typeof warehouseListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await warehouseRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      isActive: query.isActive,
    });

    return {
      items: items.map(toWarehouseSummary),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError(404, '창고를 찾을 수 없습니다.', 'WAREHOUSE_NOT_FOUND');
    }

    return {
      ...toWarehouseSummary(warehouse),
      locations: warehouse.locations.map(toLocationResponse),
    };
  },

  async create(input: z.infer<typeof createWarehouseSchema>) {
    const existing = await warehouseRepository.findByCode(input.code);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 창고 코드입니다.', 'WAREHOUSE_CODE_EXISTS');
    }

    const warehouse = await warehouseRepository.create({
      code: input.code,
      name: input.name,
      address: input.address || null,
    });

    const created = await warehouseRepository.findById(warehouse.id);
    return toWarehouseSummary(created!);
  },

  async update(id: string, input: z.infer<typeof updateWarehouseSchema>) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError(404, '창고를 찾을 수 없습니다.', 'WAREHOUSE_NOT_FOUND');
    }

    if (input.code && input.code !== warehouse.code) {
      const existing = await warehouseRepository.findByCode(input.code);
      if (existing) {
        throw new AppError(409, '이미 사용 중인 창고 코드입니다.', 'WAREHOUSE_CODE_EXISTS');
      }
    }

    await warehouseRepository.update(id, {
      code: input.code,
      name: input.name,
      address: input.address === '' ? null : input.address,
      isActive: input.isActive,
    });

    const updated = await warehouseRepository.findById(id);
    return toWarehouseSummary(updated!);
  },

  async remove(id: string) {
    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw new AppError(404, '창고를 찾을 수 없습니다.', 'WAREHOUSE_NOT_FOUND');
    }

    const deactivated = await warehouseRepository.deactivate(id);
    return {
      id: deactivated.id,
      code: deactivated.code,
      name: deactivated.name,
      address: deactivated.address,
      isActive: deactivated.isActive,
      locationCount: warehouse.locations.length,
      createdAt: deactivated.createdAt,
      updatedAt: deactivated.updatedAt,
    };
  },

  async listLocations(warehouseId: string) {
    const warehouse = await warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(404, '창고를 찾을 수 없습니다.', 'WAREHOUSE_NOT_FOUND');
    }

    const locations = await warehouseRepository.findLocations(warehouseId);
    return locations.map(toLocationResponse);
  },

  async createLocation(warehouseId: string, input: z.infer<typeof createLocationSchema>) {
    const warehouse = await warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new AppError(404, '창고를 찾을 수 없습니다.', 'WAREHOUSE_NOT_FOUND');
    }

    if (!warehouse.isActive) {
      throw new AppError(400, '비활성 창고에는 로케이션을 추가할 수 없습니다.', 'WAREHOUSE_INACTIVE');
    }

    const existing = await warehouseRepository.findLocationByCode(warehouseId, input.code);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 로케이션 코드입니다.', 'LOCATION_CODE_EXISTS');
    }

    const location = await warehouseRepository.createLocation({
      code: input.code,
      name: input.name || null,
      warehouse: { connect: { id: warehouseId } },
    });

    const created = await warehouseRepository.findLocationById(location.id);
    return toLocationResponse(created!);
  },

  async updateLocation(locationId: string, input: z.infer<typeof updateLocationSchema>) {
    const location = await warehouseRepository.findLocationById(locationId);
    if (!location) {
      throw new AppError(404, '로케이션을 찾을 수 없습니다.', 'LOCATION_NOT_FOUND');
    }

    if (input.code && input.code !== location.code) {
      const existing = await warehouseRepository.findLocationByCode(location.warehouseId, input.code);
      if (existing) {
        throw new AppError(409, '이미 사용 중인 로케이션 코드입니다.', 'LOCATION_CODE_EXISTS');
      }
    }

    await warehouseRepository.updateLocation(locationId, {
      code: input.code,
      name: input.name === '' ? null : input.name,
    });

    const updated = await warehouseRepository.findLocationById(locationId);
    return toLocationResponse(updated!);
  },

  async removeLocation(locationId: string) {
    const location = await warehouseRepository.findLocationById(locationId);
    if (!location) {
      throw new AppError(404, '로케이션을 찾을 수 없습니다.', 'LOCATION_NOT_FOUND');
    }

    const stockedCount = await warehouseRepository.countInventoryAtLocation(locationId);
    if (stockedCount > 0) {
      throw new AppError(
        400,
        '재고가 있는 로케이션은 삭제할 수 없습니다.',
        'LOCATION_HAS_INVENTORY',
      );
    }

    await warehouseRepository.deleteLocation(locationId);
    return toLocationResponse(location);
  },
};
