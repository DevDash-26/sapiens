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
  let answer = 'I can assist you with examination guidelines, lecture hall bookings, society signups, textbook exchange, or contacting your faculty counsellors.';
  const suggestedActions: Array<{ type: AiActionType; label: string; targetId?: string }> = [];
  const sources: string[] = ['UCL Student Handbook 2026', 'Academic Regulations v3.1'];

  if (q.includes('book') || q.includes('room') || q.includes('study space') || q.includes('classroom')) {
    answer = 'You can reserve study spaces and meeting rooms in Block A, B, and C between 08:30 and 19:30. Bookings must be made with your student ID.';
    suggestedActions.push({ type: 'open_booking', label: 'View Classroom Availability' });
  } else if (q.includes('lost') || q.includes('found') || q.includes('claim')) {
    answer = 'Items found across campus are securely logged with the Security Desk (Ground Floor, Admin Block) and the Library Counter. You can report a lost item or file a private claim.';
    suggestedActions.push({ type: 'open_form', label: 'Lost & Found Hub' });
  } else if (q.includes('exam') || q.includes('timetable') || q.includes('calendar') || q.includes('deadline')) {
    answer = 'Semester 1 examinations begin on November 10, 2026. Make sure you have your university ID card and examination admission slip.';
    suggestedActions.push({ type: 'open_calendar', label: 'View Academic Calendar' });
  } else if (q.includes('counsellor') || q.includes('wellbeing') || q.includes('staff') || q.includes('dilani')) {
    answer = 'Ms. Dilani Fernando is the Student Counsellor (Student Wellbeing). Office: Admin Block, Room 12. Office hours are Mon–Fri 9:00–16:00.';
    suggestedActions.push({ type: 'open_staff', label: 'View Staff Directory', targetId: 'stf_01' });
  } else if (q.includes('robotics') || q.includes('society') || q.includes('club') || q.includes('ieee')) {
    answer = 'UCL hosts multiple active societies including the Robotics & AI Club, IEEE Student Branch, and Business Society.';
    suggestedActions.push({ type: 'open_society', label: 'Explore Societies Directory' });
  }

  return sendSuccess(res, {
    answer,
    suggestedActions,
    sources,
  });
});

export default router;
