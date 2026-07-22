/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  linkedTeacherId?: string | null;
  linkedStudentId?: string | null;
  linkedParentId?: string | null;
}

export interface SchoolSetting {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  timezone: string;
  currentAcademicYearId: string;
  currentTermId: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface Term {
  id: string;
  academicYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive';
}

export interface GradeLevel {
  id: string;
  name: string;
  numericLevel: number;
}

export interface Classroom {
  id: string;
  name: string;
  gradeLevelId: string;
  capacity: number;
  teacherId?: string; // Class advisor
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  gradeLevelId: string;
}

export interface Staff {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  joiningDate: string;
  status: 'active' | 'inactive';
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization?: string;
  status: 'active' | 'inactive';
}

export interface Parent {
  id: string;
  userId: string;
  parentId: string; // system ID e.g. PAR-2026-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  address?: string;
}

export interface Student {
  id: string;
  userId: string;
  studentId: string; // system ID e.g. STD-2026-001
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: 'Male' | 'Female';
  dob: string;
  gradeLevelId: string;
  classroomId: string;
  parentId?: string;
  status: 'active' | 'inactive';
}

export interface StudentEnrollment {
  id: string;
  studentId: string;
  academicYearId: string;
  gradeLevelId: string;
  classroomId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'withdrawn';
}

export interface StudentPromotion {
  id: string;
  studentId: string;
  fromAcademicYearId: string;
  toAcademicYearId: string;
  fromClassroomId: string;
  toClassroomId: string;
  promotionDate: string;
  status: 'promoted' | 'retained';
}

export interface TimetableEntry {
  id: string;
  classroomId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  periodName: string; // e.g. "Period 1", "Period 2"
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "09:00"
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface StaffAttendance {
  id: string;
  staffId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  remarks?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  subjectId: string;
  teacherId: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  content?: string;
  score?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Exam {
  id: string;
  name: string; // e.g. "Midterm 1"
  termId: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  remarks?: string;
}

export interface GradingScale {
  id: string;
  grade: string; // e.g. "A", "B", "C"
  minScore: number;
  maxScore: number;
  points: number;
  description?: string;
}

export interface ReportCard {
  id: string;
  studentId: string;
  academicYearId: string;
  termId: string;
  gpa: number;
  comments?: string;
  approvedBy?: string;
  status: 'draft' | 'published';
}

export interface FeeType {
  id: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'once' | 'monthly' | 'termly' | 'yearly';
}

export interface FeeStructure {
  id: string;
  academicYearId: string;
  gradeLevelId: string;
  feeTypeId: string;
  amount: number;
}

export interface StudentInvoice {
  id: string;
  studentId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
}

export interface StudentInvoiceItem {
  id: string;
  invoiceId: string;
  feeTypeId: string;
  amount: number;
}

export interface FeePayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Check';
  transactionId?: string;
  receivedBy: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
  recipient: string;
}

export interface IncomeRecord {
  id: string;
  source: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface BookCategory {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  categoryId: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookLoan {
  id: string;
  bookId: string;
  studentId: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetAudience: 'all' | 'teachers' | 'students' | 'parents' | 'staff';
  createdBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
}

export interface DisciplineIncident {
  id: string;
  studentId: string;
  incidentDate: string;
  description: string;
  actionTaken?: string;
  reportedBy: string;
  status: 'pending' | 'resolved';
}

export interface AuditLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  createdAt: string;
}

export interface DatabaseBackup {
  id: string;
  fileName: string;
  fileSize: string;
  status: 'completed' | 'failed';
  createdAt: string;
}
