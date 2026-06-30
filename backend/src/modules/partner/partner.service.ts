import { PartnerType } from '@prisma/client';
import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { partnerRepository } from './partner.repository';

export const partnerListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  type: z.nativeEnum(PartnerType).optional(),
  isActive: z
    .preprocess((value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return undefined;
    }, z.boolean().optional()),
});

export const createPartnerSchema = z.object({
  code: z.string().min(1, '거래처 코드는 필수입니다.').max(50),
  name: z.string().min(1, '거래처명은 필수입니다.').max(200),
  type: z.nativeEnum(PartnerType).default(PartnerType.SUPPLIER),
  contactName: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email('이메일 형식이 올바르지 않습니다.').optional().or(z.literal('')),
  address: z.string().max(500).optional(),
});

export const updatePartnerSchema = createPartnerSchema.partial();

type PartnerRecord = NonNullable<Awaited<ReturnType<typeof partnerRepository.findById>>>;

function toPartnerResponse(partner: PartnerRecord) {
  return {
    id: partner.id,
    code: partner.code,
    name: partner.name,
    type: partner.type,
    contactName: partner.contactName,
    phone: partner.phone,
    email: partner.email,
    address: partner.address,
    isActive: partner.isActive,
    createdAt: partner.createdAt,
    updatedAt: partner.updatedAt,
  };
}

export const partnerService = {
  async list(query: z.infer<typeof partnerListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await partnerRepository.findMany({
      skip,
      take: limit,
      search: query.search,
      type: query.type,
      isActive: query.isActive,
    });

    return {
      items: items.map(toPartnerResponse),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    const partner = await partnerRepository.findById(id);
    if (!partner) {
      throw new AppError(404, '거래처를 찾을 수 없습니다.', 'PARTNER_NOT_FOUND');
    }
    return toPartnerResponse(partner);
  },

  async create(input: z.infer<typeof createPartnerSchema>) {
    const existing = await partnerRepository.findByCode(input.code);
    if (existing) {
      throw new AppError(409, '이미 사용 중인 거래처 코드입니다.', 'PARTNER_CODE_EXISTS');
    }

    const partner = await partnerRepository.create({
      code: input.code,
      name: input.name,
      type: input.type,
      contactName: input.contactName || null,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
    });

    return toPartnerResponse(partner);
  },

  async update(id: string, input: z.infer<typeof updatePartnerSchema>) {
    const partner = await partnerRepository.findById(id);
    if (!partner) {
      throw new AppError(404, '거래처를 찾을 수 없습니다.', 'PARTNER_NOT_FOUND');
    }

    if (input.code && input.code !== partner.code) {
      const existing = await partnerRepository.findByCode(input.code);
      if (existing) {
        throw new AppError(409, '이미 사용 중인 거래처 코드입니다.', 'PARTNER_CODE_EXISTS');
      }
    }

    const updated = await partnerRepository.update(id, {
      code: input.code,
      name: input.name,
      type: input.type,
      contactName: input.contactName === '' ? null : input.contactName,
      phone: input.phone === '' ? null : input.phone,
      email: input.email === '' ? null : input.email,
      address: input.address === '' ? null : input.address,
    });

    return toPartnerResponse(updated);
  },

  async remove(id: string) {
    const partner = await partnerRepository.findById(id);
    if (!partner) {
      throw new AppError(404, '거래처를 찾을 수 없습니다.', 'PARTNER_NOT_FOUND');
    }

    const deleted = await partnerRepository.delete(id);
    return toPartnerResponse(deleted);
  },
};
