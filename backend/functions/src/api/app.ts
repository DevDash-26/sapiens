import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { authenticateToken } from '../middleware/auth';
import { sendError } from '../utils/envelope';

// Phase 1 Route handlers
import metaRoutes from '../routes/meta';
import meRoutes from '../routes/me';

// Phase 2 Route handlers
import feedRoutes from '../routes/feed';
import contentsRoutes from '../routes/contents';
import calendarRoutes from '../routes/calendar';

// Phase 3-6 Route handlers per API-Contract+DataModel.md
import alertsRoutes from '../routes/alerts';
import requestsRoutes from '../routes/requests';
import roomsRoutes from '../routes/rooms';
import societiesRoutes from '../routes/societies';
import faqsRoutes from '../routes/faqs';
import staffRoutes from '../routes/staff';
import usersRoutes from '../routes/users';
import aiRoutes from '../routes/ai';

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
  v1.use('/me', meRoutes);
  v1.use('/feed', feedRoutes);
  v1.use('/contents', contentsRoutes);
  v1.use('/calendar', calendarRoutes);
  v1.use('/alerts', alertsRoutes);
  v1.use('/requests', requestsRoutes);
  v1.use('/rooms', roomsRoutes);
  v1.use('/societies', societiesRoutes);
  v1.use('/faqs', faqsRoutes);
  v1.use('/staff', staffRoutes);
  v1.use('/users', usersRoutes);
  v1.use('/ai', aiRoutes);

  app.use('/api/v1', v1);
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
