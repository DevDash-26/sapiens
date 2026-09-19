import { ScreenId } from '../types/navigation';
import { Role } from '../types/contract';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';

/**
 * 8-tier role hierarchy rank (Higher number = higher authority)
 */
export const ROLE_HIERARCHY: Record<string, number> = {
  super_admin: 8,
  admin: 7,
  manager: 6,
  finance_staff: 5,
  academic_staff: 4,
  society_rep: 3,
  student: 2,
  past_alumni: 1,
  alumni: 1,
};

/**
 * Checks if a given role has at least the required minimum hierarchy level
 */
export function hasMinimumRole(userRole: string | null | undefined, minimumRole: string): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[minimumRole] || 0);
}

/**
 * Checks if the user has any of the specified allowed roles
 */
export function hasAnyRole(userRole: string | null | undefined, allowedRoles: string[]): boolean {
  if (!userRole) return false;
  const normalized = userRole === 'past_alumni' ? 'alumni' : userRole;
  return allowedRoles.some((r) => r === userRole || (r === 'alumni' && normalized === 'alumni') || (r === 'past_alumni' && normalized === 'alumni'));
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(userRole: string | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const permissions = (ROLE_PERMISSIONS as any)[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Categorizes user role into portal group: admin | staff | student | alumni
 */
export function getPortalCategory(role: string): 'admin' | 'staff' | 'student' | 'alumni' {
  switch (role) {
    case 'super_admin':
    case 'admin':
    case 'manager':
    case 'finance_staff':
      return 'admin';
    case 'academic_staff':
    case 'society_rep':
      return 'staff';
    case 'student':
      return 'student';
    case 'past_alumni':
    case 'alumni':
      return 'alumni';
    default:
      return 'student';
  }
}

/**
 * Screen access permissions mapping per docs/API-Contract+DataModel.md §3
 */
const SCREEN_ROLE_REQUIREMENTS: Partial<Record<ScreenId, string[]>> = {
  // Super Admin, Admin & Manager
  admin_overview: ['super_admin', 'admin', 'manager'],
  user_role_management: ['super_admin', 'admin', 'manager'],
  emergency_broadcast: ['super_admin', 'admin', 'manager'],
  data_transfer: ['super_admin', 'admin', 'manager', 'finance_staff'],

  // Manager and above
  facility_queue: ['super_admin', 'admin', 'manager'],
  feedback_inbox: ['super_admin', 'admin', 'manager'],
  room_booking_queue: ['super_admin', 'admin', 'manager'],
  lost_found_admin: ['super_admin', 'admin', 'manager'],
  faq_management: ['super_admin', 'admin', 'manager'],
  staff_directory_management: ['super_admin', 'admin', 'manager'],
  schedule_change_broadcast: ['super_admin', 'admin', 'manager'],
  content_management: ['super_admin', 'admin', 'manager'],

  // Academic Staff, Manager, Admin, Super Admin
  academic_support_queue: ['super_admin', 'admin', 'manager', 'academic_staff'],
  announcement_composer: ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff'],

  // Society Rep and Staff
  staff_event_management: ['super_admin', 'admin', 'manager', 'academic_staff', 'society_rep'],
  staff_society_management: ['super_admin', 'admin', 'manager', 'society_rep'],
  staff_dashboard: ['super_admin', 'admin', 'manager', 'academic_staff', 'finance_staff', 'society_rep'],

  // Booking forbidden for Alumni per §3.1
  classroom_availability: ['student', 'society_rep', 'academic_staff', 'finance_staff', 'manager', 'admin', 'super_admin'],
  room_booking_request: ['student', 'society_rep', 'academic_staff', 'finance_staff', 'manager', 'admin', 'super_admin'],
  my_bookings: ['student', 'society_rep', 'academic_staff', 'finance_staff', 'manager', 'admin', 'super_admin'],
};

/**
 * Strictly verifies whether a role is authorized to view a specific screen
 */
export function canAccessScreen(userRole: string | null | undefined, screenId: ScreenId): boolean {
  if (!userRole) return false;
  if (userRole === 'super_admin') return true;

  const allowedRoles = SCREEN_ROLE_REQUIREMENTS[screenId];
  if (!allowedRoles) {
    // Public / student screen — all authenticated roles can access
    return true;
  }

  const normalized = userRole === 'past_alumni' ? 'alumni' : userRole;
  return allowedRoles.some((r) => r === userRole || (r === 'alumni' && normalized === 'alumni'));
}
