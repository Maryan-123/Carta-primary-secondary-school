import { UserRole } from "../types";

export type PortalTab =
  | "dashboard"
  | "profile"
  | "reports"
  | "academic"
  | "students"
  | "parents"
  | "staff"
  | "attendance"
  | "timetable"
  | "assignments"
  | "exams"
  | "fees"
  | "finance"
  | "library"
  | "discipline"
  | "announcements"
  | "settings"
  | "audit";

export const ROLE_TAB_ACCESS: Record<UserRole, PortalTab[]> = {
  ADMIN: [
    "dashboard",
    "reports",
    "academic",
    "students",
    "parents",
    "staff",
    "attendance",
    "timetable",
    "assignments",
    "exams",
    "fees",
    "finance",
    "library",
    "discipline",
    "announcements",
    "settings",
    "audit",
  ],
  PRINCIPAL: [
    "dashboard",
    "academic",
    "students",
    "parents",
    "staff",
    "attendance",
    "timetable",
    "assignments",
    "exams",
    "discipline",
    "announcements",
  ],
  TEACHER: [
    "dashboard",
    "profile",
    "attendance",
    "timetable",
    "assignments",
    "exams",
  ],
  ACCOUNTANT: [
    "dashboard",
    "reports",
    "fees",
    "finance",
  ],
  LIBRARIAN: [
    "dashboard",
    "profile",
    "library",
  ],
  STUDENT: [
    "dashboard",
    "profile",
    "attendance",
    "timetable",
    "exams",
    "finance",
  ],
  PARENT: [
    "dashboard",
    "profile",
  ],
};

const ROLE_ALIASES: Record<string, UserRole> = {
  ADMIN: "ADMIN",
  ADMINISTRATOR: "ADMIN",
  PRINCIPAL: "PRINCIPAL",
  TEACHER: "TEACHER",
  ACCOUNTANT: "ACCOUNTANT",
  LIBRARIAN: "LIBRARIAN",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
};

export const canAccessPortalTab = (role: string | undefined, tab: PortalTab): boolean => {
  if (!role) {
    return false;
  }

  const normalizedRole = ROLE_ALIASES[role.toUpperCase()];
  if (!normalizedRole) {
    return false;
  }

  return ROLE_TAB_ACCESS[normalizedRole].includes(tab);
};
