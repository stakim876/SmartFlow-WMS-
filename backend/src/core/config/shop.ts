export const shopConfig = {
  apiUrl: process.env.SHOP_API_URL ?? 'http://localhost:3102',
  apiKey: process.env.SHOP_API_KEY ?? '',
  enabled: Boolean(process.env.SHOP_API_URL && process.env.SHOP_API_KEY),
} as const;
