import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './core/config/env';
import { swaggerSpec } from './core/config/swagger';
import routes from './routes';
import { setupErrorHandling } from './core/middleware/errorHandler';
import { UPLOAD_ROOT } from './core/config/upload';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(UPLOAD_ROOT));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api', routes);

setupErrorHandling(app);

export default app;
