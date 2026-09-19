import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Request, Claim } from '../types/contract';

const router = Router();
router.use(requireAuth);

function sanitizeRequestForViewer(reqItem: Request, userId: string, isManager: boolean): Request {
  // Section 4.5 & §3.1: verificationHint and handoverNote are visible only to owner and manager+
  if (reqItem.ownerUid !== userId && !isManager) {
    return {
      ...reqItem,
      verificationHint: null,
      handoverNote: null,
    };
  }
  return reqItem;
}

// GET /requests - list requests (§5.9)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { type, mine, status } = req.query as Record<string, string>;
  const db = admin.firestore();
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);

  let query: admin.firestore.Query = db.collection('requests');

  if (mine === 'true') {
    query = query.where('ownerUid', '==', user.id);
  } else {
    // If not "mine", public only or handler roles
    if (!isManager) {
      query = query.where('visibility', '==', 'public');
    }
  }

  if (type) query = query.where('type', '==', type);
  if (status) query = query.where('status', '==', status);

  const snap = await query.limit(50).get();
  const requests = snap.docs.map((d) => sanitizeRequestForViewer(d.data() as Request, user.id, isManager));

  sendSuccess(res, requests);
});

// POST /requests - create lost/found/textbook/facility_issue/feedback (§5.9)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body;
  const db = admin.firestore();

  if (!body.type || !body.title) {
    sendError(res, 'VALIDATION_ERROR', 'type and title are required.', 400);
    return;
  }

  // Found items require a verification hint (§4.5)
  if (body.type === 'found' && (!body.verificationHint || body.verificationHint.trim().length === 0)) {
    sendError(res, 'VALIDATION_ERROR', 'verificationHint is required for found items to protect private ownership details.', 400);
    return;
  }

  const id = 'req_' + Math.random().toString(36).substr(2, 9);
  const nowUtc = new Date().toISOString();

  // Private types: facility_issue, academic_support, feedback (§4.5)
  const isPrivate = ['facility_issue', 'academic_support', 'feedback'].includes(body.type);

  const newRequest: Request = {
    id,
    type: body.type,
    status: 'open',
    visibility: isPrivate ? 'private' : 'public',
    title: body.title,
    description: body.description || '',
    imageUrls: body.imageUrls || [],
    location: body.location || null,
    occurredAt: body.occurredAt || null,
    data: body.data || {},
    verificationHint: body.verificationHint || null,
    handoverNote: body.handoverNote || null,
    ownerUid: user.id,
    ownerName: user.displayName,
    assigneeUid: null,
    resolution: null,
    createdAt: nowUtc,
    updatedAt: nowUtc,
    resolvedAt: null,
  };

  await db.collection('requests').doc(id).set(newRequest);
  sendSuccess(res, newRequest, 201);
});

// GET /requests/:id - get request detail (§5.9)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const doc = await db.collection('requests').doc(id).get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    return;
  }

  const reqItem = doc.data() as Request;
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);

  if (reqItem.visibility === 'private' && reqItem.ownerUid !== user.id && !isManager) {
    sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    return;
  }

  sendSuccess(res, sanitizeRequestForViewer(reqItem, user.id, isManager));
});

// PATCH /requests/:id - update status, assignee, resolution (§5.9)
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const { status, resolution, assigneeUid } = req.body as { status?: string; resolution?: string; assigneeUid?: string };
  const db = admin.firestore();

  const ref = db.collection('requests').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    return;
  }

  const reqItem = doc.data() as Request;
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);
  if (reqItem.ownerUid !== user.id && !isManager) {
    sendError(res, 'FORBIDDEN', 'You do not have permission to modify this request.', 403);
    return;
  }

  const nowUtc = new Date().toISOString();
  const updates: Record<string, any> = { updatedAt: nowUtc };

  if (status) {
    updates.status = status;
    if (['resolved', 'closed'].includes(status)) {
      updates.resolvedAt = nowUtc;
    }
  }
  if (resolution) updates.resolution = resolution;
  if (assigneeUid !== undefined) updates.assigneeUid = assigneeUid;

  await ref.update(updates);
  const updatedDoc = await ref.get();
  sendSuccess(res, sanitizeRequestForViewer(updatedDoc.data() as Request, user.id, isManager));
});

