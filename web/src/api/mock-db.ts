/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User, SchoolSetting, AcademicYear, Term, GradeLevel, Classroom, Subject,
  Teacher, Parent, Student, TimetableEntry, AttendanceRecord, StaffAttendance,
  Assignment, AssignmentSubmission, Exam, ExamResult, GradingScale, ReportCard,
  FeeType, StudentInvoice, FeePayment, Expense, IncomeRecord, BookCategory,
  Book, BookLoan, Announcement, SchoolEvent, DisciplineIncident, AuditLog,
  DatabaseBackup, Staff
} from '../types';

// Helper to load/save state from localStorage
const getLocalStorage = <T>(key: string, initialValue: T): T => {
  try {
    const item = localStorage.getItem(`sms_${key}`);
    return item ? JSON.parse(item) : initialValue;
  } catch (error) {
    console.warn(`Error loading localStorage key "${key}":`, error);
    return initialValue;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(`sms_${key}`, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error saving localStorage key "${key}":`, error);
  }
};

// Seeding standard initial data
const initialUsers: User[] = [
  { id: 'usr-admin', username: 'admin', email: 'admin@school.edu', role: 'ADMIN', firstName: 'Amina', lastName: 'Farah', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-principal', username: 'principal', email: 'principal@school.edu', role: 'PRINCIPAL', firstName: 'Mohamed', lastName: 'Ali', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-teacher1', username: 'teacher1', email: 'teacher1@school.edu', role: 'TEACHER', firstName: 'Abdi', lastName: 'Hassan', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-teacher2', username: 'teacher2', email: 'teacher2@school.edu', role: 'TEACHER', firstName: 'Halima', lastName: 'Yusuf', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-accountant', username: 'accountant', email: 'billing@school.edu', role: 'ACCOUNTANT', firstName: 'Fartun', lastName: 'Osman', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-librarian', username: 'librarian', email: 'library@school.edu', role: 'LIBRARIAN', firstName: 'Omar', lastName: 'Warsame', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-student1', username: 'student1', email: 'std1@school.edu', role: 'STUDENT', firstName: 'Sadia', lastName: 'Jama', status: 'active', createdAt: '2026-01-01T08:00:00Z' },
  { id: 'usr-parent1', username: 'parent1', email: 'parent1@gmail.com', role: 'PARENT', firstName: 'Yasin', lastName: 'Jama', status: 'active', createdAt: '2026-01-01T08:00:00Z' }
];

const initialSchoolSettings: SchoolSetting = {
  id: 'school-1',
  name: 'Carta Primary & Secondary School',
  address: 'Wadada Maka Al Mukarama, Mogadishu, Somalia',
  phone: '+252 61 555 1234',
  email: 'info@carta.edu.so',
  timezone: 'Africa/Mogadishu',
  currentAcademicYearId: 'ay-2026',
  currentTermId: 'term-1'
};

const initialAcademicYears: AcademicYear[] = [
  { id: 'ay-2025', name: '2024/2025 Academic Year', startDate: '2024-09-01', endDate: '2025-06-15', status: 'inactive' },
  { id: 'ay-2026', name: '2025/2026 Academic Year', startDate: '2025-09-01', endDate: '2026-06-15', status: 'active' }
];

const initialTerms: Term[] = [
  { id: 'term-1', academicYearId: 'ay-2026', name: 'Term One (Fall)', startDate: '2025-09-01', endDate: '2025-12-18', status: 'inactive' },
  { id: 'term-2', academicYearId: 'ay-2026', name: 'Term Two (Spring)', startDate: '2026-01-05', endDate: '2026-03-30', status: 'active' },
  { id: 'term-3', academicYearId: 'ay-2026', name: 'Term Three (Summer)', startDate: '2026-04-10', endDate: '2026-06-15', status: 'inactive' }
];

const initialGradeLevels: GradeLevel[] = [
  { id: 'grade-1', name: 'Grade 1', numericLevel: 1 },
  { id: 'grade-2', name: 'Grade 2', numericLevel: 2 },
  { id: 'grade-9', name: 'Grade 9 (High School)', numericLevel: 9 },
  { id: 'grade-10', name: 'Grade 10 (High School)', numericLevel: 10 }
];

const initialClassrooms: Classroom[] = [
  { id: 'class-9a', name: 'Grade 9 - Section A', gradeLevelId: 'grade-9', capacity: 30, teacherId: 'teach-abdi' },
  { id: 'class-9b', name: 'Grade 9 - Section B', gradeLevelId: 'grade-9', capacity: 25, teacherId: 'teach-halima' },
  { id: 'class-10a', name: 'Grade 10 - Section A', gradeLevelId: 'grade-10', capacity: 30 }
];

const initialSubjects: Subject[] = [
  { id: 'sub-math9', name: 'Mathematics 9', code: 'MATH-09', gradeLevelId: 'grade-9' },
  { id: 'sub-eng9', name: 'English Literature 9', code: 'ENG-09', gradeLevelId: 'grade-9' },
  { id: 'sub-sci9', name: 'General Science 9', code: 'SCI-09', gradeLevelId: 'grade-9' },
  { id: 'sub-math10', name: 'Algebra & Geometry 10', code: 'MATH-10', gradeLevelId: 'grade-10' }
];

const initialTeachers: Teacher[] = [
  { id: 'teach-abdi', userId: 'usr-teacher1', employeeId: 'EMP-T-001', firstName: 'Abdi', lastName: 'Hassan', email: 'teacher1@school.edu', phone: '+252 61 777 1111', specialization: 'Mathematics & Physics', status: 'active' },
  { id: 'teach-halima', userId: 'usr-teacher2', employeeId: 'EMP-T-002', firstName: 'Halima', lastName: 'Yusuf', email: 'teacher2@school.edu', phone: '+252 61 777 2222', specialization: 'Science & English', status: 'active' }
];

const initialStaff: Staff[] = [
  { id: 'staff-fartun', userId: 'usr-accountant', employeeId: 'EMP-A-001', firstName: 'Fartun', lastName: 'Osman', email: 'billing@school.edu', phone: '+252 61 777 3333', role: 'ACCOUNTANT', joiningDate: '2024-02-01', status: 'active' },
  { id: 'staff-omar', userId: 'usr-librarian', employeeId: 'EMP-L-001', firstName: 'Omar', lastName: 'Warsame', email: 'library@school.edu', phone: '+252 61 777 4444', role: 'LIBRARIAN', joiningDate: '2024-05-10', status: 'active' }
];

const initialParents: Parent[] = [
  { id: 'parent-yasin', userId: 'usr-parent1', parentId: 'PAR-2026-001', firstName: 'Yasin', lastName: 'Jama', email: 'parent1@gmail.com', phone: '+252 61 888 9999', occupation: 'Merchant', address: 'Hodan District, Mogadishu' }
];

const initialStudents: Student[] = [
  { id: 'stud-sadia', userId: 'usr-student1', studentId: 'STD-2026-001', firstName: 'Sadia', lastName: 'Jama', email: 'std1@school.edu', phone: '+252 61 999 0001', gender: 'Female', dob: '2011-04-12', gradeLevelId: 'grade-9', classroomId: 'class-9a', parentId: 'parent-yasin', status: 'active' },
  { id: 'stud-hassan', userId: 'usr-student2', studentId: 'STD-2026-002', firstName: 'Hassan', lastName: 'Mohamed', email: 'std2@school.edu', gender: 'Male', dob: '2010-09-22', gradeLevelId: 'grade-9', classroomId: 'class-9a', status: 'active' },
  { id: 'stud-anisa', userId: 'usr-student3', studentId: 'STD-2026-003', firstName: 'Anisa', lastName: 'Ahmed', email: 'std3@school.edu', gender: 'Female', dob: '2010-01-15', gradeLevelId: 'grade-10', classroomId: 'class-10a', status: 'active' }
];

const initialTimetableEntries: TimetableEntry[] = [
  { id: 'tt-1', classroomId: 'class-9a', subjectId: 'sub-math9', teacherId: 'teach-abdi', dayOfWeek: 'Monday', periodName: 'Period 1', startTime: '08:00', endTime: '09:00' },
  { id: 'tt-2', classroomId: 'class-9a', subjectId: 'sub-eng9', teacherId: 'teach-halima', dayOfWeek: 'Monday', periodName: 'Period 2', startTime: '09:00', endTime: '10:00' },
  { id: 'tt-3', classroomId: 'class-9a', subjectId: 'sub-sci9', teacherId: 'teach-halima', dayOfWeek: 'Tuesday', periodName: 'Period 1', startTime: '08:00', endTime: '09:00' }
];

const initialAttendanceRecords: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'stud-sadia', date: '2026-07-20', status: 'present', remarks: 'On time' },
  { id: 'att-2', studentId: 'stud-hassan', date: '2026-07-20', status: 'absent', remarks: 'Sick leave requested' },
  { id: 'att-3', studentId: 'stud-anisa', date: '2026-07-20', status: 'late', remarks: '10 mins delay' },
  { id: 'att-4', studentId: 'stud-sadia', date: '2026-07-21', status: 'present' },
  { id: 'att-5', studentId: 'stud-hassan', date: '2026-07-21', status: 'present' }
];

const initialStaffAttendance: StaffAttendance[] = [
  { id: 'satt-1', staffId: 'teach-abdi', date: '2026-07-20', status: 'present' },
  { id: 'satt-2', staffId: 'teach-halima', date: '2026-07-20', status: 'present' },
  { id: 'satt-3', staffId: 'staff-fartun', date: '2026-07-20', status: 'present' }
];

const initialAssignments: Assignment[] = [
  { id: 'asg-1', title: 'Quadratic Equations Worksheet', description: 'Solve problems 1-15 on page 42. Show all step workings.', dueDate: '2026-07-25', classroomId: 'class-9a', subjectId: 'sub-math9', teacherId: 'teach-abdi' },
  { id: 'asg-2', title: 'Photosynthesis Lab Report', description: 'Write a brief description of light reactions vs dark reactions.', dueDate: '2026-07-28', classroomId: 'class-9a', subjectId: 'sub-sci9', teacherId: 'teach-halima' }
];

const initialAssignmentSubmissions: AssignmentSubmission[] = [
  { id: 'subm-1', assignmentId: 'asg-1', studentId: 'stud-sadia', submissionDate: '2026-07-19T14:20:00Z', content: 'Completed problems in notes. Answer to Q1 is x=2, x=-3.', score: 95, feedback: 'Excellent layout of equations', status: 'graded' },
  { id: 'subm-2', assignmentId: 'asg-1', studentId: 'stud-hassan', submissionDate: '2026-07-21T09:15:00Z', content: 'I have attached my work. Completed questions 1 to 10.', status: 'pending' }
];

const initialExams: Exam[] = [
  { id: 'exam-mid2', name: 'Term 2 Mid-Term Examination', termId: 'term-2', academicYearId: 'ay-2026', startDate: '2026-02-15', endDate: '2026-02-20' },
  { id: 'exam-final2', name: 'Term 2 Final Examination', termId: 'term-2', academicYearId: 'ay-2026', startDate: '2026-06-01', endDate: '2026-06-10' }
];

const initialExamResults: ExamResult[] = [
  { id: 'res-1', examId: 'exam-mid2', studentId: 'stud-sadia', subjectId: 'sub-math9', marksObtained: 88, maxMarks: 100, remarks: 'Strong analytical skills' },
  { id: 'res-2', examId: 'exam-mid2', studentId: 'stud-hassan', subjectId: 'sub-math9', marksObtained: 65, maxMarks: 100, remarks: 'Needs revision in geometry' },
  { id: 'res-3', examId: 'exam-mid2', studentId: 'stud-sadia', subjectId: 'sub-sci9', marksObtained: 92, maxMarks: 100, remarks: 'Outstanding performance' }
];

const initialGradingScales: GradingScale[] = [
  { id: 'gs-a', grade: 'A', minScore: 90, maxScore: 100, points: 4.0, description: 'Excellent' },
  { id: 'gs-b', grade: 'B', minScore: 80, maxScore: 89, points: 3.0, description: 'Very Good' },
  { id: 'gs-c', grade: 'C', minScore: 70, maxScore: 79, points: 2.0, description: 'Satisfactory' },
  { id: 'gs-d', grade: 'D', minScore: 60, maxScore: 69, points: 1.0, description: 'Pass' },
  { id: 'gs-f', grade: 'F', minScore: 0, maxScore: 59, points: 0.0, description: 'Fail' }
];

const initialReportCards: ReportCard[] = [
  { id: 'rc-sadia', studentId: 'stud-sadia', academicYearId: 'ay-2026', termId: 'term-2', gpa: 3.7, comments: 'An outstanding, disciplined student. Highly recommended.', approvedBy: 'usr-principal', status: 'published' }
];

const initialFeeTypes: FeeType[] = [
  { id: 'ft-tuition9', name: 'High School Tuition Fee - Grade 9', description: 'Standard high school classroom tuition fee', amount: 150, frequency: 'monthly' },
  { id: 'ft-tuition10', name: 'High School Tuition Fee - Grade 10', description: 'Standard Grade 10 monthly tuition fee', amount: 160, frequency: 'monthly' },
  { id: 'ft-library', name: 'Library Resource & Access Fee', description: 'Annual digital/print library maintenance fee', amount: 30, frequency: 'yearly' },
  { id: 'ft-exam', name: 'Examination & Paper Printing Fee', description: 'Covers printed booklets and examination center tools', amount: 25, frequency: 'termly' }
];

const initialStudentInvoices: StudentInvoice[] = [
  { id: 'inv-1', studentId: 'stud-sadia', invoiceNumber: 'INV-2026-0001', issueDate: '2026-07-01', dueDate: '2026-07-15', totalAmount: 175, paidAmount: 175, status: 'paid' },
  { id: 'inv-2', studentId: 'stud-hassan', invoiceNumber: 'INV-2026-0002', issueDate: '2026-07-01', dueDate: '2026-07-15', totalAmount: 175, paidAmount: 100, status: 'partial' },
  { id: 'inv-3', studentId: 'stud-anisa', invoiceNumber: 'INV-2026-0003', issueDate: '2026-07-01', dueDate: '2026-07-15', totalAmount: 185, paidAmount: 0, status: 'unpaid' }
];

const initialFeePayments: FeePayment[] = [
  { id: 'pay-1', invoiceId: 'inv-1', amount: 175, paymentDate: '2026-07-05', paymentMethod: 'Mobile Money', transactionId: 'TXN-EVC-9912', receivedBy: 'Fartun Osman' },
  { id: 'pay-2', invoiceId: 'inv-2', amount: 100, paymentDate: '2026-07-10', paymentMethod: 'Cash', receivedBy: 'Fartun Osman' }
];

const initialExpenses: Expense[] = [
  { id: 'exp-1', category: 'Utilities', amount: 350, date: '2026-07-10', description: 'Local electric utility generator connection', paymentMethod: 'Cash', recipient: 'BECO Electric Corp' },
  { id: 'exp-2', category: 'Library Materials', amount: 480, date: '2026-07-14', description: 'Purchase of intermediate biology and calculus textbook volumes', paymentMethod: 'Bank Transfer', recipient: 'Mogadishu Bookstore' }
];

const initialIncomeRecords: IncomeRecord[] = [
  { id: 'inc-1', source: 'Canteen Rent', amount: 200, date: '2026-07-01', description: 'Monthly lease rent from catering tenant', paymentMethod: 'Mobile Money' },
  { id: 'inc-2', source: 'Direct School Donation', amount: 1500, date: '2026-07-12', description: 'Community support donation for laboratory equipment', paymentMethod: 'Bank Transfer' }
];

const initialBookCategories: BookCategory[] = [
  { id: 'cat-sci', name: 'Natural Sciences' },
  { id: 'cat-math', name: 'Mathematics' },
  { id: 'cat-lit', name: 'English & Somali Literature' },
  { id: 'cat-hist', name: 'History & Social Studies' }
];

const initialBooks: Book[] = [
  { id: 'bk-1', title: 'Conceptual Physics Vol. 1', author: 'Paul G. Hewitt', isbn: '9780321568090', categoryId: 'cat-sci', totalCopies: 12, availableCopies: 11 },
  { id: 'bk-2', title: 'Calculus: Early Transcendentals', author: 'James Stewart', isbn: '9780538497909', categoryId: 'cat-math', totalCopies: 8, availableCopies: 7 },
  { id: 'bk-3', title: 'Somali Traditional Folklore & Poetry', author: 'Ali Sugulle', categoryId: 'cat-lit', totalCopies: 5, availableCopies: 5 }
];

const initialBookLoans: BookLoan[] = [
  { id: 'loan-1', bookId: 'bk-1', studentId: 'stud-sadia', loanDate: '2026-07-10', dueDate: '2026-07-24', status: 'borrowed' },
  { id: 'loan-2', bookId: 'bk-2', studentId: 'stud-hassan', loanDate: '2026-07-02', dueDate: '2026-07-16', returnDate: '2026-07-15', status: 'returned' }
];

const initialAnnouncements: Announcement[] = [
  { id: 'ann-1', title: 'Term Two Mid-Term Schedule', content: 'The mid-term exams will commence on Sunday, February 15. All exam timetables are posted in classroom notice boards. Make sure school dues are cleared.', targetAudience: 'all', createdBy: 'Mohamed Ali', createdAt: '2026-02-01T09:00:00Z' },
  { id: 'ann-2', title: 'Staff Briefing & Curriculum Alignment', content: 'Special pedagogical meeting tomorrow at 3:15 PM in the staff room. We will review student attendance records and lesson plans.', targetAudience: 'teachers', createdBy: 'Mohamed Ali', createdAt: '2026-07-20T10:00:00Z' }
];

const initialSchoolEvents: SchoolEvent[] = [
  { id: 'evt-1', title: 'Parent-Teacher Consultative Conference', description: 'Review progress, exam feedback, and individual report card publications with classroom advisors.', startDate: '2026-07-26T08:00:00Z', endDate: '2026-07-26T14:00:00Z', location: 'School Assembly Hall' },
  { id: 'evt-2', title: 'Inter-Class Science Fair', description: 'Annual exhibition of laboratory project designs, physics experiments, and innovative concepts.', startDate: '2026-08-04T09:00:00Z', endDate: '2026-08-04T15:00:00Z', location: 'School Courtyard' }
];

const initialDisciplineIncidents: DisciplineIncident[] = [
  { id: 'disc-1', studentId: 'stud-hassan', incidentDate: '2026-07-15', description: 'Tardiness and failure to bring mathematics workbook repeatedly.', actionTaken: 'Parent notified; verbal warning issued by classroom advisor.', reportedBy: 'Abdi Hassan', status: 'resolved' }
];

const initialAuditLogs: AuditLog[] = [
  { id: 'log-1', userId: 'usr-admin', username: 'admin', action: 'Login', module: 'Auth', details: 'Successful administrator login', ipAddress: '192.168.1.50', createdAt: '2026-07-21T07:40:00Z' },
  { id: 'log-2', userId: 'usr-admin', username: 'admin', action: 'Create Student', module: 'Student', details: 'Added new student: Anisa Ahmed', ipAddress: '192.168.1.50', createdAt: '2026-07-21T07:45:00Z' }
];

const initialDatabaseBackups: DatabaseBackup[] = [
  { id: 'bak-1', fileName: 'sms_backup_20260715_0400.sql', fileSize: '18.4 MB', status: 'completed', createdAt: '2026-07-15T04:00:00Z' },
  { id: 'bak-2', fileName: 'sms_backup_20260720_0400.sql', fileSize: '18.6 MB', status: 'completed', createdAt: '2026-07-20T04:00:00Z' }
];

export class MockDB {
  public users = getLocalStorage<User[]>('users', initialUsers);
  public schoolSettings = getLocalStorage<SchoolSetting>('schoolSettings', initialSchoolSettings);
  public academicYears = getLocalStorage<AcademicYear[]>('academicYears', initialAcademicYears);
  public terms = getLocalStorage<Term[]>('terms', initialTerms);
  public gradeLevels = getLocalStorage<GradeLevel[]>('gradeLevels', initialGradeLevels);
  public classrooms = getLocalStorage<Classroom[]>('classrooms', initialClassrooms);
  public subjects = getLocalStorage<Subject[]>('subjects', initialSubjects);
  public teachers = getLocalStorage<Teacher[]>('teachers', initialTeachers);
  public staff = getLocalStorage<Staff[]>('staff', initialStaff);
  public parents = getLocalStorage<Parent[]>('parents', initialParents);
  public students = getLocalStorage<Student[]>('students', initialStudents);
  public timetableEntries = getLocalStorage<TimetableEntry[]>('timetableEntries', initialTimetableEntries);
  public attendanceRecords = getLocalStorage<AttendanceRecord[]>('attendanceRecords', initialAttendanceRecords);
  public staffAttendance = getLocalStorage<StaffAttendance[]>('staffAttendance', initialStaffAttendance);
  public assignments = getLocalStorage<Assignment[]>('assignments', initialAssignments);
  public assignmentSubmissions = getLocalStorage<AssignmentSubmission[]>('assignmentSubmissions', initialAssignmentSubmissions);
  public exams = getLocalStorage<Exam[]>('exams', initialExams);
  public examResults = getLocalStorage<ExamResult[]>('examResults', initialExamResults);
  public gradingScales = getLocalStorage<GradingScale[]>('gradingScales', initialGradingScales);
  public reportCards = getLocalStorage<ReportCard[]>('reportCards', initialReportCards);
  public feeTypes = getLocalStorage<FeeType[]>('feeTypes', initialFeeTypes);
  public studentInvoices = getLocalStorage<StudentInvoice[]>('studentInvoices', initialStudentInvoices);
  public feePayments = getLocalStorage<FeePayment[]>('feePayments', initialFeePayments);
  public expenses = getLocalStorage<Expense[]>('expenses', initialExpenses);
  public incomeRecords = getLocalStorage<IncomeRecord[]>('incomeRecords', initialIncomeRecords);
  public bookCategories = getLocalStorage<BookCategory[]>('bookCategories', initialBookCategories);
  public books = getLocalStorage<Book[]>('books', initialBooks);
  public bookLoans = getLocalStorage<BookLoan[]>('bookLoans', initialBookLoans);
  public announcements = getLocalStorage<Announcement[]>('announcements', initialAnnouncements);
  public schoolEvents = getLocalStorage<SchoolEvent[]>('schoolEvents', initialSchoolEvents);
  public disciplineIncidents = getLocalStorage<DisciplineIncident[]>('disciplineIncidents', initialDisciplineIncidents);
  public auditLogs = getLocalStorage<AuditLog[]>('auditLogs', initialAuditLogs);
  public backups = getLocalStorage<DatabaseBackup[]>('backups', initialDatabaseBackups);

  public saveAll(): void {
    setLocalStorage('users', this.users);
    setLocalStorage('schoolSettings', this.schoolSettings);
    setLocalStorage('academicYears', this.academicYears);
    setLocalStorage('terms', this.terms);
    setLocalStorage('gradeLevels', this.gradeLevels);
    setLocalStorage('classrooms', this.classrooms);
    setLocalStorage('subjects', this.subjects);
    setLocalStorage('teachers', this.teachers);
    setLocalStorage('staff', this.staff);
    setLocalStorage('parents', this.parents);
    setLocalStorage('students', this.students);
    setLocalStorage('timetableEntries', this.timetableEntries);
    setLocalStorage('attendanceRecords', this.attendanceRecords);
    setLocalStorage('staffAttendance', this.staffAttendance);
    setLocalStorage('assignments', this.assignments);
    setLocalStorage('assignmentSubmissions', this.assignmentSubmissions);
    setLocalStorage('exams', this.exams);
    setLocalStorage('examResults', this.examResults);
    setLocalStorage('gradingScales', this.gradingScales);
    setLocalStorage('reportCards', this.reportCards);
    setLocalStorage('feeTypes', this.feeTypes);
    setLocalStorage('studentInvoices', this.studentInvoices);
    setLocalStorage('feePayments', this.feePayments);
    setLocalStorage('expenses', this.expenses);
    setLocalStorage('incomeRecords', this.incomeRecords);
    setLocalStorage('bookCategories', this.bookCategories);
    setLocalStorage('books', this.books);
    setLocalStorage('bookLoans', this.bookLoans);
    setLocalStorage('announcements', this.announcements);
    setLocalStorage('schoolEvents', this.schoolEvents);
    setLocalStorage('disciplineIncidents', this.disciplineIncidents);
    setLocalStorage('auditLogs', this.auditLogs);
    setLocalStorage('backups', this.backups);
  }

  // Generic logger helper
  public log(userId: string, username: string, action: string, module: string, details: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId,
      username,
      action,
      module,
      details,
      ipAddress: '127.0.0.1',
      createdAt: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    this.saveAll();
  }
}

export const mockDb = new MockDB();
