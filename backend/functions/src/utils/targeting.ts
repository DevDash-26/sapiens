import { User, Content, Role } from '../types/contract';

/**
 * Checks if a given content item is visible to the given user.
 * Conforms strictly to Section 4.2 & Section 6.1 (Server-Side Targeting & Visibility).
 */
export function isContentVisibleToUser(content: Content, user: User | null): boolean {
  if (!user) {
    // Unauthenticated: only university-wide public content
    return content.audience.all;
  }

  const role = user.role;

  // Staff, manager, admin, super_admin see everything
  if (
    role === 'super_admin' ||
    role === 'admin' ||
    role === 'manager' ||
    role === 'academic_staff' ||
    role === 'finance_staff'
  ) {
    return true;
  }

  // Alumni rule: see only audience.all=true content AND all opportunity items (§3.1, §4.2)
  if (role === 'alumni') {
    return content.audience.all || content.type === 'opportunity';
  }

  // University-wide content is visible to all
  if (content.audience.all) {
    return true;
  }

  // Student / Society Rep matching logic
  const facultyMatch =
    !content.audience.faculties ||
    content.audience.faculties.length === 0 ||
    (user.faculty !== null && content.audience.faculties.includes(user.faculty));

  const programmeMatch =
    !content.audience.programmes ||
    content.audience.programmes.length === 0 ||
    (user.programme !== null && content.audience.programmes.includes(user.programme));

  const yearMatch =
    !content.audience.years ||
    content.audience.years.length === 0 ||
    (user.yearGroup !== null && content.audience.years.includes(user.yearGroup));

  return facultyMatch && programmeMatch && yearMatch;
}

/**
 * Filter an array of Content items for the current viewer
 */
export function filterContentForUser(contents: Content[], user: User | null): Content[] {
  return contents.filter((c) => isContentVisibleToUser(c, user));
}
