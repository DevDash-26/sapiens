import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { isContentVisibleToUser } from '../utils/targeting';
import { Content, ContentCard, ContentStatus, Role } from '../types/contract';

const router = Router();
router.use(requireAuth);

function toContentCard(c: Content, userId: string): ContentCard {
  return {
    id: c.id,
    type: c.type,
    category: c.category,
    title: c.title,
    summary: c.summary,
    imageUrl: c.imageUrl,
    priority: c.priority,
    pinned: c.pinned,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    allDay: c.allDay,
    venue: c.venue,
    origin: c.origin,
    societyId: c.societyId,
    interestedCount: c.interestedCount || 0,
    audience: c.audience,
    source: c.source,
    updatedAt: c.updatedAt,
    expiresAt: c.expiresAt,
    status: c.status,
    viewer: {
      interested: false,
      canEdit: c.author?.uid === userId,
    },
    shareUrl: `https://ucl-campus.netlify.app/c/${c.id}`,
  };
}

// GET /contents - filtered list of card projections (§5.2)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { type, category, status, mine, q, limit = '20' } = req.query as Record<string, string>;
  const db = admin.firestore();
  const maxLimit = Math.min(parseInt(limit, 10) || 20, 50);

  let query: admin.firestore.Query = db.collection('contents');

  if (mine === 'true') {
    query = query.where('author.uid', '==', user.id);
  } else {
    // Non-staff callers always get status=published
    const isStaffOrAdmin = ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff'].includes(user.role);
    if (!isStaffOrAdmin || !status) {
      query = query.where('status', '==', 'published');
    } else if (status) {
      query = query.where('status', '==', status);
    }
  }

  if (type) query = query.where('type', '==', type);
  if (category) query = query.where('category', '==', category);

  const snapshot = await query.limit(100).get();
  let contents = snapshot.docs.map((d) => d.data() as Content);

  // Apply server-side visibility filter
  contents = contents.filter((c) => isContentVisibleToUser(c, user));

  if (q) {
    const qLower = q.toLowerCase();
    contents = contents.filter(
      (c) =>
        c.title.toLowerCase().includes(qLower) ||
        c.summary.toLowerCase().includes(qLower) ||
        (c.tags || []).some((t) => t.toLowerCase().includes(qLower))
    );
  }

  const cards: ContentCard[] = contents.slice(0, maxLimit).map((c) => toContentCard(c, user.id));

  sendSuccess(res, cards, 200, {
    count: cards.length,
    nextCursor: cards.length === maxLimit ? cards[cards.length - 1].id : null,
  });
});

// GET /contents/moderation/queue - pending review queue (§5.0 #15)
router.get('/moderation/queue', requireRole(['super_admin', 'admin', 'manager']), async (_req: AuthenticatedRequest, res: Response) => {
  const db = admin.firestore();
  const snap = await db.collection('contents').where('status', '==', 'pending_review').orderBy('createdAt', 'desc').get();
  const pending = snap.docs.map((d) => d.data() as Content);
  sendSuccess(res, pending);
});

// GET /contents/:id - full detail with viewer & shareUrl (§5.3)
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const doc = await admin.firestore().collection('contents').doc(id).get();

  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Content not found.', 404);
    return;
  }

  const content = doc.data() as Content;

  if (!isContentVisibleToUser(content, user) && content.author?.uid !== user.id) {
    sendError(res, 'NOT_FOUND', 'Content not found.', 404);
    return;
  }

  const result: Content = {
    ...content,
    viewer: {
      interested: false,
      canEdit: content.author?.uid === user.id || ['super_admin', 'admin'].includes(user.role),
    },
    shareUrl: `https://ucl-campus.netlify.app/c/${content.id}`,
  };

  sendSuccess(res, result);
});

