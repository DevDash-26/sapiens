// UCL Campus Hub — API Contract & Data Model TypeScript Definitions (v1.0.0)

export type Role =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'academic_staff'
  | 'finance_staff'
  | 'society_rep'
  | 'student'
  | 'alumni';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type ContentType =
  | 'announcement'
  | 'event'
  | 'guest_lecture'
  | 'calendar'
  | 'info'
  | 'opportunity'
  | 'highlight';

export type ContentStatus =
  | 'draft'
  | 'pending_review'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'cancelled'
  | 'expired'
  | 'archived';

export type Priority = 'normal' | 'high';
export type Origin = 'official' | 'student';

export type AlertKind = 'emergency' | 'closure' | 'schedule_change';
export type AlertStatus = 'draft' | 'active' | 'resolved';

export type RequestType =
  | 'lost'
  | 'found'
  | 'textbook'
  | 'academic_support'
  | 'facility_issue'
  | 'feedback';

export type RequestStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'rejected';
export type ClaimStatus = 'pending' | 'approved' | 'rejected';
export type BookingStatus = 'confirmed' | 'cancelled' | 'cancelled_by_closure' | 'cancelled_by_admin';
export type MembershipStatus = 'interested' | 'pending' | 'approved' | 'rejected';
export type NotificationType = 'alert' | 'announcement' | 'event' | 'booking' | 'request' | 'society' | 'system';
export type AiActionType =
  | 'open_booking'
  | 'open_content'
  | 'open_form'
  | 'open_society'
  | 'open_staff'
  | 'open_calendar';

export type Faculty = 'FOC' | 'FOB' | 'FOE';
export type Programme = 'BSC-SE' | 'BSC-CS' | 'BBA' | 'BENG-CE';
export type YearGroup = 1 | 2 | 3 | 4;

export type ItemCategory =
  | 'electronics'
  | 'id_card_wallet'
  | 'keys'
  | 'clothing'
  | 'bags'
  | 'books'
  | 'other';

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'PAYLOAD_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
  meta?: {
    nextCursor?: string | null;
    count?: number;
    unreadCount?: number;
    serverTime?: string;
    [key: string]: any;
  };
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  [key: string]: any;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: ApiErrorDetail[] | Record<string, any>;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// --- Data Models (Firestore flat schema) ---

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  status: UserStatus;
  faculty: Faculty | null;
  programme: Programme | null;
  yearGroup: YearGroup | null;
  studentId: string | null;
  phone: string | null;
  smsOptIn: boolean;
  societyIds: string[];
  department: string | null;
  alumniGradYear: number | null;
  fcmTokens: string[];
  notifPrefs: {
    push: boolean;
    categories: Record<string, boolean>;
  };
  lastLoginAt: string;
  createdAt: string;
}

export interface Audience {
  all: boolean;
  faculties: Faculty[];
  programmes: Programme[];
  years: YearGroup[];
}

export interface Content {
  id: string;
  type: ContentType;
  category: string;
  title: string;
  summary: string;
  body: string;
  imageUrl: string | null;
  tags: string[];

  audience: Audience;
  priority: Priority;
  pinned: boolean;

  status: ContentStatus;
  publishAt: string | null;
  expiresAt: string | null;

  startsAt: string | null;
  endsAt: string | null;
  allDay: boolean;
  venue: string | null;
  origin: Origin;
  societyId: string | null;
  capacity: number | null;
  interestedCount: number;
  link: string | null;
  details: Record<string, any>;

  author: {
    uid: string;
    name: string;
    role: Role;
  };
  source: {
    department: string;
    verified: boolean;
  };

  flags: {
    affectedByAlertId: string | null;
  };
  review: {
    reviewedBy: string | null;
    reviewedAt: string | null;
    reason: string | null;
  };
  version: number;
  createdAt: string;
  updatedAt: string;
  viewer?: {
    interested: boolean;
    canEdit: boolean;
  };
  shareUrl?: string;
}

