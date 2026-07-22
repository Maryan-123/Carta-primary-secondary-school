export type UserRole =
  | "ADMINISTRATOR"
  | "PRINCIPAL"
  | "TEACHER"
  | "STUDENT"
  | "PARENT"
  | "ACCOUNTANT"
  | "LIBRARIAN"
  | "RECEPTIONIST"
  | "SUPPORT_STAFF";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorShape {
  success: false;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface AuthUser {
  id: number;
  username: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  profilePhoto?: string | null;
  isActive?: boolean;
  mustChangePassword?: boolean;
  lastLogin?: string | null;
  role: UserRole;
  permissions: string[];
  linkedTeacherId?: number | null;
  linkedStudentId?: number | null;
  linkedParentId?: number | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface DashboardChild {
  id: number;
  name?: string;
  currentClassroom?: {
    classroom_name?: string;
    grade_level?: string;
    academic_year?: string;
    admission_number?: string;
  };
  attendancePercentage?: number;
  feeBalance?: {
    total_balance?: number;
  };
  libraryLoans?: Array<Record<string, unknown>>;
  recentAssignments?: Array<Record<string, unknown>>;
  recentResults?: Array<Record<string, unknown>>;
  reportCards?: Array<Record<string, unknown>>;
  invoices?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
}

export interface DashboardPayload extends Record<string, unknown> {
  currentClassroom?: {
    classroom_name?: string;
    grade_level?: string;
    academic_year?: string;
    admission_number?: string;
    section_name?: string;
  };
  attendancePercentage?: number;
  timetable?: Array<Record<string, unknown>>;
  recentAssignments?: Array<Record<string, unknown>>;
  recentResults?: Array<Record<string, unknown>>;
  reportCards?: Array<Record<string, unknown>>;
  feeBalance?: {
    total_balance?: number;
  };
  invoices?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
  libraryLoans?: Array<Record<string, unknown>>;
  announcements?: Array<Record<string, unknown>>;
  upcomingEvents?: Array<Record<string, unknown>>;
  children?: DashboardChild[];
  assignedClasses?: Array<Record<string, unknown>>;
  assignedSubjects?: Array<Record<string, unknown>>;
  assignmentLinks?: Array<Record<string, unknown>>;
  submissions?: Array<Record<string, unknown>>;
  upcomingExams?: Array<Record<string, unknown>>;
}
