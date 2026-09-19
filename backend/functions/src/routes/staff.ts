import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Staff } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /staff - staff directory (§5.10)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { department, q } = req.query as Record<string, string>;
  const db = admin.firestore();

  try {
    let query: admin.firestore.Query = db.collection('staff').where('status', '==', 'active');
    if (department) query = query.where('department', '==', department);

    const snap = await query.orderBy('name', 'asc').get();
    let staffList = snap.docs.map((d) => d.data() as Staff);

    if (q) {
      const qLower = q.toLowerCase();
      staffList = staffList.filter(
        (s) =>
          s.name.toLowerCase().includes(qLower) ||
          s.title.toLowerCase().includes(qLower) ||
          s.department.toLowerCase().includes(qLower) ||
          s.topics.some((t) => t.toLowerCase().includes(qLower))
      );
    }

    return sendSuccess(res, staffList);
  } catch (err: any) {
    console.error('Error fetching staff:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch staff.', 500);
  }
});

// POST /staff - add staff (§5.10)
router.post('/', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const { name, title, department, email, phone, office, officeHours, topics = [] } = req.body;

  if (!name || !title || !department || !email) {
    return sendError(res, 'VALIDATION_ERROR', 'name, title, department, and email are required.', 400);
  }

  const db = admin.firestore();
  const staffId = `stf_${Date.now().toString(36)}`;

  const newStaff: Staff = {
    id: staffId,
    name,
    title,
    department,
    email,
    phone: phone || '',
    office: office || '',
    officeHours: officeHours || 'Mon–Fri 9:00–16:00',
    topics,
    status: 'active',
  };

  try {
    await db.collection('staff').doc(staffId).set(newStaff);
    return sendSuccess(res, newStaff, 201);
  } catch (err: any) {
    console.error('Error creating staff:', err);
    return sendError(res, 'INTERNAL', 'Failed to create staff member.', 500);
  }
});

// PATCH /staff/:id - edit staff member (§5.10)
router.patch('/:id', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const staffId = req.params.id;
  const updates = req.body;
  const db = admin.firestore();

  try {
    const staffRef = db.collection('staff').doc(staffId);
    await staffRef.update(updates);
    return sendSuccess(res, { id: staffId, ...updates });
  } catch (err: any) {
    console.error('Error updating staff:', err);
    return sendError(res, 'INTERNAL', 'Failed to update staff member.', 500);
  }
});

// DELETE /staff/:id - remove staff member (§5.10)
router.delete('/:id', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const staffId = req.params.id;
  const db = admin.firestore();

  try {
    await db.collection('staff').doc(staffId).delete();
    return sendSuccess(res, { id: staffId, deleted: true });
  } catch (err: any) {
    console.error('Error deleting staff:', err);
    return sendError(res, 'INTERNAL', 'Failed to delete staff member.', 500);
  }
});

export default router;
