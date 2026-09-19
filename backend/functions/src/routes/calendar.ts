import { Router, Response } from 'express';
import * as admin from 'firebase-admin';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess } from '../utils/envelope';
import { isContentVisibleToUser } from '../utils/targeting';
import { Content } from '../types/contract';

const router = Router();
router.use(requireAuth);

// GET /calendar - merged calendar, events, holidays (§5.6)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = admin.firestore();

  const snap = await db.collection('contents').where('status', '==', 'published').get();
  const allContents = snap.docs.map((d) => d.data() as Content);

  const calendarItems = allContents
    .filter((c) => isContentVisibleToUser(c, user))
    .filter((c) => ['calendar', 'event', 'guest_lecture'].includes(c.type) && c.startsAt)
    .sort((a, b) => (a.startsAt || '').localeCompare(b.startsAt || ''))
    .map((c) => ({
      id: c.id,
      kind: c.type === 'calendar' ? 'calendar' : 'event',
      category: c.category,
      title: c.title,
      allDay: c.allDay,
      startsAt: c.startsAt,
      endsAt: c.endsAt,
      venue: c.venue || null,
    }));

  sendSuccess(res, calendarItems);
});

// GET /calendar.ics - standard iCalendar feed (§5.6)
router.get('/ics', async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const db = admin.firestore();

  const snap = await db.collection('contents').where('status', '==', 'published').get();
  const allContents = snap.docs.map((d) => d.data() as Content);

  const calendarItems = allContents
    .filter((c) => isContentVisibleToUser(c, user))
    .filter((c) => ['calendar', 'event', 'guest_lecture'].includes(c.type) && c.startsAt);

  let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UCL Campus Hub//NONSGML Calendar//EN\n';

  for (const item of calendarItems) {
    const startIso = item.startsAt!.replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endIso = (item.endsAt || item.startsAt)!.replace(/[-:]/g, '').split('.')[0] + 'Z';

    icsContent += 'BEGIN:VEVENT\n';
    icsContent += `UID:${item.id}@ucl.ac.uk\n`;
    icsContent += `SUMMARY:${item.title}\n`;
    icsContent += `DESCRIPTION:${item.summary || item.title}\n`;
    icsContent += `DTSTART:${startIso}\n`;
    icsContent += `DTEND:${endIso}\n`;
    if (item.venue) icsContent += `LOCATION:${item.venue}\n`;
    icsContent += 'END:VEVENT\n';
  }

  icsContent += 'END:VCALENDAR';

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="ucl-calendar.ics"');
  res.send(icsContent);
});

export default router;
