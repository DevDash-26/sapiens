import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { FAQ } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /faqs - list or search FAQs (§5.11)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { category, q } = req.query as Record<string, string>;
  const db = admin.firestore();

  let query: admin.firestore.Query = db.collection('faqs').where('status', '==', 'published');
  if (category) query = query.where('category', '==', category);

  const snap = await query.get();
  let faqs = snap.docs.map((d) => d.data() as FAQ);

  if (q) {
    const qLower = q.toLowerCase();
    faqs = faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(qLower) ||
        f.answer.toLowerCase().includes(qLower) ||
        (f.keywords || []).some((k) => k.toLowerCase().includes(qLower))
    );
  } else {
    faqs.sort((a, b) => a.order - b.order);
  }

  sendSuccess(res, faqs);
});

// POST /faqs/:id/feedback - helpful or unhelpful feedback (§5.11)
router.post('/:id/feedback', async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { helpful } = req.body as { helpful: boolean };
  const db = admin.firestore();

  const ref = db.collection('faqs').doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    sendError(res, 'NOT_FOUND', 'FAQ not found.', 404);
    return;
  }

  const updateField = helpful ? 'helpfulCount' : 'unhelpfulCount';
  await ref.update({
    [updateField]: admin.firestore.FieldValue.increment(1),
  });

  const updated = (await ref.get()).data() as FAQ;
  sendSuccess(res, { helpfulCount: updated.helpfulCount, unhelpfulCount: updated.unhelpfulCount });
});

// POST /faqs - create FAQ (manager+, §5.11)
router.post('/', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const { question, answer, category, keywords = [] } = req.body;
  if (!question || !answer || !category) {
    sendError(res, 'VALIDATION_ERROR', 'question, answer, and category are required.', 400);
    return;
  }

  const db = admin.firestore();
  const id = 'faq_' + Math.random().toString(36).substr(2, 9);
  const newFaq: FAQ = {
    id,
    question,
    answer,
    category,
    keywords,
    order: 1,
    status: 'published',
    helpfulCount: 0,
    unhelpfulCount: 0,
    source: { department: req.user?.department || 'Academic Affairs', verified: true },
    updatedAt: new Date().toISOString(),
  };

  await db.collection('faqs').doc(id).set(newFaq);
  sendSuccess(res, newFaq, 201);
});

export default router;
