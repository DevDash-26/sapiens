import { Router, Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { sendSuccess, sendError } from '../utils/envelope';
import { config } from '../config';
import { Role } from '../types/contract';

const router = Router();

// GET /health - uptime probe (NFR3)
router.get('/health', (_req: Request, res: Response) => {
  sendSuccess(res, { status: 'healthy', version: '1.0.0', uptime: process.uptime() });
});

// GET /meta/config - enums, faculties, programmes (§2)
router.get('/meta/config', (_req: Request, res: Response) => {
  const metaConfig = {
    role: ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff', 'society_rep', 'student', 'alumni'],
    userStatus: ['active', 'suspended', 'pending'],
    contentType: ['announcement', 'event', 'guest_lecture', 'calendar', 'info', 'opportunity', 'highlight'],
    contentCategory: {
      announcement: ['academic', 'admin', 'finance', 'general'],
      event: ['academic', 'social', 'sports', 'cultural', 'career', 'other'],
      guest_lecture: ['lecture', 'industry_talk', 'workshop'],
      calendar: ['exam', 'add_drop', 'semester', 'holiday', 'deadline'],
      info: ['dining', 'printing', 'sports', 'library', 'it_support', 'wellbeing', 'finance_aid', 'onboarding', 'general'],
      opportunity: ['job', 'internship', 'placement', 'volunteering', 'alumni'],
      highlight: ['achievement', 'past_event'],
    },
    contentStatus: ['draft', 'pending_review', 'scheduled', 'published', 'rejected', 'cancelled', 'expired', 'archived'],
    priority: ['normal', 'high'],
    origin: ['official', 'student'],
    alertKind: ['emergency', 'closure', 'schedule_change'],
    alertStatus: ['draft', 'active', 'resolved'],
    requestType: ['lost', 'found', 'textbook', 'academic_support', 'facility_issue', 'feedback'],
    requestStatus: ['open', 'in_progress', 'resolved', 'closed', 'rejected'],
    claimStatus: ['pending', 'approved', 'rejected'],
    bookingStatus: ['confirmed', 'cancelled', 'cancelled_by_closure', 'cancelled_by_admin'],
    membershipStatus: ['interested', 'pending', 'approved', 'rejected'],
    notificationType: ['alert', 'announcement', 'event', 'booking', 'request', 'society', 'system'],
    aiActionType: ['open_booking', 'open_content', 'open_form', 'open_society', 'open_staff', 'open_calendar'],
    faculty: [
      { id: 'FOC', name: 'Faculty of Computing' },
      { id: 'FOB', name: 'Faculty of Business' },
      { id: 'FOE', name: 'Faculty of Engineering' },
    ],
    programme: [
      { id: 'BSC-SE', name: 'BSc (Hons) Software Engineering' },
      { id: 'BSC-CS', name: 'BSc (Hons) Computer Science' },
      { id: 'BBA', name: 'Bachelor of Business Administration' },
      { id: 'BENG-CE', name: 'BEng (Hons) Civil Engineering' },
    ],
    yearGroup: [1, 2, 3, 4],
  };
  sendSuccess(res, metaConfig);
});

// POST /auth/demo-token - returns custom token for one-tap role switch in demo mode (§1.2, §5.0)
router.post('/auth/demo-token', async (req: Request, res: Response) => {
  if (!config.demoMode) {
    sendError(res, 'FORBIDDEN', 'Demo token endpoint is disabled in production.', 403);
    return;
  }

  const { role = 'student', uid } = req.body as { role?: Role; uid?: string };

  const DEMO_UID_MAP: Record<Role, string> = {
    super_admin: 'usr_super_01',
    admin: 'usr_admin_01',
    manager: 'usr_mgr_01',
    academic_staff: 'usr_acad_01',
    finance_staff: 'usr_fin_01',
    society_rep: 'usr_rep_01',
    student: 'usr_student_01',
    alumni: 'usr_alum_01',
  };

  const targetUid = uid || DEMO_UID_MAP[role] || 'usr_student_01';

  try {
    const customToken = await admin.auth().createCustomToken(targetUid, { role });
    sendSuccess(res, { customToken, uid: targetUid, role });
  } catch (err: any) {
    console.error('Error generating demo token:', err);
    sendError(res, 'INTERNAL', 'Failed to generate demo token.', 500);
  }
});

export default router;
