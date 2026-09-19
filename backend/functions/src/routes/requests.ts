import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { Request, RequestType, RequestStatus, Claim } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /requests - list requests (§5.6)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { type, status, mine, limit = '50' } = req.query as Record<string, string>;
  const db = admin.firestore();

  try {
    let query: admin.firestore.Query = db.collection('requests');

    if (type) query = query.where('type', '==', type);
    if (status) query = query.where('status', '==', status);

    const isStaffOrAdmin = ['super_admin', 'admin', 'manager', 'academic_staff'].includes(user.role);

    if (mine === 'true' || !isStaffOrAdmin) {
      // Non-staff only see their own private requests or public items
      if (mine === 'true') {
        query = query.where('ownerUid', '==', user.id);
      }
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(parseInt(limit, 10) || 50).get();
    let requests = snapshot.docs.map((d) => d.data() as Request);

    if (!isStaffOrAdmin && mine !== 'true') {
      // Filter out private requests owned by others
      requests = requests.filter((r) => r.visibility === 'public' || r.ownerUid === user.id);
    }

    // Obfuscate verification hints for non-staff and non-owners
    requests = requests.map((r) => {
      if (r.type === 'found' && !isStaffOrAdmin && r.ownerUid !== user.id) {
        return { ...r, verificationHint: null };
      }
      return r;
    });

    return sendSuccess(res, requests);
  } catch (err: any) {
    console.error('Error fetching requests:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch requests.', 500);
  }
});

// GET /requests/:id - request detail (§5.6)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  try {
    const doc = await db.collection('requests').doc(id).get();
    if (!doc.exists) {
      return sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    }

    const reqData = doc.data() as Request;
    const isStaff = ['super_admin', 'admin', 'manager', 'academic_staff'].includes(user.role);

    if (reqData.visibility === 'private' && reqData.ownerUid !== user.id && !isStaff) {
      return sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    }

    if (reqData.type === 'found' && !isStaff && reqData.ownerUid !== user.id) {
      reqData.verificationHint = null;
    }

    return sendSuccess(res, reqData);
  } catch (err: any) {
    console.error('Error fetching request detail:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch request detail.', 500);
  }
});

// POST /requests - create request (§5.6)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const {
    type,
    title,
    description,
    imageUrls = [],
    location = null,
    occurredAt = null,
    data = {},
    verificationHint = null,
    visibility = 'public',
  } = req.body;

  if (!type || !title || !description) {
    return sendError(res, 'VALIDATION_ERROR', 'type, title, and description are required.', 400);
  }

  const db = admin.firestore();
  const requestId = `req_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  // Found items require private verification hint per §4.5
  if (type === 'found' && !verificationHint) {
    return sendError(res, 'VALIDATION_ERROR', 'verificationHint is required for found items.', 400);
  }

  const newRequest: Request = {
    id: requestId,
    type: type as RequestType,
    status: 'open',
    visibility: ['facility_issue', 'feedback', 'academic_support'].includes(type) ? 'private' : visibility,
    title,
    description,
    imageUrls,
    location,
    occurredAt: occurredAt || now,
    data,
    verificationHint: verificationHint || null,
    handoverNote: null,
    ownerUid: user.id,
    ownerName: user.displayName || 'Student',
    assigneeUid: null,
    resolution: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
  };

  try {
    await db.collection('requests').doc(requestId).set(newRequest);
    return sendSuccess(res, newRequest, 201);
  } catch (err: any) {
    console.error('Error creating request:', err);
    return sendError(res, 'INTERNAL', 'Failed to create request.', 500);
  }
});

// PATCH /requests/:id - update request status/assignee (§5.6)
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const { status, assigneeUid, resolution, handoverNote } = req.body;
  const db = admin.firestore();

  try {
    const docRef = db.collection('requests').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    }

    const current = doc.data() as Request;
    const isStaff = ['super_admin', 'admin', 'manager', 'academic_staff'].includes(user.role);

    // Only owner or staff can edit
    if (current.ownerUid !== user.id && !isStaff) {
      return sendError(res, 'FORBIDDEN', 'Cannot modify requests owned by another user.', 403);
    }

    const now = new Date().toISOString();
    const updates: Partial<Request> = {
      updatedAt: now,
    };

    if (status) {
      updates.status = status;
      if (status === 'resolved' || status === 'closed') {
        updates.resolvedAt = now;
      }
    }
    if (assigneeUid !== undefined && isStaff) updates.assigneeUid = assigneeUid;
    if (resolution !== undefined) updates.resolution = resolution;
    if (handoverNote !== undefined) updates.handoverNote = handoverNote;

    await docRef.update(updates);
    const updated = { ...current, ...updates };
    return sendSuccess(res, updated);
  } catch (err: any) {
    console.error('Error updating request:', err);
    return sendError(res, 'INTERNAL', 'Failed to update request.', 500);
  }
});

// POST /requests/:id/claims - submit a claim for a found item (§5.6)
router.post('/:id/claims', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const requestId = req.params.id;
  const { answer, message } = req.body;

  if (!answer) {
    return sendError(res, 'VALIDATION_ERROR', 'answer is required.', 400);
  }

  const db = admin.firestore();
  try {
    const reqDoc = await db.collection('requests').doc(requestId).get();
    if (!reqDoc.exists) {
      return sendError(res, 'NOT_FOUND', 'Request not found.', 404);
    }

    const claimId = `clm_${Date.now().toString(36)}`;
    const now = new Date().toISOString();
    const newClaim: Claim = {
      id: claimId,
      requestId,
      claimantUid: user.id,
      claimantName: user.displayName || 'Student',
      answer,
      message: message || '',
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      createdAt: now,
    };

    await db.collection('claims').doc(claimId).set(newClaim);
    return sendSuccess(res, newClaim, 201);
  } catch (err: any) {
    console.error('Error submitting claim:', err);
    return sendError(res, 'INTERNAL', 'Failed to submit claim.', 500);
  }
});

export default router;
