import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Society, SocietyMember, MembershipStatus } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /societies - browse societies with viewer membership status (§5.8)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = admin.firestore();

  const snap = await db.collection('societies').where('status', '==', 'active').get();
  const societies = snap.docs.map((d) => d.data() as Society);

  // Hydrate membership for viewer
  const results: Society[] = [];
  for (const s of societies) {
    const memSnap = await db.collection('societyMembers').doc(`${s.id}_${user.id}`).get();
    let membership: MembershipStatus | null = null;
    if (memSnap.exists) {
      membership = memSnap.data()?.status || null;
    }
    results.push({
      ...s,
      viewer: { membership },
    });
  }

  sendSuccess(res, results);
});

// GET /societies/:id - get society details (§5.8)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const doc = await db.collection('societies').doc(id).get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    return;
  }

  const society = doc.data() as Society;
  const memSnap = await db.collection('societyMembers').doc(`${society.id}_${user.id}`).get();
  const membership = memSnap.exists ? memSnap.data()?.status : null;

  sendSuccess(res, {
    ...society,
    viewer: { membership },
  });
});

// PUT /societies/:id/membership - join or express interest in a society (§5.8)
router.put('/:id/membership', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const societyId = req.params.id;
  const { message = '' } = req.body as { message?: string };
  const db = admin.firestore();

  const socRef = db.collection('societies').doc(societyId);
  const socDoc = await socRef.get();
  if (!socDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    return;
  }

  const society = socDoc.data() as Society;
  let status: MembershipStatus = 'pending';
  if (society.joinMode === 'open') status = 'approved';
  else if (society.joinMode === 'interest_only') status = 'interested';

  const memberId = `${societyId}_${user.id}`;
  const memberRef = db.collection('societyMembers').doc(memberId);

  const memberRecord: SocietyMember = {
    id: memberId,
    societyId,
    uid: user.id,
    userName: user.displayName,
    status,
    message: message || null,
    createdAt: new Date().toISOString(),
    decidedAt: status === 'approved' ? new Date().toISOString() : null,
  };

  await memberRef.set(memberRecord, { merge: true });

  if (status === 'approved') {
    await socRef.update({
      memberCount: admin.firestore.FieldValue.increment(1),
    });
    // Add to user's societyIds
    await db.collection('users').doc(user.id).update({
      societyIds: admin.firestore.FieldValue.arrayUnion(societyId),
    });
  }

  sendSuccess(res, { societyId, status });
});

// DELETE /societies/:id/membership - leave society (§5.8)
router.delete('/:id/membership', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const societyId = req.params.id;
  const db = admin.firestore();

  const memberId = `${societyId}_${user.id}`;
  const memberRef = db.collection('societyMembers').doc(memberId);
  const memberDoc = await memberRef.get();

  if (memberDoc.exists) {
    const wasApproved = memberDoc.data()?.status === 'approved';
    await memberRef.delete();

    if (wasApproved) {
      await db.collection('societies').doc(societyId).update({
        memberCount: admin.firestore.FieldValue.increment(-1),
      });
      await db.collection('users').doc(user.id).update({
        societyIds: admin.firestore.FieldValue.arrayRemove(societyId),
      });
    }
  }

  sendSuccess(res, { societyId, status: null });
});

// GET /societies/:id/members - list pending or approved members for society reps (§5.8)
router.get('/:id/members', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const societyId = req.params.id;
  const { status = 'pending' } = req.query as { status?: string };
  const db = admin.firestore();

  const socDoc = await db.collection('societies').doc(societyId).get();
  if (!socDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    return;
  }

  const society = socDoc.data() as Society;
  const isRepOrAdmin =
    ['super_admin', 'admin', 'manager'].includes(user.role) ||
    society.presidentUid === user.id ||
    (society.repUids || []).includes(user.id);

  if (!isRepOrAdmin) {
    sendError(res, 'FORBIDDEN', 'Only society leaders can view member roster.', 403);
    return;
  }

  const membersSnap = await db
    .collection('societyMembers')
    .where('societyId', '==', societyId)
    .where('status', '==', status)
    .get();

  const members = membersSnap.docs.map((d) => d.data() as SocietyMember);
  sendSuccess(res, members);
});

// PATCH /societies/:id/members/:uid - approve or reject member request (§5.8)
router.patch('/:id/members/:targetUid', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id: societyId, targetUid } = req.params;
  const { status } = req.body as { status: 'approved' | 'rejected' };
  const db = admin.firestore();

  if (!['approved', 'rejected'].includes(status)) {
    sendError(res, 'VALIDATION_ERROR', "status must be 'approved' or 'rejected'.", 400);
    return;
  }

  const socRef = db.collection('societies').doc(societyId);
  const socDoc = await socRef.get();
  if (!socDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Society not found.', 404);
    return;
  }

  const society = socDoc.data() as Society;
  const isRepOrAdmin =
    ['super_admin', 'admin', 'manager'].includes(user.role) ||
    society.presidentUid === user.id ||
    (society.repUids || []).includes(user.id);

  if (!isRepOrAdmin) {
    sendError(res, 'FORBIDDEN', 'Only society leaders can approve/reject memberships.', 403);
    return;
  }

  const memberId = `${societyId}_${targetUid}`;
  const memberRef = db.collection('societyMembers').doc(memberId);
  const memberDoc = await memberRef.get();

  if (!memberDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Member request not found.', 404);
    return;
  }

  const nowUtc = new Date().toISOString();
  await memberRef.update({
    status,
    decidedAt: nowUtc,
  });

  if (status === 'approved') {
    await socRef.update({
      memberCount: admin.firestore.FieldValue.increment(1),
    });
    await db.collection('users').doc(targetUid).update({
      societyIds: admin.firestore.FieldValue.arrayUnion(societyId),
    });
  }

  // Fan out notification to applicant
  await db.collection('notifications').add({
    id: 'ntf_' + Math.random().toString(36).substr(2, 9),
    uid: targetUid,
    type: 'society',
    title: `Society Application ${status.toUpperCase()}`,
    body: `Your request to join ${society.name} has been ${status}.`,
    refType: 'society',
    refId: societyId,
    channels: ['inbox', 'push'],
    readAt: null,
    createdAt: nowUtc,
  });

  sendSuccess(res, { societyId, targetUid, status });
});

export default router;
