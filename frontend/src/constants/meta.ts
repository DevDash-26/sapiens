import { Faculty, Programme, YearGroup } from '../types/contract';

export interface FacultyMeta {
  id: Faculty;
  name: string;
  shortName: string;
}

export interface ProgrammeMeta {
  id: Programme;
  name: string;
  faculty: Faculty;
}

export const CAMPUS_FACULTIES: FacultyMeta[] = [
  { id: 'FOC', name: 'Faculty of Computing', shortName: 'Computing' },
  { id: 'FOB', name: 'Faculty of Business', shortName: 'Business' },
  { id: 'FOE', name: 'Faculty of Engineering', shortName: 'Engineering' },
];

export const CAMPUS_PROGRAMMES: ProgrammeMeta[] = [
  { id: 'BSC-SE', name: 'BSc (Hons) Software Engineering', faculty: 'FOC' },
  { id: 'BSC-CS', name: 'BSc (Hons) Computer Science', faculty: 'FOC' },
  { id: 'BBA', name: 'Bachelor of Business Administration', faculty: 'FOB' },
  { id: 'BENG-CE', name: 'BEng (Hons) Civil Engineering', faculty: 'FOE' },
];

export const CAMPUS_YEAR_GROUPS: YearGroup[] = [1, 2, 3, 4];

export const CAMPUS_META = {
  faculties: CAMPUS_FACULTIES,
  programmes: CAMPUS_PROGRAMMES,
  yearGroups: CAMPUS_YEAR_GROUPS,
  categories: {
    announcement: ['academic', 'admin', 'finance', 'general'],
    event: ['academic', 'social', 'sports', 'cultural', 'career', 'other'],
    guest_lecture: ['lecture', 'industry_talk', 'workshop'],
    calendar: ['exam', 'add_drop', 'semester', 'holiday', 'deadline'],
    info: ['dining', 'printing', 'sports', 'library', 'it_support', 'wellbeing', 'finance_aid', 'onboarding', 'general'],
    opportunity: ['job', 'internship', 'placement', 'volunteering', 'alumni'],
    highlight: ['achievement', 'past_event'],
  },
};
