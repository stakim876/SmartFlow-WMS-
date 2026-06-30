import { z } from 'zod';
import { AppError } from '../../core/middleware/errorHandler';
import { buildPaginationMeta, getPagination } from '../../core/utils/pagination';
import { noticeRepository } from './notice.repository';

export const noticeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
});

export const createNoticeSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.').max(200),
  content: z.string().min(1, '내용은 필수입니다.').max(10000),
  isPinned: z.boolean().optional(),
});

export const updateNoticeSchema = createNoticeSchema.partial();

type NoticeRecord = NonNullable<Awaited<ReturnType<typeof noticeRepository.findById>>>;

async function enrichWithAuthorName(notice: NoticeRecord) {
  let authorName: string | null = null;
  if (notice.authorId) {
    const authors = await noticeRepository.findAuthorsByIds([notice.authorId]);
    authorName = authors[0]?.name ?? null;
  }
  return toNoticeResponse(notice, authorName);
}

async function enrichManyWithAuthorNames(notices: NoticeRecord[]) {
  const authorIds = [
    ...new Set(notices.map((notice) => notice.authorId).filter((id): id is string => !!id)),
  ];
  const authors = await noticeRepository.findAuthorsByIds(authorIds);
  const authorMap = new Map(authors.map((author) => [author.id, author.name]));

  return notices.map((notice) =>
    toNoticeResponse(notice, notice.authorId ? authorMap.get(notice.authorId) ?? null : null),
  );
}

function toNoticeResponse(notice: NoticeRecord, authorName: string | null = null) {
  return {
    id: notice.id,
    title: notice.title,
    content: notice.content,
    isPinned: notice.isPinned,
    authorId: notice.authorId,
    authorName,
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt,
  };
}

export const noticeService = {
  async list(query: z.infer<typeof noticeListQuerySchema>) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await noticeRepository.findMany({
      skip,
      take: limit,
      search: query.search,
    });

    return {
      items: await enrichManyWithAuthorNames(items),
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getById(id: string) {
    const notice = await noticeRepository.findById(id);
    if (!notice) {
      throw new AppError(404, '공지사항을 찾을 수 없습니다.', 'NOTICE_NOT_FOUND');
    }
    return enrichWithAuthorName(notice);
  },

  async create(input: z.infer<typeof createNoticeSchema>, authorId: string) {
    const notice = await noticeRepository.create({
      title: input.title,
      content: input.content,
      isPinned: input.isPinned ?? false,
      authorId,
    });
    return enrichWithAuthorName(notice);
  },

  async update(id: string, input: z.infer<typeof updateNoticeSchema>) {
    const notice = await noticeRepository.findById(id);
    if (!notice) {
      throw new AppError(404, '공지사항을 찾을 수 없습니다.', 'NOTICE_NOT_FOUND');
    }

    const updated = await noticeRepository.update(id, {
      title: input.title,
      content: input.content,
      isPinned: input.isPinned,
    });

    return enrichWithAuthorName(updated);
  },

  async remove(id: string) {
    const notice = await noticeRepository.findById(id);
    if (!notice) {
      throw new AppError(404, '공지사항을 찾을 수 없습니다.', 'NOTICE_NOT_FOUND');
    }

    await noticeRepository.delete(id);
    return { id };
  },
};
