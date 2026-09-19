import { Router, Response } from 'express';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/envelope';
import { AiActionType } from '../types/contract';

const router = Router();
router.use(requireAuth);

// POST /ai/chat - grounded campus assistant (§5.12, BR33)
router.post('/chat', async (req: AuthenticatedRequest, res: Response) => {
  const { question } = req.body;

  if (!question || typeof question !== 'string') {
    return sendError(res, 'VALIDATION_ERROR', 'question string is required.', 400);
  }

  const q = question.toLowerCase();
  let answer = '';
  const suggestedActions: Array<{ type: AiActionType; label: string; targetId?: string }> = [];
  const sources: string[] = ['UCL Student Handbook 2026', 'Academic Regulations v3.1'];

  // Check if GEMINI_API_KEY is available in environment
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  if (geminiKey) {
    try {
      const systemPrompt = `You are the official Universal College Lanka (UCL) AI Campus Assistant. Provide friendly, concise, and accurate responses (under 3 paragraphs) regarding UCL campus queries. Key knowledge:
- Classroom & Study Room Booking: Rooms B204, B205, A101 bookable online via Campus Hub.
- Lost & Found: Managed at Security Desk (Ground Floor, Admin Block) and Library.
- Examination: Semester 1 final exams start Nov 2026.
- Wellbeing & Counselling: Ms. Dilani Fernando, Admin Block Room 12.
- Societies: Robotics & AI Club, IEEE Student Branch, Rotaract, Debating Society.
- Dining: Canteen operates 7:30 AM - 5:30 PM with halal/vegetarian options.
- IT & WiFi: Connect to 'UCL-Student' using student credentials.`;

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nStudent Query: ${question}` }],
              },
            ],
            generationConfig: {
              maxOutputTokens: 500,
              temperature: 0.7,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generatedText) {
          answer = generatedText;
        }
      }
    } catch (e: any) {
      console.warn('Gemini API call failed, falling back to local engine:', e?.message);
    }
  }

  // If no Gemini key or Gemini call failed, use intelligent rule-based campus knowledge base
  if (!answer) {
    if (q.includes('book') || q.includes('room') || q.includes('study space') || q.includes('classroom')) {
      answer = 'You can reserve study spaces and meeting rooms in Block A, B, and C between 08:30 and 19:30. Bookings must be made with your student ID.';
      suggestedActions.push({ type: 'open_booking', label: 'View Classroom Availability' });
    } else if (q.includes('lost') || q.includes('found') || q.includes('claim') || q.includes('calculator') || q.includes('bottle')) {
      answer = 'Items found across campus are securely logged with the Security Desk (Ground Floor, Admin Block) and the Library Counter. You can report a lost item or file a private claim.';
      suggestedActions.push({ type: 'open_form', label: 'Lost & Found Hub' });
    } else if (q.includes('exam') || q.includes('timetable') || q.includes('calendar') || q.includes('deadline') || q.includes('date')) {
      answer = 'Semester 1 examinations begin on November 10, 2026. Make sure you have your university ID card and examination admission slip.';
      suggestedActions.push({ type: 'open_calendar', label: 'View Academic Calendar' });
    } else if (q.includes('counsellor') || q.includes('wellbeing') || q.includes('staff') || q.includes('dilani') || q.includes('stress')) {
      answer = 'Ms. Dilani Fernando is the Student Counsellor (Student Wellbeing). Office: Admin Block, Room 12. Office hours are Mon–Fri 9:00–16:00.';
      suggestedActions.push({ type: 'open_staff', label: 'View Staff Directory', targetId: 'stf_01' });
    } else if (q.includes('robotics') || q.includes('society') || q.includes('club') || q.includes('ieee') || q.includes('join')) {
      answer = 'UCL hosts multiple active societies including the Robotics & AI Club, IEEE Student Branch, and Business Society.';
      suggestedActions.push({ type: 'open_society', label: 'Explore Societies Directory' });
    } else if (q.includes('food') || q.includes('canteen') || q.includes('dining') || q.includes('lunch')) {
      answer = 'The UCL Campus Canteen operates Mon–Fri 7:30 AM to 5:30 PM with hot meals, snacks, and vegetarian options.';
    } else {
      answer = `Hello! Regarding "${question}": I am here to assist with campus schedules, room bookings, lost items, society signups, or student wellbeing. How can I help you today?`;
    }
  }

  // Attach context actions if applicable
  if (suggestedActions.length === 0) {
    if (q.includes('book') || q.includes('room')) {
      suggestedActions.push({ type: 'open_booking', label: 'View Classroom Availability' });
    } else if (q.includes('lost') || q.includes('found')) {
      suggestedActions.push({ type: 'open_form', label: 'Lost & Found Hub' });
    } else if (q.includes('calendar') || q.includes('exam')) {
      suggestedActions.push({ type: 'open_calendar', label: 'View Academic Calendar' });
    }
  }

  return sendSuccess(res, {
    answer,
    suggestedActions,
    sources,
  });
});

export default router;
