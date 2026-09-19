import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth, requireRole } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { FAQ } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /faqs - list FAQs (§5.9)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const { category, q } = req.query as Record<string, string>;
  const db = admin.firestore();

  try {
    let query: admin.firestore.Query = db.collection('faqs').where('status', '==', 'published');
    if (category) query = query.where('category', '==', category);

    const snap = await query.orderBy('order', 'asc').get();
    let faqs = snap.docs.map((d) => d.data() as FAQ);

    if (q) {
      const qLower = q.toLowerCase();
      faqs = faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(qLower) ||
          f.answer.toLowerCase().includes(qLower) ||
          f.keywords.some((k) => k.toLowerCase().includes(qLower))
      );
    }

    return sendSuccess(res, faqs);
  } catch (err: any) {
    console.error('Error fetching FAQs:', err);
    return sendError(res, 'INTERNAL', 'Failed to fetch FAQs.', 500);
  }
});

// POST /faqs - create FAQ (§5.9)
router.post('/', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const { question, answer, category, keywords = [] } = req.body;

  if (!question || !answer || !category) {
    return sendError(res, 'VALIDATION_ERROR', 'question, answer, and category are required.', 400);
  }

  const db = admin.firestore();
  const faqId = `faq_${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newFAQ: FAQ = {
    id: faqId,
    question,
    answer,
    category,
    keywords,
    order: 99,
    status: 'published',
    helpfulCount: 0,
    unhelpfulCount: 0,
    source: { department: 'Academic Affairs', verified: true },
    updatedAt: now,
  };

  try {
    await db.collection('faqs').doc(faqId).set(newFAQ);
    return sendSuccess(res, newFAQ, 201);
  } catch (err: any) {
    console.error('Error creating FAQ:', err);
    return sendError(res, 'INTERNAL', 'Failed to create FAQ.', 500);
  }
});

// PATCH /faqs/:id - edit FAQ (§5.9)
router.patch('/:id', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const faqId = req.params.id;
  const updates = req.body;
  const db = admin.firestore();

  try {
    const faqRef = db.collection('faqs').doc(faqId);
    const now = new Date().toISOString();
    await faqRef.update({ ...updates, updatedAt: now });
    return sendSuccess(res, { id: faqId, ...updates, updatedAt: now });
  } catch (err: any) {
    console.error('Error updating FAQ:', err);
    return sendError(res, 'INTERNAL', 'Failed to update FAQ.', 500);
  }
});

// DELETE /faqs/:id - delete FAQ (§5.9)
router.delete('/:id', requireRole(['super_admin', 'admin', 'manager']), async (req: AuthenticatedRequest, res: Response) => {
  const faqId = req.params.id;
  const db = admin.firestore();

  try {
    await db.collection('faqs').doc(faqId).delete();
    return sendSuccess(res, { id: faqId, deleted: true });
  } catch (err: any) {
    console.error('Error deleting FAQ:', err);
    return sendError(res, 'INTERNAL', 'Failed to delete FAQ.', 500);
  }
});

// POST /faqs/:id/vote - feedback vote (§5.9)
router.post('/:id/vote', async (req: AuthenticatedRequest, res: Response) => {
  const faqId = req.params.id;
  const { helpful } = req.body;

  const db = admin.firestore();
  try {
    const faqRef = db.collection('faqs').doc(faqId);
    const field = helpful ? 'helpfulCount' : 'unhelpfulCount';
    await faqRef.update({
      [field]: admin.firestore.FieldValue.increment(1),
    });
    return sendSuccess(res, { id: faqId, voted: true });
  } catch (err: any) {
    console.error('Error voting FAQ:', err);
    return sendError(res, 'INTERNAL', 'Failed to vote FAQ.', 500);
  }
});

export default router;
