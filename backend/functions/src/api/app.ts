import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticateToken } from '../middleware/auth';
import { sendError } from '../utils/envelope';

// Phase 1 Route handlers
import metaRoutes from '../routes/meta';
import authRoutes from '../routes/auth';
import meRoutes from '../routes/me';

// Phase 2 Route handlers
import feedRoutes from '../routes/feed';
import contentsRoutes from '../routes/contents';
import calendarRoutes from '../routes/calendar';
import notificationsRoutes from '../routes/notifications';

export function createExpressApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(authenticateToken);

  // Health and Meta directly on root
  app.use('/health', metaRoutes);

  // Mount API v1 router
  const v1 = express.Router();
  v1.use('/', metaRoutes);
  v1.use('/auth', authRoutes);
  v1.use('/me', meRoutes);
  v1.use('/feed', feedRoutes);
  v1.use('/contents', contentsRoutes);
  v1.use('/calendar', calendarRoutes);
  v1.use('/notifications', notificationsRoutes);

  app.use('/api/v1', v1);
  app.use('/v1', v1);
  app.use('/', v1);

  // 404 handler
  app.use((_req: Request, res: Response) => {
    sendError(res, 'NOT_FOUND', 'Endpoint not found.', 404);
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled server error:', err);
    sendError(res, 'INTERNAL', 'An unexpected server error occurred.', 500);
  });

  return app;
}
