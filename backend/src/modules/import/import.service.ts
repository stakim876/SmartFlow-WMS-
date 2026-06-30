import * as XLSX from 'xlsx';
import { prisma } from '../../core/config/database';

function sheetToRows(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
    defval: '',
  });
}

function pickString(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return '';
}

function pickNumber(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value === undefined || value === null || value === '') {
      continue;
    }
    const num = Number(value);
    if (!Number.isNaN(num)) {
      return num;
    }
  }
  return 0;
}

export const importService = {
  async importProducts(buffer: Buffer) {
    const rows = sheetToRows(buffer);
    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const sku = pickString(row, ['SKU', 'sku', 'Sku']);
      const name = pickString(row, ['상품명', 'name', 'Name', '제품명']);
      const unit = pickString(row, ['단위', 'unit', 'Unit']) || 'EA';
      const price = pickNumber(row, ['가격', 'price', 'Price']);
      const description = pickString(row, ['설명', 'description', 'Description']);

      if (!sku && !name) {
        continue;
      }

      if (!sku || !name) {
        errors.push(`${index + 2}행: SKU와 상품명은 필수입니다.`);
        skipped += 1;
        continue;
      }

      const existing = await prisma.product.findUnique({ where: { sku } });
      if (existing) {
        skipped += 1;
        continue;
      }

      await prisma.product.create({
        data: {
          sku,
          name,
          unit,
          price,
          description: description || null,
        },
      });
      created += 1;
    }

    return { created, skipped, errors, total: rows.length };
  },
};