// POST /contents - Create content (§5.4)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const body = req.body;
  const db = admin.firestore();

  // Student cannot create content (§3.2)
  if (user.role === 'student') {
    sendError(res, 'FORBIDDEN', 'Students cannot publish content. Submit a request instead.', 403);
    return;
  }

  // Validate field constraints (§5.4)
  if (!body.title || body.title.length < 3 || body.title.length > 120) {
    sendError(res, 'VALIDATION_ERROR', 'Title must be between 3 and 120 characters.', 400);
    return;
  }
  if (body.summary && body.summary.length > 160) {
    sendError(res, 'VALIDATION_ERROR', 'Summary cannot exceed 160 characters.', 400);
    return;
  }
  if (body.body && body.body.length > 5000) {
    sendError(res, 'VALIDATION_ERROR', 'Body cannot exceed 5000 characters.', 400);
    return;
  }
  if (body.startsAt && body.endsAt && new Date(body.endsAt) <= new Date(body.startsAt)) {
    sendError(res, 'VALIDATION_ERROR', 'endsAt must be after startsAt.', 400);
    return;
  }

  // Object-level ownership & role permissions (§3.2)
  if (user.role === 'academic_staff' && body.type === 'announcement' && user.faculty) {
    if (body.audience?.faculties?.length > 0 && !body.audience.faculties.every((f: string) => f === user.faculty)) {
      sendError(res, 'FORBIDDEN', `Academic staff in ${user.faculty} can only target their own faculty.`, 403);
      return;
    }
  }

  if (user.role === 'society_rep') {
    if (!body.societyId || !(user.societyIds || []).includes(body.societyId)) {
      sendError(res, 'FORBIDDEN', 'Society Rep can only submit content for their own society.', 403);
      return;
    }
  }

  if (user.role === 'finance_staff') {
    const isAllowedFinance =
      (body.type === 'announcement' && body.category === 'finance') ||
      (body.type === 'calendar' && body.category === 'deadline') ||
      (body.type === 'info' && body.category === 'finance_aid');
    if (!isAllowedFinance) {
      sendError(res, 'FORBIDDEN', 'Finance staff may only publish finance announcements, deadlines, and financial aid info.', 403);
      return;
    }
  }

  // Determine review status according to §3.2
  let targetStatus: ContentStatus = 'published';
  let verified = true;
  let origin = 'official';

  if (user.role === 'society_rep' || user.role === 'alumni') {
    targetStatus = 'pending_review';
    verified = false;
    origin = 'student';
  }

  const id = 'cnt_' + Math.random().toString(36).substr(2, 9);
  const nowUtc = new Date().toISOString();

  const newContent: Content = {
    id,
    type: body.type,
    category: body.category,
    title: body.title,
    summary: body.summary || '',
    body: body.body || '',
    imageUrl: body.imageUrl || null,
    tags: body.tags || [],
    audience: body.audience || { all: true, faculties: [], programmes: [], years: [] },
    priority: body.priority || 'normal',
    pinned: body.pinned && ['super_admin', 'admin', 'manager'].includes(user.role) ? true : false,
    status: targetStatus,
    publishAt: body.publishAt || (targetStatus === 'published' ? nowUtc : null),
    expiresAt: body.expiresAt || null,
    startsAt: body.startsAt || null,
    endsAt: body.endsAt || null,
    allDay: body.allDay || false,
    venue: body.venue || null,
    origin: (origin as any),
    societyId: body.societyId || null,
    capacity: body.capacity || null,
    interestedCount: 0,
    link: body.link || null,
    details: body.details || {},
    author: {
      uid: user.id,
      name: user.displayName,
      role: user.role,
    },
    source: {
      department: user.department || user.displayName,
      verified,
    },
    flags: { affectedByAlertId: null },
    review: { reviewedBy: null, reviewedAt: null, reason: null },
    version: 1,
    createdAt: nowUtc,
    updatedAt: nowUtc,
  };

  await db.collection('contents').doc(id).set(newContent);

  // Write audit log
  await db.collection('auditLogs').add({
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    actorUid: user.id,
    actorRole: user.role,
    action: 'content.create',
    entity: 'contents',
    entityId: id,
    summary: `Created content '${newContent.title}' (${targetStatus})`,
    ip: req.ip || null,
    at: nowUtc,
  });

  sendSuccess(res, newContent, 201);
});

// PATCH /contents/:id - Edit content (§5.4)
router.patch('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const ref = db.collection('contents').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Content not found.', 404);
    return;
  }

  const existing = doc.data() as Content;
  const canEdit = existing.author.uid === user.id || ['super_admin', 'admin', 'manager'].includes(user.role);
  if (!canEdit) {
    sendError(res, 'FORBIDDEN', 'You do not have permission to edit this content.', 403);
    return;
  }

  const nowUtc = new Date().toISOString();
  const updates = {
    ...req.body,
    updatedAt: nowUtc,
    version: (existing.version || 1) + 1,
  };
  delete updates.id;
  delete updates.type;
  delete updates.author;
  delete updates.source;

  await ref.update(updates);
  const updatedDoc = await ref.get();
  sendSuccess(res, updatedDoc.data() as Content);
});

// POST /contents/:id/transition - submit, approve, reject, publish, cancel, archive (§5.4)
router.post('/:id/transition', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const { action, reason } = req.body as { action: string; reason?: string };
  const db = admin.firestore();

  const ref = db.collection('contents').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Content not found.', 404);
    return;
  }

  const content = doc.data() as Content;
  const isManager = ['super_admin', 'admin', 'manager'].includes(user.role);
  const nowUtc = new Date().toISOString();

  let nextStatus: ContentStatus = content.status;

  if (action === 'approve') {
    if (!isManager) {
      sendError(res, 'FORBIDDEN', 'Only managers or admins can approve content.', 403);
      return;
    }
    nextStatus = 'published';
  } else if (action === 'reject') {
    if (!isManager) {
      sendError(res, 'FORBIDDEN', 'Only managers or admins can reject content.', 403);
      return;
    }
    nextStatus = 'rejected';
  } else if (action === 'cancel') {
    if (!isManager && content.author.uid !== user.id) {
      sendError(res, 'FORBIDDEN', 'Cannot cancel content.', 403);
      return;
    }
    nextStatus = 'cancelled';
  } else if (action === 'archive') {
    nextStatus = 'archived';
  } else {
    sendError(res, 'VALIDATION_ERROR', `Invalid transition action '${action}'`, 400);
    return;
  }

  await ref.update({
    status: nextStatus,
    updatedAt: nowUtc,
    'review.reviewedBy': user.id,
    'review.reviewedAt': nowUtc,
    'review.reason': reason || null,
  });

  // Audit log
  await db.collection('auditLogs').add({
    id: 'aud_' + Math.random().toString(36).substr(2, 9),
    actorUid: user.id,
    actorRole: user.role,
    action: `content.${action}`,
    entity: 'contents',
    entityId: id,
    summary: `Transitioned '${content.title}' to ${nextStatus}`,
    ip: req.ip || null,
    at: nowUtc,
  });

  const updatedDoc = await ref.get();
  sendSuccess(res, updatedDoc.data() as Content);
});

// DELETE /contents/:id - soft delete to archived (§5.4)
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const id = req.params.id;
  const db = admin.firestore();

  const ref = db.collection('contents').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'Content not found.', 404);
    return;
  }

  const content = doc.data() as Content;
  if (content.author.uid !== user.id && !['super_admin', 'admin'].includes(user.role)) {
    sendError(res, 'FORBIDDEN', 'You do not have permission to delete this content.', 403);
    return;
  }

  await ref.update({ status: 'archived', updatedAt: new Date().toISOString() });
  sendSuccess(res, { archived: true, id });
});

export default router;
