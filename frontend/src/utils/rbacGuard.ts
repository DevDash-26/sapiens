import { UserRole, Permission, ROLE_PERMISSIONS } from '../types/auth';

/**
 * 8-tier role hierarchy rank (Higher number = higher authority)
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 8,
  admin: 7,
  manager: 6,
  finance_staff: 5,
  academic_staff: 4,
  society_rep: 3,
  student: 2,
  past_alumni: 1,
};

/**
 * Checks if a given role has at least the required minimum hierarchy level
 */
export function hasMinimumRole(userRole: UserRole | null | undefined, minimumRole: UserRole): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Checks if the user has any of the specified allowed roles
 */
export function hasAnyRole(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

/**
 * Checks if user has a specific permission
 */
export function hasPermission(userRole: UserRole | null | undefined, permission: Permission): boolean {
  if (!userRole) return false;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
}

/**
 * Categorizes user role into portal group: admin | staff | student | alumni
 */
export function getPortalCategory(role: UserRole): 'admin' | 'staff' | 'student' | 'alumni' {
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
      return 'alumni';
  }
}
