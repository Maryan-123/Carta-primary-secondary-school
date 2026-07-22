import { UserRole } from "@/types/api";

export const SUPPORTED_MOBILE_ROLES: UserRole[] = ["STUDENT", "PARENT", "TEACHER"];

export function isMobileSupportedRole(role?: UserRole | null): boolean {
  return !!role && SUPPORTED_MOBILE_ROLES.includes(role);
}

export function getRoleTabs(role?: UserRole | null): string[] {
  switch (role) {
    case "STUDENT":
      return ["dashboard", "timetable", "attendance", "assignments", "exams", "finance", "updates", "profile"];
    case "PARENT":
      return ["dashboard", "attendance", "assignments", "exams", "finance", "updates", "profile"];
    case "TEACHER":
      return ["dashboard", "attendance", "timetable", "assignments", "exams", "updates", "profile"];
    default:
      return [];
  }
}
