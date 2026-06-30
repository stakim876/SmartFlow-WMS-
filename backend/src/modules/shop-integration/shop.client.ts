import { AppError } from '../../core/middleware/errorHandler';

export interface ShopProduct {
  id: number;
  name: string;
  sku: string | null;
  price: number;
  stock: number;
  category: string | null;
  image_url: string | null;
}

export interface ShopOrderItem {
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name: string | null;
  product_sku: string | null;
}

export interface ShopOrder {
  id: number;
  user_id: number;
  recipient_name: string;
  address: string;
  phone: string;
  total_price: number;
  status: string;
  created_at: string;
  carrier_code: string | null;
  tracking_number: string | null;
  items: ShopOrderItem[];
}

type ShopResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export class ShopApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  private integrationUrl(path: string) {
    const base = this.baseUrl.replace(/\/$/, '');
    return `${base}/api/integrations${path}`;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<ShopResponse<T>> {
    const response = await fetch(this.integrationUrl(path), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...(init?.headers ?? {}),
      },
    });

    let body: ShopResponse<T>;
    try {
      body = (await response.json()) as ShopResponse<T>;
    } catch {
      throw new AppError(response.status, '쇼핑몰 API 응답을 해석할 수 없습니다.', 'SHOP_API_ERROR');
    }

    if (!response.ok || body.success === false) {
      throw new AppError(
        response.status,
        body.message ?? '쇼핑몰 API 요청에 실패했습니다.',
        'SHOP_API_ERROR',
      );
    }

    return body;
  }

  async health() {
    const body = await this.request<unknown>('/health');
    return body as ShopResponse<unknown> & { service?: string; integration?: boolean };
  }

  async listProducts() {
    const result = await this.request<ShopProduct[]>('/products');
    return result.data ?? [];
  }

  async updateProductStock(shopProductId: number, stock: number) {
    return this.request<{ id: number; stock: number }>(`/products/${shopProductId}/stock`, {
      method: 'PUT',
      body: JSON.stringify({ stock }),
    });
  }

  async listOrders(statuses = 'paid,preparing') {
    const result = await this.request<ShopOrder[]>(
      `/orders?status=${encodeURIComponent(statuses)}`,
    );
    return result.data ?? [];
  }

  async updateOrderFulfillment(
    shopOrderId: number,
    payload: { status: string; carrier_code?: string; tracking_number?: string },
  ) {
    return this.request(`/orders/${shopOrderId}/fulfillment`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }
}
