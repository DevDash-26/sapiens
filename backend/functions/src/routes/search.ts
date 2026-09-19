import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/envelope';
import { isContentVisibleToUser } from '../utils/targeting';
import { Content, ContentCard, Society, FAQ, Staff, Room } from '../types/contract';

const router = Router();
router.use(requireAuth);

function scoreText(query: string, text: string): number {
  if (!text) return 0;
  const q = query.toLowerCase().trim();
  const target = text.toLowerCase();

  if (target.includes(q)) return 1.0;

  const qTokens = q.split(/\s+/);
  let hits = 0;
  for (const token of qTokens) {
    if (token.length > 2 && target.includes(token)) {
      hits++;
    }
  }
  return hits / Math.max(1, qTokens.length);
}

// GET /search?q= - global grouped typo-tolerant search (BR1, §5.0, §6.7)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const q = (req.query.q as string || '').trim();
  const user = req.user!;
  const db = admin.firestore();

  if (!q) {
    sendSuccess(res, {
      contents: [],
      events: [],
      societies: [],
      faqs: [],
      staff: [],
      rooms: [],
    });
    return;
  }

  // Search Contents & Events
  const contentsSnap = await db.collection('contents').where('status', '==', 'published').limit(60).get();
  const allContents = contentsSnap.docs.map((d) => d.data() as Content);
  const visible = allContents.filter((c) => isContentVisibleToUser(c, user));

  const scoredContents = visible.map((c) => {
    const titleScore = scoreText(q, c.title) * 3;
    const tagScore = scoreText(q, (c.tags || []).join(' ')) * 2;
    const bodyScore = scoreText(q, c.summary + ' ' + c.body) * 1;
    return { item: c, score: titleScore + tagScore + bodyScore };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);

  const matchedEvents: ContentCard[] = scoredContents
    .filter((x) => ['event', 'guest_lecture'].includes(x.item.type))
    .slice(0, 5)
    .map((x) => ({
      id: x.item.id,
      type: x.item.type,
      category: x.item.category,
      title: x.item.title,
      summary: x.item.summary,
      imageUrl: x.item.imageUrl,
      priority: x.item.priority,
      pinned: x.item.pinned,
      startsAt: x.item.startsAt,
      endsAt: x.item.endsAt,
      allDay: x.item.allDay,
      venue: x.item.venue,
      origin: x.item.origin,
      societyId: x.item.societyId,
      interestedCount: x.item.interestedCount || 0,
      audience: x.item.audience,
      source: x.item.source,
      updatedAt: x.item.updatedAt,
      expiresAt: x.item.expiresAt,
      status: x.item.status,
      viewer: { interested: false, canEdit: false },
      shareUrl: `https://ucl-campus.netlify.app/c/${x.item.id}`,
    }));

  const matchedContents: ContentCard[] = scoredContents
    .filter((x) => !['event', 'guest_lecture'].includes(x.item.type))
    .slice(0, 5)
    .map((x) => ({
      id: x.item.id,
      type: x.item.type,
      category: x.item.category,
      title: x.item.title,
      summary: x.item.summary,
      imageUrl: x.item.imageUrl,
      priority: x.item.priority,
      pinned: x.item.pinned,
      startsAt: x.item.startsAt,
      endsAt: x.item.endsAt,
      allDay: x.item.allDay,
      venue: x.item.venue,
      origin: x.item.origin,
      societyId: x.item.societyId,
      interestedCount: x.item.interestedCount || 0,
      audience: x.item.audience,
      source: x.item.source,
      updatedAt: x.item.updatedAt,
      expiresAt: x.item.expiresAt,
      status: x.item.status,
      viewer: { interested: false, canEdit: false },
      shareUrl: `https://ucl-campus.netlify.app/c/${x.item.id}`,
    }));

  // Search Societies
  const socSnap = await db.collection('societies').where('status', '==', 'active').get();
  const societies: Society[] = socSnap.docs
    .map((d) => d.data() as Society)
    .map((s) => ({ s, score: scoreText(q, s.name + ' ' + s.description + ' ' + s.category) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.s);

  // Search FAQs
  const faqSnap = await db.collection('faqs').where('status', '==', 'published').get();
  const faqs: FAQ[] = faqSnap.docs
    .map((d) => d.data() as FAQ)
    .map((f) => ({
      f,
      score: scoreText(q, f.question) * 3 + scoreText(q, (f.keywords || []).join(' ')) * 2 + scoreText(q, f.answer) * 1,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.f);

  // Search Staff
  const staffSnap = await db.collection('staff').where('status', '==', 'active').get();
  const staff: Staff[] = staffSnap.docs
    .map((d) => d.data() as Staff)
    .map((s) => ({
      s,
      score: scoreText(q, s.name + ' ' + s.title + ' ' + s.department + ' ' + (s.topics || []).join(' ')),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.s);

  // Search Rooms
  const roomsSnap = await db.collection('rooms').where('status', '==', 'active').get();
  const rooms: Room[] = roomsSnap.docs
    .map((d) => d.data() as Room)
    .map((r) => ({
      r,
      score: scoreText(q, r.name + ' ' + r.building + ' ' + (r.features || []).join(' ')),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.r);

  sendSuccess(res, {
    contents: matchedContents,
    events: matchedEvents,
    societies,
    faqs,
    staff,
    rooms,
  });
});

export default router;
