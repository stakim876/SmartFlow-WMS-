import * as XLSX from 'xlsx';
import { prisma } from '../../core/config/database';
import { createInventoryPdf } from '../../core/utils/pdf';

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

  async exportMovements(limit = 500) {
    const movements = await prisma.inventoryMovement.findMany({
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

    const rows = movements.map((movement) => ({
      일시: movement.createdAt.toISOString(),
      유형: movement.type,
      SKU: movement.product.sku,
      상품명: movement.product.name,
      창고: movement.location?.warehouse.code ?? '',
      로케이션: movement.location?.code ?? '',
      수량: movement.quantity,
      변동전: movement.beforeQty ?? '',
      변동후: movement.afterQty ?? '',
      비고: movement.note ?? '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'movements');
    return toBuffer(workbook, `movements_${Date.now()}.xlsx`);
  },
};
