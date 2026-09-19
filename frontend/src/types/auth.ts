export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'academic_staff'
  | 'finance_staff'
  | 'society_rep'
  | 'student'
  | 'past_alumni';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  department?: string;
  studentId?: string;
  staffId?: string;
  phoneNumber?: string;
  graduationYear?: number;
  societyIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type Permission =
  | 'manage_system'
  | 'manage_users'
  | 'import_export_data'
  | 'broadcast_emergency_sms'
  | 'manage_finance'
  | 'view_financial_reports'
  | 'manage_academic_records'
  | 'manage_societies'
  | 'create_society_events'
  | 'manage_lost_found'
  | 'view_lost_found'
  | 'view_faqs'
  | 'manage_faqs'
  | 'access_alumni_network';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'manage_system',
    'manage_users',
    'import_export_data',
    'broadcast_emergency_sms',
    'manage_finance',
    'view_financial_reports',
    'manage_academic_records',
    'manage_societies',
    'create_society_events',
    'manage_lost_found',
    'view_lost_found',
    'view_faqs',
    'manage_faqs',
    'access_alumni_network',
  ],
  admin: [
    'manage_users',
    'import_export_data',
    'broadcast_emergency_sms',
    'manage_finance',
    'view_financial_reports',
    'manage_academic_records',
    'manage_societies',
    'create_society_events',
    'manage_lost_found',
    'view_lost_found',
    'view_faqs',
    'manage_faqs',
    'access_alumni_network',
  ],
  manager: [
    'import_export_data',
    'broadcast_emergency_sms',
    'view_financial_reports',
    'manage_societies',
    'manage_lost_found',
    'view_lost_found',
    'view_faqs',
    'manage_faqs',
  ],
  academic_staff: [
    'manage_academic_records',
    'create_society_events',
    'view_lost_found',
    'view_faqs',
  ],
  finance_staff: [
    'manage_finance',
    'view_financial_reports',
    'import_export_data',
    'view_lost_found',
    'view_faqs',
  ],
  society_rep: [
    'manage_societies',
    'create_society_events',
    'view_lost_found',
    'view_faqs',
  ],
  student: [
    'view_lost_found',
    'manage_lost_found',
    'view_faqs',
  ],
  past_alumni: [
    'access_alumni_network',
    'view_faqs',
  ],
};

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  academic_staff: 'Academic Staff',
  finance_staff: 'Finance Staff',
  society_rep: 'Society Rep / Club President',
  student: 'Student',
  past_alumni: 'Past Alumni',
};
