import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Staff } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /staff - staff directory (§5.11)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { q, department } = req.query as Record<string, string>;
  const db = admin.firestore();

  let query: admin.firestore.Query = db.collection('staff').where('status', '==', 'active');
  if (department) query = query.where('department', '==', department);

  const snap = await query.get();
  let staff = snap.docs.map((d) => d.data() as Staff);

  if (q) {
    const qLower = q.toLowerCase();
    staff = staff.filter(
      (s) =>
        s.name.toLowerCase().includes(qLower) ||
        s.title.toLowerCase().includes(qLower) ||
        s.department.toLowerCase().includes(qLower) ||
        (s.topics || []).some((t) => t.toLowerCase().includes(qLower))
    );
  }

  sendSuccess(res, staff);
});

// POST /staff - add staff to directory (manager+, §5.11)
router.post('/', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const body = req.body;
  if (!body.name || !body.email || !body.department) {
    sendError(res, 'VALIDATION_ERROR', 'name, email, and department are required.', 400);
    return;
  }

  const db = admin.firestore();
  const id = 'stf_' + Math.random().toString(36).substr(2, 9);
  const newStaff: Staff = {
    id,
    name: body.name,
    title: body.title || '',
    department: body.department,
    email: body.email,
    phone: body.phone || '',
    office: body.office || '',
    officeHours: body.officeHours || '',
    topics: body.topics || [],
    status: 'active',
  };

  await db.collection('staff').doc(id).set(newStaff);
  sendSuccess(res, newStaff, 201);
});

export default router;
