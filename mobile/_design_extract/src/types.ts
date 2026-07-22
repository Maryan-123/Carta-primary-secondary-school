export type PortalRole = 'student' | 'parent' | 'teacher' | 'login';

export interface UserProfile {
  id: string;
  name: string;
  role: PortalRole;
  grade?: string;
  avatarUrl?: string;
  email?: string;
}

export interface TimetableSlot {
  id: string;
  timeStart: string;
  timeEnd: string;
  subject: string;
  location: string;
  instructor: string;
  isCurrent?: boolean;
  statusTag?: 'ONGOING' | 'COMPLETED' | 'UPCOMING' | 'LOCKED';
  accentColor?: 'primary' | 'secondary' | 'tertiary';
}

export interface AssessmentResult {
  id: string;
  assessment: string;
  date: string;
  grade: string;
  subject?: string;
  scorePercentage?: number;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatarUrl: string;
  attendancePct: number;
  feesStatus: string;
  alertsCount: number;
  termAverage: string;
  rank: string;
  subjects: {
    name: string;
    scorePct: number;
    accent: 'primary' | 'secondary';
  }[];
}

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  location: string;
  time: string;
}

export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl?: string;
  tag?: string;
  date?: string;
}

export interface StudentAttendance {
  id: string;
  studentName: string;
  className: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  avatarUrl?: string;
}

export interface PendingTask {
  id: string;
  title: string;
  dueDate: string;
  subject: string;
  completed: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}
