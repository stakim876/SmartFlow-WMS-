import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: requireEnv('DATABASE_URL'),
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5175,http://127.0.0.1:5175')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:4000',
  shop: {
    apiUrl: process.env.SHOP_API_URL ?? 'http://localhost:3102',
    apiKey: process.env.SHOP_API_KEY ?? '',
    get enabled() {
      return Boolean(process.env.SHOP_API_URL && process.env.SHOP_API_KEY);
    },
  },
} as const;