export interface ContentCard {
  id: string;
  type: ContentType;
  category: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  priority: Priority;
  pinned: boolean;
  startsAt: string | null;
  endsAt: string | null;
  allDay: boolean;
  venue: string | null;
  origin: Origin;
  societyId: string | null;
  interestedCount: number;
  audience: Audience;
  source: {
    department: string;
    verified: boolean;
  };
  updatedAt: string;
  expiresAt: string | null;
  status: ContentStatus;
  viewer: {
    interested: boolean;
    canEdit: boolean;
  };
  shareUrl: string;
}

export interface Interest {
  id: string;
  eventId: string;
  uid: string;
  createdAt: string;
}

export interface AlertAffects {
  startsAt: string;
  endsAt: string;
  scope: string;
  buildings: string[];
  cancelBookings: boolean;
  flagEvents: boolean;
}

export interface Alert {
  id: string;
  kind: AlertKind;
  status: AlertStatus;
  title: string;
  body: string;
  affects: AlertAffects | null;
  sendSms: boolean;
  updates: Array<{
    at: string;
    text: string;
    by: string;
  }>;
  impact: {
    eventsFlagged: number;
    bookingsCancelled: number;
    usersNotified: number;
    smsSent: number;
  } | null;
  confirmToken: string | null;
  createdBy: {
    uid: string;
    name: string;
    role: Role;
  };
  confirmedBy: string | null;
  publishedAt: string | null;
  resolvedAt: string | null;
  lastUpdatedAt: string;
  createdAt: string;
}

export interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  visibility: 'public' | 'private';
  title: string;
  description: string;
  imageUrls: string[];
  location: string | null;
  occurredAt: string | null;
  data: Record<string, any>;
  verificationHint: string | null;
  handoverNote: string | null;
  ownerUid: string;
  ownerName: string;
  assigneeUid: string | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface Claim {
  id: string;
  requestId: string;
  claimantUid: string;
  claimantName: string;
  answer: string;
  message: string;
  status: ClaimStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  features: string[];
  openTime: string;
  closeTime: string;
  closedWeekdays: number[];
  bookable: boolean;
  status: 'active' | 'maintenance' | 'inactive';
}

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  uid: string | null;
  userName: string;
  startsAt: string;
  endsAt: string;
  purpose: string;
  attendees: number;
  status: BookingStatus;
  source: 'student' | 'staff' | 'timetable';
  slotIds: string[];
  createdAt: string;
  cancelledAt: string | null;
  cancelReason: string | null;
}

export interface RoomSlot {
  id: string;
  roomId: string;
  bookingId: string;
  slotStartUtc: string;
}

export interface Society {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string | null;
  coverUrl: string | null;
  contactEmail: string;
  socials: Record<string, string>;
  meetingInfo: string;
  joinMode: 'open' | 'approval' | 'interest_only';
  presidentUid: string | null;
  repUids: string[];
  memberCount: number;
  status: 'active' | 'inactive';
  source: {
    department: string;
    verified: boolean;
  };
  createdAt: string;
  updatedAt: string;
  viewer?: {
    membership: MembershipStatus | null;
  };
}

export interface SocietyMember {
  id: string;
  societyId: string;
  uid: string;
  userName: string;
  status: MembershipStatus;
  message: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  order: number;
  status: 'published' | 'draft';
  helpfulCount: number;
  unhelpfulCount: number;
  source: {
    department: string;
    verified: boolean;
  };
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  topics: string[];
  status: 'active' | 'inactive';
}

export interface Notification {
  id: string;
  uid: string;
  type: NotificationType;
  title: string;
  body: string;
  refType: string;
  refId: string;
  channels: string[];
  readAt: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorRole: Role;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  ip: string | null;
  at: string;
}

export interface ImportJob {
  id: string;
  resource: string;
  mode: 'upsert' | 'insert';
  dryRun: boolean;
  status: 'pending' | 'processing' | 'validated' | 'completed' | 'failed';
  counts: {
    received: number;
    created: number;
    updated: number;
    failed: number;
  };
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  createdBy: string;
  createdAt: string;
}

export interface AiLog {
  id: string;
  uid: string;
  question: string;
  answer: string;
  sourceIds: string[];
  fallback: boolean;
  unanswered: boolean;
  helpful: boolean | null;
  createdAt: string;
}

export interface SmsLog {
  id: string;
  alertId: string;
  to: string;
  provider: string;
  status: 'sent' | 'failed';
  providerRef: string | null;
  at: string;
}
