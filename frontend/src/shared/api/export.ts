import { apiClient } from '@/shared/api/client';

export async function downloadExport(endpoint: string, fallbackName: string) {
  const response = await apiClient.get(endpoint, { responseType: 'blob' });
  const disposition = response.headers['content-disposition'] as string | undefined;
  const match = disposition?.match(/filename="(.+)"/);
  const filename = match?.[1] ?? fallbackName;

  const url = window.URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function exportProductsExcel() {
  return downloadExport('/export/products', 'products.xlsx');
}

export function exportInventoryExcel() {
  return downloadExport('/export/inventory', 'inventory.xlsx');
}

export function exportMovementsExcel() {
  return downloadExport('/export/movements', 'movements.xlsx');
}

export function exportInventoryPdf() {
  return downloadExport('/export/inventory.pdf', 'inventory.pdf');
}
