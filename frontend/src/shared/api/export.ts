import { apiClient } from '@/shared/api/client';

export async function downloadExport(
  endpoint: string,
  fallbackName: string,
  params?: Record<string, string | undefined>,
) {
  const response = await apiClient.get(endpoint, { responseType: 'blob', params });
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

function buildDateParams(from?: string, to?: string) {
  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };
}

export function exportProductsExcel() {
  return downloadExport('/export/products', 'products.xlsx');
}

export function exportInventoryExcel() {
  return downloadExport('/export/inventory', 'inventory.xlsx');
}

export function exportMovementsExcel(from?: string, to?: string) {
  return downloadExport('/export/movements', 'movements.xlsx', buildDateParams(from, to));
}

export function exportInboundExcel(from?: string, to?: string) {
  return downloadExport('/export/inbound', 'inbound.xlsx', buildDateParams(from, to));
}

export function exportOutboundExcel(from?: string, to?: string) {
  return downloadExport('/export/outbound', 'outbound.xlsx', buildDateParams(from, to));
}

export function exportInventoryPdf() {
  return downloadExport('/export/inventory.pdf', 'inventory.pdf');
}
