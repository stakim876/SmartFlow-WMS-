process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'mysql://smartflow:smartflow@localhost:3308/smartflow_wms';
process.env.JWT_SECRET ??= 'test-jwt-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-jwt-refresh-secret';
process.env.CORS_ORIGIN ??= 'http://localhost:5173';
