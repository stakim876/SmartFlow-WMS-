import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { productRepository } from './product.repository';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { resolveSort, sortOrderSchema } from '../../core/utils/sort';

const productSortFields = ['createdAt', 'sku', 'name', 'price'] as const;

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  sortBy: z.enum(productSortFields).optional(),
  sortOrder: sortOrderSchema,
  isActive: z
    .preprocess((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
});

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU는 필수입니다.').max(50),
  name: z.string().min(1, '상품명은 필수입니다.').max(200),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  unit: z.string().min(1).max(20).default('EA'),
  price: z.coerce.number().min(0, '가격은 0 이상이어야 합니다.'),
});

export const updateProductSchema = createProductSchema.partial();

function toProductResponse(product: {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  price: { toNumber(): number } | number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    unit: product.unit,
    price: typeof product.price === 'number' ? product.price : product.price.toNumber(),
    isActive: product.isActive,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export const productService = {
  async list(query: z.infer<typeof productListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const orderBy = resolveSort(query.sortBy, query.sortOrder, productSortFields, 'createdAt');
    const [items, total] = await productRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      isActive: query.isActive,
      orderBy,
    });

    return {
      items: items.map(toProductResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'PRODUCT_NOT_FOUND');
    }
    return toProductResponse(product);
  },

  async create(input: z.infer<typeof createProductSchema>) {
    const existing = await productRepository.findBySku(input.sku);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 SKU입니다.', 'SKU_EXISTS');
    }

    const product = await productRepository.create({
      sku: input.sku,
      name: input.name,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      unit: input.unit,
      price: input.price,
    });

    return toProductResponse(product);
  },

  async update(id: string, input: z.infer<typeof updateProductSchema>) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'PRODUCT_NOT_FOUND');
    }

    if (input.sku && input.sku !== product.sku) {
      const existing = await productRepository.findBySku(input.sku);
      if (existing) {
        throw new AppError(409, '이미 사용 중인 SKU입니다.', 'SKU_EXISTS');
      }
    }

    const updated = await productRepository.update(id, {
      sku: input.sku,
      name: input.name,
      description: input.description,
      imageUrl: input.imageUrl === '' ? null : input.imageUrl,
      unit: input.unit,
      price: input.price,
    });

    return toProductResponse(updated);
  },

  async remove(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new AppError(404, '상품을 찾을 수 없습니다.', 'PRODUCT_NOT_FOUND');
    }

    const deleted = await productRepository.delete(id);
    return toProductResponse(deleted);
  },
};
