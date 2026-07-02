import * as XLSX from 'xlsx';
import { prisma } from '../../core/config/database';
import { createInventoryPdf } from '../../core/utils/pdf';
import { buildCreatedAtFilter } from './export.query';

const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  INBOUND: '입고',
  OUTBOUND: '출고',
  ADJUSTMENT: '조정',
  TRANSFER: '이동',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  DRAFT: '임시저장',
  PENDING: '승인대기',
  APPROVED: '승인완료',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

async function loadActorMap(ids: Array<string | null | undefined>) {
  const actorIds = [...new Set(ids.filter((id): id is string => Boolean(id)))];
  if (actorIds.length === 0) return new Map<string, string>();
  const actors = await prisma.user.findMany({
    where: { id: { in: actorIds } },
    select: { id: true, name: true },
  });
  return new Map(actors.map((actor) => [actor.id, actor.name]));
}

function toBuffer(workbook: XLSX.WorkBook, filename: string) {
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  return { buffer, filename };
}

export const exportService = {
  async exportProducts() {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { sku: 'asc' },
    });

    const rows = products.map((product) => ({
      SKU: product.sku,
      상품명: product.name,
      단위: product.unit,
      가격: Number(product.price),
      설명: product.description ?? '',
      이미지URL: product.imageUrl ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'products');
    return toBuffer(workbook, `products_${Date.now()}.xlsx`);
  },

  async exportInventory() {
    const items = await prisma.inventory.findMany({
      orderBy: [{ location: { code: 'asc' } }, { product: { sku: 'asc' } }],
      include: {
        product: { select: { sku: true, name: true, unit: true } },
        location: {
          select: {
            code: true,
            name: true,
            warehouse: { select: { code: true, name: true } },
          },
        },
      },
    });

    const rows = items.map((item) => ({
      창고코드: item.location.warehouse.code,
      창고명: item.location.warehouse.name,
      로케이션: item.location.code,
      SKU: item.product.sku,
      상품명: item.product.name,
      수량: item.quantity,
      단위: item.product.unit,
      최종수정: item.updatedAt.toISOString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'inventory');
    return toBuffer(workbook, `inventory_${Date.now()}.xlsx`);
  },

  async exportInventoryPdf() {
    const items = await prisma.inventory.findMany({
      orderBy: [{ location: { code: 'asc' } }, { product: { sku: 'asc' } }],
      include: {
        product: { select: { sku: true, name: true, unit: true } },
        location: {
          select: {
            code: true,
            warehouse: { select: { code: true, name: true } },
          },
        },
      },
    });

    const buffer = await createInventoryPdf(
      items.map((item) => ({
        warehouseCode: item.location.warehouse.code,
        warehouseName: item.location.warehouse.name,
        locationCode: item.location.code,
        sku: item.product.sku,
        productName: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
      })),
    );

    return { buffer, filename: `inventory_${Date.now()}.pdf` };
  },

  async exportMovements(limit = 5000, from?: Date, to?: Date) {
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        createdAt: buildCreatedAtFilter(from, to),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { sku: true, name: true } },
        location: {
          select: {
            code: true,
            warehouse: { select: { code: true } },
          },
        },
      },
    });

    const actorMap = await loadActorMap(movements.map((movement) => movement.createdById));

    const rows = movements.map((movement) => ({
      일시: movement.createdAt.toISOString(),
      유형: MOVEMENT_TYPE_LABEL[movement.type] ?? movement.type,
      SKU: movement.product.sku,
      상품명: movement.product.name,
      창고: movement.location?.warehouse.code ?? '',
      로케이션: movement.location?.code ?? '',
      수량: movement.quantity,
      변동전: movement.beforeQty ?? '',
      변동후: movement.afterQty ?? '',
      작업자: movement.createdById ? actorMap.get(movement.createdById) ?? '' : '',
      비고: movement.note ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'movements');
    return toBuffer(workbook, `movements_${Date.now()}.xlsx`);
  },

  async exportInboundOrders(from?: Date, to?: Date) {
    const orders = await prisma.inboundOrder.findMany({
      where: { createdAt: buildCreatedAtFilter(from, to) },
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { code: true, name: true } },
        items: {
          include: {
            product: { select: { sku: true, name: true, unit: true } },
          },
        },
      },
    });

    const rows = orders.flatMap((order) =>
      order.items.map((item) => ({
        전표번호: order.orderNo,
        상태: ORDER_STATUS_LABEL[order.status] ?? order.status,
        거래처코드: order.partner?.code ?? '',
        거래처명: order.partner?.name ?? '',
        SKU: item.product.sku,
        상품명: item.product.name,
        수량: item.quantity,
        단위: item.product.unit,
        등록일: order.createdAt.toISOString(),
        완료일: order.completedAt?.toISOString() ?? '',
        비고: order.note ?? '',
      })),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'inbound');
    return toBuffer(workbook, `inbound_${Date.now()}.xlsx`);
  },

  async exportOutboundOrders(from?: Date, to?: Date) {
    const orders = await prisma.outboundOrder.findMany({
      where: { createdAt: buildCreatedAtFilter(from, to) },
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { code: true, name: true } },
        items: {
          include: {
            product: { select: { sku: true, name: true, unit: true } },
          },
        },
      },
    });

    const rows = orders.flatMap((order) =>
      order.items.map((item) => ({
        전표번호: order.orderNo,
        상태: ORDER_STATUS_LABEL[order.status] ?? order.status,
        거래처코드: order.partner?.code ?? '',
        거래처명: order.partner?.name ?? '',
        SKU: item.product.sku,
        상품명: item.product.name,
        수량: item.quantity,
        단위: item.product.unit,
        등록일: order.createdAt.toISOString(),
        완료일: order.completedAt?.toISOString() ?? '',
        비고: order.note ?? '',
      })),
    );

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'outbound');
    return toBuffer(workbook, `outbound_${Date.now()}.xlsx`);
  },
};
