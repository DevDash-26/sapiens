import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Society, SocietyMember } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /societies - list societies (§5.8)
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  try {
    const snap = await db.collection('societies').where('status', '==', 'active').get();
    const societies = snap.docs.map((d) => d.data() as Society);
    return sendSuccess(res, societies);
  } catch (err: any) {
    console.error('Error fetching societies:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch societies.', 500);
  }
});

// GET /societies/:id - society detail (§5.8)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  try {
    const doc = await db.collection('societies').doc(req.params.id).get();
    if (!doc.exists) {
      return sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    }
    return sendSuccess(res, doc.data());
  } catch (err: any) {
    console.error('Error fetching society:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch society.', 500);
  }
});

// POST /societies/:id/members - join or apply (§5.8)
router.post('/:id/members', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const societyId = req.params.id;
  const { message } = req.body || {};
  const db = admin.firestore();

  try {
    const socDoc = await db.collection('societies').doc(societyId).get();
    if (!socDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    }
    const society = socDoc.data() as Society;
    const memberDocId = `${societyId}_${user.id}`;
    const now = new Date().toISOString();

    const memberStatus = society.joinMode === 'open' ? 'approved' : 'pending';
    const memberRecord: SocietyMember = {
      id: memberDocId,
      societyId,
      uid: user.id,
      userName: user.displayName || 'Student',
      status: memberStatus,
      message: message || '',
      createdAt: now,
      decidedAt: memberStatus === 'approved' ? now : null,
    };

    await db.collection('societyMembers').doc(memberDocId).set(memberRecord);

    if (memberStatus === 'approved') {
      await db.collection('societies').doc(societyId).update({
        memberCount: admin.firestore.FieldValue.increment(1),
      });
    }

    return sendSuccess(res, memberRecord, 201);
  } catch (err: any) {
    console.error('Error joining society:', err);
    return sendError(res, 'INTERNAL', 'Failed to join society.', 500);
  }
});

// PATCH /societies/:id - edit society (§5.8)
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const societyId = req.params.id;
  const updates = req.body;
  const db = admin.firestore();

  try {
    const socRef = db.collection('societies').doc(societyId);
    const socDoc = await socRef.get();
    if (!socDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    }

    const society = socDoc.data() as Society;
    const isRep = society.repUids?.includes(user.id) || society.presidentUid === user.id;
    const isAdmin = ['super_admin', 'admin', 'manager'].includes(user.role);

    if (!isRep && !isAdmin) {
      return sendError(res, 'FORBIDDEN', 'Only society representatives can edit this profile.', 403);
    }

    const now = new Date().toISOString();
    await socRef.update({
      ...updates,
      updatedAt: now,
    });

    return sendSuccess(res, { id: societyId, ...updates, updatedAt: now });
  } catch (err: any) {
    console.error('Error updating society:', err);
    return sendError(res, 'INTERNAL', 'Failed to update society.', 500);
  }
});

export default router;
