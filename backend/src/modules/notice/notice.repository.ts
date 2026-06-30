import { Prisma } from '@prisma/client';
import { prisma } from '../../core/config/database';

export const noticeRepository = {
  findMany(params: { skip: number; take: number; search?: string }) {
    const where: Prisma.NoticeWhereInput = {};

    if (params.search) {
      where.OR = [
        { title: { contains: params.search } },
        { content: { contains: params.search } },
      ];
    }

    return prisma.$transaction([
      prisma.notice.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.notice.count({ where }),
    ]);
  },

  findById(id: string) {
    return prisma.notice.findUnique({ where: { id } });
  },

  create(data: Prisma.NoticeCreateInput) {
    return prisma.notice.create({ data });
  },

  update(id: string, data: Prisma.NoticeUpdateInput) {
    return prisma.notice.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.notice.delete({ where: { id } });
  },

  findAuthorsByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return prisma.user.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true },
    });
  },
};
