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

// Phase 3 Route handlers (BR13–BR15)
import alertsRoutes from '../routes/alerts';

// Phase 4 Route handlers (BR6–BR12)
import roomsRoutes from '../routes/rooms';
import requestsRoutes from '../routes/requests';

// Phase 5 Route handlers (BR3, BR4, BR16–BR24)
import societiesRoutes from '../routes/societies';
import eventsRoutes from '../routes/events';
import searchRoutes from '../routes/search';
import faqsRoutes from '../routes/faqs';
import staffRoutes from '../routes/staff';

export function createExpressApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

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

  // Phase 3: Critical Safety Alerts & Text.lk SMS
  v1.use('/alerts', alertsRoutes);

  // Phase 4: Room Bookings & Campus Inquiries / Service Requests
  v1.use('/rooms', roomsRoutes);
  v1.use('/requests', requestsRoutes);

  // Phase 5: Societies, Event RSVPs, Global Search, FAQs & Staff Directory
  v1.use('/societies', societiesRoutes);
  v1.use('/events', eventsRoutes);
  v1.use('/search', searchRoutes);
  v1.use('/faqs', faqsRoutes);
  v1.use('/staff', staffRoutes);

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
