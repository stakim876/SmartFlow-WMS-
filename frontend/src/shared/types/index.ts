export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  roleId: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
}