// GET /requests/:id/matches - Lost & Found match algorithm (§6.6)
router.get('/:id/matches', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const doc = await db.collection('requests').doc(id).get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    return;
  }

  const target = doc.data() as Request;
  if (!['lost', 'found'].includes(target.type)) {
    sendSuccess(res, []);
    return;
  }

  const isLost = target.type === 'lost';
  const matchType = isLost ? 'found' : 'lost';

  const candidatesSnap = await db
    .collection('requests')
    .where('type', '==', matchType)
    .where('status', '==', 'open')
    .limit(30)
    .get();

  const matches: any[] = [];

  for (const cDoc of candidatesSnap.docs) {
    const candidate = cDoc.data() as Request;
    let score = 0;
    const reasons: string[] = [];

    // Category match: 0.35
    if (target.data?.itemCategory && target.data?.itemCategory === candidate.data?.itemCategory) {
      score += 0.35;
      reasons.push('same itemCategory');
    }

    // Color match: 0.15
    if (target.data?.color && target.data?.color === candidate.data?.color) {
      score += 0.15;
      reasons.push('color match');
    }

    // Brand match: 0.15
    if (target.data?.brand && target.data?.brand === candidate.data?.brand) {
      score += 0.15;
      reasons.push('brand match');
    }

    // Location keyword overlap: 0.10
    if (target.location && candidate.location && target.location.toLowerCase().includes(candidate.location.toLowerCase().split(' ')[0])) {
      score += 0.10;
      reasons.push('location proximity');
    }

    if (score >= 0.35) {
      matches.push({
        request: sanitizeRequestForViewer(candidate, user.id, false),
        score: Math.min(1.0, parseFloat(score.toFixed(2))),
        reasons,
      });
    }
  }

  matches.sort((a, b) => b.score - a.score);
  sendSuccess(res, matches.slice(0, 5));
});

// POST /requests/:id/claims - claim an item (§5.9)
router.post('/:id/claims', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const requestId = req.params.id;
  const { answer, message } = req.body as { answer: string; message: string };
  const db = admin.firestore();

  const reqDoc = await db.collection('requests').doc(requestId).get();
  if (!reqDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Item request not found.', 404);
    return;
  }

  // One pending claim per user per item (§5.9)
  const existingClaimSnap = await db
    .collection('claims')
    .where('requestId', '==', requestId)
    .where('claimantUid', '==', user.id)
    .where('status', '==', 'pending')
    .get();

  if (!existingClaimSnap.empty) {
    sendError(res, 'CONFLICT', 'You already have an active pending claim for this item.', 409);
    return;
  }

  const claimId = 'clm_' + Math.random().toString(36).substr(2, 9);
  const newClaim: Claim = {
    id: claimId,
    requestId,
    claimantUid: user.id,
    claimantName: user.displayName,
    answer: answer || '',
    message: message || '',
    status: 'pending',
    decidedBy: null,
    decidedAt: null,
    createdAt: new Date().toISOString(),
  };

  await db.collection('claims').doc(claimId).set(newClaim);
  sendSuccess(res, newClaim, 201);
});

// GET /requests/:id/claims - see claims for an item (§5.9)
router.get('/:id/claims', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const requestId = req.params.id;
  const db = admin.firestore();

  const reqDoc = await db.collection('requests').doc(requestId).get();
  if (!reqDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Item not found.', 404);
    return;
  }

  const item = reqDoc.data() as Request;
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);
  if (item.ownerUid !== user.id && !isManager) {
    sendError(res, 'FORBIDDEN', 'Only the item owner or managers can review claims.', 403);
    return;
  }

  const snap = await db.collection('claims').where('requestId', '==', requestId).get();
  const claims = snap.docs.map((d) => d.data() as Claim);
  sendSuccess(res, claims);
});

// POST /requests/:id/claims/:claimId/decision - approve or reject claim (§5.9)
router.post('/:id/claims/:claimId/decision', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { id: requestId, claimId } = req.params;
  const { decision, handoverNote } = req.body as { decision: 'approve' | 'reject'; handoverNote?: string };
  const db = admin.firestore();

  const reqDoc = await db.collection('requests').doc(requestId).get();
  if (!reqDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Item not found.', 404);
    return;
  }

  const item = reqDoc.data() as Request;
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);
  if (item.ownerUid !== user.id && !isManager) {
    sendError(res, 'FORBIDDEN', 'Only the item owner or managers can decide on claims.', 403);
    return;
  }

  const claimRef = db.collection('claims').doc(claimId);
  const claimDoc = await claimRef.get();
  if (!claimDoc.exists) {
    sendError(res, 'NOT_FOUND', 'Claim not found.', 404);
    return;
  }

  const nowUtc = new Date().toISOString();
  await claimRef.update({
    status: decision === 'approve' ? 'approved' : 'rejected',
    decidedBy: user.id,
    decidedAt: nowUtc,
  });

  if (decision === 'approve') {
    await db.collection('requests').doc(requestId).update({
      status: 'resolved',
      handoverNote: handoverNote || null,
      resolvedAt: nowUtc,
    });

    // Auto-reject other pending claims on this item (§5.9)
    const otherClaimsSnap = await db
      .collection('claims')
      .where('requestId', '==', requestId)
      .where('status', '==', 'pending')
      .get();

    const rejectBatch = db.batch();
    for (const oDoc of otherClaimsSnap.docs) {
      if (oDoc.id !== claimId) {
        rejectBatch.update(oDoc.ref, {
          status: 'rejected',
          decidedBy: user.id,
          decidedAt: nowUtc,
        });
      }
    }
    await rejectBatch.commit();
  }

  sendSuccess(res, { claimId, decision, handoverNote });
});

export default router;
