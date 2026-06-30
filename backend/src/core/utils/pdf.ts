import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export function resolvePdfFontPath() {
  const candidates = [
    path.join(process.cwd(), 'assets', 'fonts', 'NotoSansKR-Regular.ttf'),
    'C:\\Windows\\Fonts\\malgun.ttf',
    'C:\\Windows\\Fonts\\malgunsl.ttf',
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function createInventoryPdf(
  items: Array<{
    warehouseCode: string;
    warehouseName: string;
    locationCode: string;
    sku: string;
    productName: string;
    quantity: number;
    unit: string;
  }>,
) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const fontPath = resolvePdfFontPath();
    if (fontPath) {
      doc.font(fontPath);
    }

    doc.fontSize(18).text('SmartFlow WMS 재고 현황', { align: 'center' });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor('#64748b')
      .text(`출력일시: ${new Date().toLocaleString('ko-KR')}`, { align: 'center' });
    doc.moveDown(1);
    doc.fillColor('#000000');

    const headers = ['창고', '로케이션', 'SKU', '상품명', '수량'];
    const colWidths = [70, 70, 80, 180, 50];
    let y = doc.y;

    doc.fontSize(9).fillColor('#475569');
    let x = doc.page.margins.left;
    headers.forEach((header, index) => {
      doc.text(header, x, y, { width: colWidths[index], continued: false });
      x += colWidths[index];
    });

    y += 16;
    doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.width - doc.page.margins.right, y).stroke('#e2e8f0');
    y += 8;

    doc.fillColor('#0f172a').fontSize(8);

    for (const item of items) {
      if (y > doc.page.height - 60) {
        doc.addPage();
        if (fontPath) {
          doc.font(fontPath);
        }
        y = doc.page.margins.top;
      }

      const row = [
        item.warehouseCode,
        item.locationCode,
        item.sku,
        item.productName,
        `${item.quantity} ${item.unit}`,
      ];
      x = doc.page.margins.left;
      row.forEach((cell, index) => {
        doc.text(cell, x, y, { width: colWidths[index], lineBreak: false });
        x += colWidths[index];
      });
      y += 14;
    }

    doc.end();
  });
}
