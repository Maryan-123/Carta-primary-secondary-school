/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';
import { mockDb } from './mock-db';
import {
  User, SchoolSetting, AcademicYear, Term, GradeLevel, Classroom, Subject,
  Teacher, Staff, Parent, Student, TimetableEntry, AttendanceRecord, StaffAttendance,
  Assignment, AssignmentSubmission, Exam, ExamResult, FeeType, StudentInvoice,
  FeePayment, Expense, IncomeRecord, Book, BookCategory, BookLoan, Announcement,
  SchoolEvent, DisciplineIncident, AuditLog, DatabaseBackup, UserRole, GradingScale, ReportCard
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const ACCESS_TOKEN_KEY = 'carta_access_token';
const REFRESH_TOKEN_KEY = 'carta_refresh_token';

const roleMap: Record<string, UserRole> = {
  ADMIN: 'ADMIN',
  ADMINISTRATOR: 'ADMIN',
  PRINCIPAL: 'PRINCIPAL',
  TEACHER: 'TEACHER',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
};

const normalizeRole = (role?: string): UserRole => roleMap[role?.toUpperCase() || ''] || 'STUDENT';

const normalizeUser = (user: Record<string, any>): User => ({
  id: String(user.id),
  username: user.username || '',
  email: user.email || '',
  role: normalizeRole(user.role),
  firstName: user.firstName || user.first_name || '',
  lastName: user.lastName || user.last_name || '',
  avatarUrl: user.profilePhoto || user.profile_photo || user.avatarUrl,
  status: user.isActive === false || user.is_active === false ? 'inactive' : 'active',
  createdAt: user.createdAt || user.created_at || new Date().toISOString(),
  linkedTeacherId: user.linkedTeacherId ? String(user.linkedTeacherId) : null,
  linkedStudentId: user.linkedStudentId ? String(user.linkedStudentId) : null,
  linkedParentId: user.linkedParentId ? String(user.linkedParentId) : null,
});

const saveTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Setup basic Axios instance
export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 4000, // Safe timeout for checking backend existence
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to determine if we should fall back to mock database
// We will try the API, and if it fails or throws a network error, we switch to mock-db
let useSimulatedOffline = false;

const handleApiCall = async <T>(apiCall: () => Promise<any>, mockFallback: () => T, loggerAction?: { action: string; module: string; details: string }): Promise<{ success: boolean; message: string; data: T; pagination?: any }> => {
  if (!useSimulatedOffline) {
    try {
      const response = await apiCall();
      return response.data;
    } catch (error: any) {
      console.warn(`Real API connection failed, falling back to local simulation. Error: ${error.message}`);
      // Fallback allowed
    }
  }

  // Local storage offline execution
  const data = mockFallback();
  
  // Log inside database if required
  if (loggerAction) {
    const activeUser = mockDb.users.find(u => u.status === 'active') || mockDb.users[0];
    mockDb.log(activeUser.id, activeUser.username, loggerAction.action, loggerAction.module, loggerAction.details);
  }

  // Simulate server latency briefly
  await new Promise(resolve => setTimeout(resolve, 150));

  return {
    success: true,
    message: "Operation completed successfully (Offline simulation)",
    data
  };
};

// Global Store for active user session in simulation mode
let activeSimulatedUser: User | null = null;

export const api = {
  getMode: () => (useSimulatedOffline ? 'Offline Local Storage' : 'Real REST Backend'),
  toggleMode: (val: boolean) => {
    useSimulatedOffline = val;
  },

  auth: {
    login: async (username: string, password: string, role?: UserRole) => {
      if (!useSimulatedOffline) {
        try {
          const response = await axiosClient.post('/auth/login', { username, password });
          const payload = response.data?.data || response.data;
          const user = normalizeUser(payload.user);
          saveTokens(payload.tokens?.accessToken, payload.tokens?.refreshToken);
          activeSimulatedUser = user;

          return {
            success: true,
            message: response.data?.message || 'Login successful',
            data: {
              user,
              token: payload.tokens?.accessToken,
              refreshToken: payload.tokens?.refreshToken,
            },
          };
        } catch (error: any) {
          const message = error?.response?.data?.message || error?.message || 'Login failed';
          throw new Error(message);
        }
      }

      return handleApiCall(
        async () => ({ data: null }),
        () => {
          let user = mockDb.users.find(u => u.username.toLowerCase() === username.toLowerCase());
          if (role && !user) {
            user = mockDb.users.find(u => u.role === role);
          }
          if (!user) {
            throw new Error('User not found. Use admin, principal, teacher1, accountant, librarian, student1, or parent1.');
          }
          activeSimulatedUser = user;
          return { token: 'simulated-jwt-token', user };
        },
        { action: 'Login', module: 'Auth', details: `User logged in with username: ${username}` }
      );
    },
    getCurrentUser: async () => {
      if (!useSimulatedOffline) {
        const token = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (!token) {
          return {
            success: true,
            message: 'No active session',
            data: null,
          };
        }

        try {
          const response = await axiosClient.get('/auth/me');
          const payload = response.data?.data || response.data;
          const user = normalizeUser(payload);
          activeSimulatedUser = user;

          return {
            success: true,
            message: response.data?.message || 'Authenticated user retrieved successfully',
            data: user,
          };
        } catch (error) {
          clearTokens();
          activeSimulatedUser = null;
          throw error;
        }
      }

      return handleApiCall(
        async () => ({ data: null }),
        () => activeSimulatedUser
      );
    },
    logout: async () => {
      if (!useSimulatedOffline) {
        try {
          await axiosClient.post('/auth/logout');
        } catch (_error) {
          // Ignore logout network issues and still clear the local session.
        } finally {
          clearTokens();
          activeSimulatedUser = null;
        }

        return {
          success: true,
          message: 'Logged out successfully',
          data: { success: true },
        };
      }

      return handleApiCall(
        async () => ({ data: null }),
        () => {
          activeSimulatedUser = null;
          return { success: true };
        },
        activeSimulatedUser ? { action: 'Logout', module: 'Auth', details: `User ${activeSimulatedUser.username} logged out` } : undefined
      );
    }
  },

  schoolSettings: {
    get: async () => handleApiCall(() => axiosClient.get('/settings'), () => mockDb.schoolSettings),
    update: async (settings: Partial<SchoolSetting>) => handleApiCall(
      () => axiosClient.put('/settings', settings),
      () => {
        mockDb.schoolSettings = { ...mockDb.schoolSettings, ...settings };
        mockDb.saveAll();
        return mockDb.schoolSettings;
      },
      { action: 'Update Settings', module: 'Settings', details: 'Updated main school details' }
    )
  },

  academicYears: {
    getAll: async () => handleApiCall(() => axiosClient.get('/academic-years'), () => mockDb.academicYears),
    create: async (item: Omit<AcademicYear, 'id'>) => handleApiCall(
      () => axiosClient.post('/academic-years', item),
      () => {
        const newItem = { ...item, id: `ay-${Date.now()}` };
        if (newItem.status === 'active') {
          mockDb.academicYears.forEach(y => y.status = 'inactive');
        }
        mockDb.academicYears.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Academic Year', module: 'Academic Year', details: `Added academic year ${item.name}` }
    ),
    update: async (id: string, item: Partial<AcademicYear>) => handleApiCall(
      () => axiosClient.put(`/academic-years/${id}`, item),
      () => {
        const index = mockDb.academicYears.findIndex(y => y.id === id);
        if (index > -1) {
          if (item.status === 'active') {
            mockDb.academicYears.forEach(y => y.status = 'inactive');
          }
          mockDb.academicYears[index] = { ...mockDb.academicYears[index], ...item };
          mockDb.saveAll();
          return mockDb.academicYears[index];
        }
        throw new Error('Record not found');
      },
      { action: 'Update Academic Year', module: 'Academic Year', details: `Updated academic year ID ${id}` }
    )
  },

  terms: {
    getAll: async () => handleApiCall(() => axiosClient.get('/terms'), () => mockDb.terms),
    create: async (item: Omit<Term, 'id'>) => handleApiCall(
      () => axiosClient.post('/terms', item),
      () => {
        const newItem = { ...item, id: `term-${Date.now()}` };
        if (newItem.status === 'active') {
          mockDb.terms.forEach(t => t.status = 'inactive');
        }
        mockDb.terms.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Term', module: 'Terms', details: `Created term ${item.name}` }
    ),
    update: async (id: string, item: Partial<Term>) => handleApiCall(
      () => axiosClient.put(`/terms/${id}`, item),
      () => {
        const index = mockDb.terms.findIndex(t => t.id === id);
        if (index > -1) {
          if (item.status === 'active') {
            mockDb.terms.forEach(t => t.status = 'inactive');
          }
          mockDb.terms[index] = { ...mockDb.terms[index], ...item };
          mockDb.saveAll();
          return mockDb.terms[index];
        }
        throw new Error('Term not found');
      },
      { action: 'Update Term', module: 'Terms', details: `Updated term ID ${id}` }
    )
  },

  gradeLevels: {
    getAll: async () => handleApiCall(() => axiosClient.get('/grade-levels'), () => mockDb.gradeLevels),
    create: async (item: Omit<GradeLevel, 'id'>) => handleApiCall(
      () => axiosClient.post('/grade-levels', item),
      () => {
        const newItem = { ...item, id: `grade-${Date.now()}` };
        mockDb.gradeLevels.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Grade Level', module: 'Academics', details: `Created grade level ${item.name}` }
    )
  },

  classrooms: {
    getAll: async () => handleApiCall(() => axiosClient.get('/classrooms'), () => mockDb.classrooms),
    create: async (item: Omit<Classroom, 'id'>) => handleApiCall(
      () => axiosClient.post('/classrooms', item),
      () => {
        const newItem = { ...item, id: `class-${Date.now()}` };
        mockDb.classrooms.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Classroom', module: 'Academics', details: `Created classroom ${item.name}` }
    ),
    update: async (id: string, item: Partial<Classroom>) => handleApiCall(
      () => axiosClient.put(`/classrooms/${id}`, item),
      () => {
        const idx = mockDb.classrooms.findIndex(c => c.id === id);
        if (idx > -1) {
          mockDb.classrooms[idx] = { ...mockDb.classrooms[idx], ...item };
          mockDb.saveAll();
          return mockDb.classrooms[idx];
        }
        throw new Error('Classroom not found');
      }
    )
  },

  subjects: {
    getAll: async () => handleApiCall(() => axiosClient.get('/subjects'), () => mockDb.subjects),
    create: async (item: Omit<Subject, 'id'>) => handleApiCall(
      () => axiosClient.post('/subjects', item),
      () => {
        const newItem = { ...item, id: `sub-${Date.now()}` };
        mockDb.subjects.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Subject', module: 'Academics', details: `Created subject ${item.name}` }
    )
  },

  teachers: {
    getAll: async () => handleApiCall(() => axiosClient.get('/teachers'), () => mockDb.teachers),
    create: async (item: Omit<Teacher, 'id' | 'employeeId'>) => handleApiCall(
      () => axiosClient.post('/teachers', item),
      () => {
        const employeeId = `EMP-T-${String(mockDb.teachers.length + 1).padStart(3, '0')}`;
        const newTeacher: Teacher = { ...item, id: `teach-${Date.now()}`, employeeId };
        
        // Also create a matching login user
        const newUsr: User = {
          id: `usr-${Date.now()}`,
          username: `${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}`,
          email: item.email,
          role: 'TEACHER',
          firstName: item.firstName,
          lastName: item.lastName,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(newUsr);
        mockDb.teachers.push(newTeacher);
        mockDb.saveAll();
        return newTeacher;
      },
      { action: 'Create Teacher', module: 'Staff', details: `Added teacher: ${item.firstName} ${item.lastName}` }
    ),
    update: async (id: string, item: Partial<Teacher>) => handleApiCall(
      () => axiosClient.put(`/teachers/${id}`, item),
      () => {
        const idx = mockDb.teachers.findIndex(t => t.id === id);
        if (idx > -1) {
          mockDb.teachers[idx] = { ...mockDb.teachers[idx], ...item };
          mockDb.saveAll();
          return mockDb.teachers[idx];
        }
        throw new Error('Teacher not found');
      }
    )
  },

  staff: {
    getAll: async () => handleApiCall(() => axiosClient.get('/staff'), () => mockDb.staff),
    create: async (item: Omit<Staff, 'id' | 'employeeId'>) => handleApiCall(
      () => axiosClient.post('/staff', item),
      () => {
        const prefix = item.role === 'ACCOUNTANT' ? 'EMP-A-' : 'EMP-L-';
        const employeeId = `${prefix}${String(mockDb.staff.length + 1).padStart(3, '0')}`;
        const newStaff: Staff = { ...item, id: `staff-${Date.now()}`, employeeId };
        
        // Also create matching login user
        const newUsr: User = {
          id: `usr-${Date.now()}`,
          username: `${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}`,
          email: item.email,
          role: item.role,
          firstName: item.firstName,
          lastName: item.lastName,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(newUsr);
        mockDb.staff.push(newStaff);
        mockDb.saveAll();
        return newStaff;
      },
      { action: 'Create Staff', module: 'Staff', details: `Added staff: ${item.firstName} ${item.lastName} as ${item.role}` }
    )
  },

  parents: {
    getAll: async () => handleApiCall(() => axiosClient.get('/parents'), () => mockDb.parents),
    create: async (item: Omit<Parent, 'id' | 'parentId'>) => handleApiCall(
      () => axiosClient.post('/parents', item),
      () => {
        const parentId = `PAR-2026-${String(mockDb.parents.length + 1).padStart(3, '0')}`;
        const newParent: Parent = { ...item, id: `parent-${Date.now()}`, parentId };
        
        // Create user
        const newUsr: User = {
          id: `usr-${Date.now()}`,
          username: `parent.${item.firstName.toLowerCase()}`,
          email: item.email,
          role: 'PARENT',
          firstName: item.firstName,
          lastName: item.lastName,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(newUsr);
        mockDb.parents.push(newParent);
        mockDb.saveAll();
        return newParent;
      },
      { action: 'Create Parent', module: 'Parents', details: `Added parent: ${item.firstName} ${item.lastName}` }
    )
  },

  students: {
    getAll: async () => handleApiCall(() => axiosClient.get('/students'), () => mockDb.students),
    create: async (item: Omit<Student, 'id' | 'studentId'>) => handleApiCall(
      () => axiosClient.post('/students', item),
      () => {
        const studentId = `STD-2026-${String(mockDb.students.length + 1).padStart(3, '0')}`;
        const newStudent: Student = { ...item, id: `stud-${Date.now()}`, studentId };
        
        // Create login user
        const newUsr: User = {
          id: `usr-${Date.now()}`,
          username: `std.${item.firstName.toLowerCase()}`,
          email: item.email || `${item.firstName.toLowerCase()}@school.edu`,
          role: 'STUDENT',
          firstName: item.firstName,
          lastName: item.lastName,
          status: 'active',
          createdAt: new Date().toISOString()
        };
        mockDb.users.push(newUsr);
        mockDb.students.push(newStudent);
        mockDb.saveAll();
        return newStudent;
      },
      { action: 'Create Student', module: 'Students', details: `Registered student ${item.firstName} ${item.lastName}` }
    ),
    update: async (id: string, item: Partial<Student>) => handleApiCall(
      () => axiosClient.put(`/students/${id}`, item),
      () => {
        const idx = mockDb.students.findIndex(s => s.id === id);
        if (idx > -1) {
          mockDb.students[idx] = { ...mockDb.students[idx], ...item };
          mockDb.saveAll();
          return mockDb.students[idx];
        }
        throw new Error('Student not found');
      }
    ),
    promote: async (id: string, targetClassroomId: string, targetGradeLevelId: string) => handleApiCall(
      () => axiosClient.post(`/students/${id}/promote`, { targetClassroomId, targetGradeLevelId }),
      () => {
        const idx = mockDb.students.findIndex(s => s.id === id);
        if (idx > -1) {
          const oldClass = mockDb.students[idx].classroomId;
          mockDb.students[idx].classroomId = targetClassroomId;
          mockDb.students[idx].gradeLevelId = targetGradeLevelId;
          mockDb.saveAll();
          return mockDb.students[idx];
        }
        throw new Error('Student not found');
      },
      { action: 'Promote Student', module: 'Students', details: `Promoted student ID ${id} to class ${targetClassroomId}` }
    )
  },

  timetable: {
    getAll: async () => handleApiCall(() => axiosClient.get('/timetable'), () => mockDb.timetableEntries),
    create: async (item: Omit<TimetableEntry, 'id'>) => handleApiCall(
      () => axiosClient.post('/timetable', item),
      () => {
        const newItem = { ...item, id: `tt-${Date.now()}` };
        mockDb.timetableEntries.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Add Timetable Slot', module: 'Timetables', details: `Added class slot for ${item.classroomId}` }
    ),
    delete: async (id: string) => handleApiCall(
      () => axiosClient.delete(`/timetable/${id}`),
      () => {
        mockDb.timetableEntries = mockDb.timetableEntries.filter(t => t.id !== id);
        mockDb.saveAll();
        return { success: true };
      }
    )
  },

  attendance: {
    getStudentAttendance: async (date: string, classroomId: string) => handleApiCall(
      () => axiosClient.get(`/attendance/students?date=${date}&classroomId=${classroomId}`),
      () => {
        // Find students in classroom
        const classStudents = mockDb.students.filter(s => s.classroomId === classroomId);
        // Find existing attendance
        return classStudents.map(student => {
          const record = mockDb.attendanceRecords.find(r => r.studentId === student.id && r.date === date);
          return {
            student,
            record: record || { id: '', studentId: student.id, date, status: 'present' }
          };
        });
      }
    ),
    saveStudentAttendance: async (records: AttendanceRecord[]) => handleApiCall(
      () => axiosClient.post('/attendance/students', records),
      () => {
        records.forEach(newRec => {
          const existingIdx = mockDb.attendanceRecords.findIndex(r => r.studentId === newRec.studentId && r.date === newRec.date);
          if (existingIdx > -1) {
            mockDb.attendanceRecords[existingIdx] = { ...mockDb.attendanceRecords[existingIdx], ...newRec };
          } else {
            mockDb.attendanceRecords.push({ ...newRec, id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
          }
        });
        mockDb.saveAll();
        return { success: true };
      },
      { action: 'Save Student Attendance', module: 'Attendance', details: `Logged attendance updates for ${records.length} students` }
    ),
    getStaffAttendance: async (date: string) => handleApiCall(
      () => axiosClient.get(`/attendance/staff?date=${date}`),
      () => {
        const teachers = mockDb.teachers;
        const otherStaff = mockDb.staff;
        const allPersonnel = [
          ...teachers.map(t => ({ id: t.id, name: `${t.firstName} ${t.lastName}`, role: 'TEACHER' })),
          ...otherStaff.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: s.role }))
        ];
        return allPersonnel.map(person => {
          const record = mockDb.staffAttendance.find(r => r.staffId === person.id && r.date === date);
          return {
            person,
            record: record || { id: '', staffId: person.id, date, status: 'present' }
          };
        });
      }
    ),
    saveStaffAttendance: async (records: StaffAttendance[]) => handleApiCall(
      () => axiosClient.post('/attendance/staff', records),
      () => {
        records.forEach(newRec => {
          const existingIdx = mockDb.staffAttendance.findIndex(r => r.staffId === newRec.staffId && r.date === newRec.date);
          if (existingIdx > -1) {
            mockDb.staffAttendance[existingIdx] = { ...mockDb.staffAttendance[existingIdx], ...newRec };
          } else {
            mockDb.staffAttendance.push({ ...newRec, id: `satt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
          }
        });
        mockDb.saveAll();
        return { success: true };
      },
      { action: 'Save Staff Attendance', module: 'Attendance', details: `Logged staff attendance update for ${records.length} personnel` }
    )
  },

  assignments: {
    getAll: async () => handleApiCall(() => axiosClient.get('/assignments'), () => mockDb.assignments),
    create: async (item: Omit<Assignment, 'id'>) => handleApiCall(
      () => axiosClient.post('/assignments', item),
      () => {
        const newItem = { ...item, id: `asg-${Date.now()}` };
        mockDb.assignments.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Assignment', module: 'Assignments', details: `Published assignment ${item.title}` }
    ),
    getSubmissions: async (assignmentId: string) => handleApiCall(
      () => axiosClient.get(`/assignments/${assignmentId}/submissions`),
      () => mockDb.assignmentSubmissions.filter(s => s.assignmentId === assignmentId)
    ),
    submitAssignment: async (item: Omit<AssignmentSubmission, 'id' | 'submissionDate'>) => handleApiCall(
      () => axiosClient.post(`/assignments/${item.assignmentId}/submit`, item),
      () => {
        const newItem: AssignmentSubmission = {
          ...item,
          id: `subm-${Date.now()}`,
          submissionDate: new Date().toISOString()
        };
        mockDb.assignmentSubmissions.push(newItem);
        mockDb.saveAll();
        return newItem;
      }
    ),
    gradeSubmission: async (submissionId: string, score: number, feedback?: string) => handleApiCall(
      () => axiosClient.post(`/assignments/submissions/${submissionId}/grade`, { score, feedback }),
      () => {
        const idx = mockDb.assignmentSubmissions.findIndex(s => s.id === submissionId);
        if (idx > -1) {
          mockDb.assignmentSubmissions[idx].score = score;
          mockDb.assignmentSubmissions[idx].feedback = feedback;
          mockDb.assignmentSubmissions[idx].status = 'graded';
          mockDb.saveAll();
          return mockDb.assignmentSubmissions[idx];
        }
        throw new Error('Submission not found');
      }
    )
  },

  exams: {
    getAll: async () => handleApiCall(() => axiosClient.get('/exams'), () => mockDb.exams),
    create: async (item: Omit<Exam, 'id'>) => handleApiCall(
      () => axiosClient.post('/exams', item),
      () => {
        const newItem = { ...item, id: `exam-${Date.now()}` };
        mockDb.exams.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Exam', module: 'Examinations', details: `Scheduled exam: ${item.name}` }
    ),
    getResultsByExam: async (examId: string) => handleApiCall(
      () => axiosClient.get(`/exams/${examId}/results`),
      () => mockDb.examResults.filter(r => r.examId === examId)
    ),
    saveExamResults: async (examId: string, results: Omit<ExamResult, 'id'>[]) => handleApiCall(
      () => axiosClient.post(`/exams/${examId}/results`, results),
      () => {
        results.forEach(res => {
          const existingIdx = mockDb.examResults.findIndex(r => r.examId === examId && r.studentId === res.studentId && r.subjectId === res.subjectId);
          if (existingIdx > -1) {
            mockDb.examResults[existingIdx] = { ...mockDb.examResults[existingIdx], ...res };
          } else {
            mockDb.examResults.push({ ...res, id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` });
          }
        });
        mockDb.saveAll();
        return { success: true };
      },
      { action: 'Record Exam Results', module: 'Examinations', details: `Logged ${results.length} student scores for exam ID ${examId}` }
    ),
    getGradingScales: async () => handleApiCall(() => axiosClient.get('/grading-scales'), () => mockDb.gradingScales),
    getReportCards: async (studentId?: string) => handleApiCall(
      () => axiosClient.get('/report-cards'),
      () => studentId ? mockDb.reportCards.filter(rc => rc.studentId === studentId) : mockDb.reportCards
    ),
    publishReportCard: async (studentId: string, gpa: number, comments?: string) => handleApiCall(
      () => axiosClient.post('/report-cards', { studentId, gpa, comments }),
      () => {
        const newCard: ReportCard = {
          id: `rc-${studentId}-${Date.now()}`,
          studentId,
          academicYearId: mockDb.schoolSettings.currentAcademicYearId,
          termId: mockDb.schoolSettings.currentTermId,
          gpa,
          comments,
          status: 'published',
          approvedBy: 'usr-principal'
        };
        mockDb.reportCards.push(newCard);
        mockDb.saveAll();
        return newCard;
      },
      { action: 'Generate Report Card', module: 'Report Cards', details: `Published report card for student ID ${studentId}` }
    )
  },

  fees: {
    getTypes: async () => handleApiCall(() => axiosClient.get('/fees/types'), () => mockDb.feeTypes),
    createType: async (item: Omit<FeeType, 'id'>) => handleApiCall(
      () => axiosClient.post('/fees/types', item),
      () => {
        const newItem = { ...item, id: `ft-${Date.now()}` };
        mockDb.feeTypes.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Create Fee Type', module: 'Fees', details: `Added fee type ${item.name}` }
    ),
    getInvoices: async () => handleApiCall(() => axiosClient.get('/fees/invoices'), () => mockDb.studentInvoices),
    createInvoice: async (item: Omit<StudentInvoice, 'id' | 'invoiceNumber' | 'paidAmount' | 'status'>) => handleApiCall(
      () => axiosClient.post('/fees/invoices', item),
      () => {
        const invoiceNumber = `INV-2026-${String(mockDb.studentInvoices.length + 1).padStart(4, '0')}`;
        const newInvoice: StudentInvoice = {
          ...item,
          id: `inv-${Date.now()}`,
          invoiceNumber,
          paidAmount: 0,
          status: 'unpaid'
        };
        mockDb.studentInvoices.push(newInvoice);
        mockDb.saveAll();
        return newInvoice;
      },
      { action: 'Create Invoice', module: 'Fees', details: `Billed student for $${item.totalAmount}` }
    ),
    payInvoice: async (invoiceId: string, amount: number, paymentMethod: any, txnId?: string) => handleApiCall(
      () => axiosClient.post(`/fees/invoices/${invoiceId}/payments`, { amount, paymentMethod, transactionId: txnId }),
      () => {
        const idx = mockDb.studentInvoices.findIndex(inv => inv.id === invoiceId);
        if (idx > -1) {
          const inv = mockDb.studentInvoices[idx];
          const newPaid = inv.paidAmount + amount;
          inv.paidAmount = Math.min(inv.totalAmount, newPaid);
          inv.status = inv.paidAmount >= inv.totalAmount ? 'paid' : 'partial';

          const newPayment: FeePayment = {
            id: `pay-${Date.now()}`,
            invoiceId,
            amount,
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod,
            transactionId: txnId,
            receivedBy: 'Fartun Osman'
          };
          mockDb.feePayments.push(newPayment);
          mockDb.saveAll();
          return { invoice: inv, payment: newPayment };
        }
        throw new Error('Invoice not found');
      },
      { action: 'Process Fee Payment', module: 'Fees', details: `Received payment of $${amount} for invoice ID ${invoiceId}` }
    )
  },

  finance: {
    getExpenses: async () => handleApiCall(() => axiosClient.get('/finance/expenses'), () => mockDb.expenses),
    addExpense: async (item: Omit<Expense, 'id'>) => handleApiCall(
      () => axiosClient.post('/finance/expenses', item),
      () => {
        const newItem = { ...item, id: `exp-${Date.now()}` };
        mockDb.expenses.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Add Expense Record', module: 'Finance', details: `Logged expense of $${item.amount} for ${item.category}` }
    ),
    getIncome: async () => handleApiCall(() => axiosClient.get('/finance/income'), () => mockDb.incomeRecords),
    addIncome: async (item: Omit<IncomeRecord, 'id'>) => handleApiCall(
      () => axiosClient.post('/finance/income', item),
      () => {
        const newItem = { ...item, id: `inc-${Date.now()}` };
        mockDb.incomeRecords.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Add Income Record', module: 'Finance', details: `Logged miscellaneous income of $${item.amount} from ${item.source}` }
    )
  },

  library: {
    getCategories: async () => handleApiCall(() => axiosClient.get('/library/categories'), () => mockDb.bookCategories),
    createCategory: async (name: string) => handleApiCall(
      () => axiosClient.post('/library/categories', { name }),
      () => {
        const newItem = { id: `cat-${Date.now()}`, name };
        mockDb.bookCategories.push(newItem);
        mockDb.saveAll();
        return newItem;
      }
    ),
    getBooks: async () => handleApiCall(() => axiosClient.get('/library/books'), () => mockDb.books),
    createBook: async (item: Omit<Book, 'id' | 'availableCopies'>) => handleApiCall(
      () => axiosClient.post('/library/books', item),
      () => {
        const newItem: Book = { ...item, id: `bk-${Date.now()}`, availableCopies: item.totalCopies };
        mockDb.books.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Register Library Book', module: 'Library', details: `Added catalog book "${item.title}"` }
    ),
    getLoans: async () => handleApiCall(() => axiosClient.get('/library/loans'), () => mockDb.bookLoans),
    createLoan: async (item: Omit<BookLoan, 'id' | 'status'>) => handleApiCall(
      () => axiosClient.post('/library/loans', item),
      () => {
        const bookIdx = mockDb.books.findIndex(b => b.id === item.bookId);
        if (bookIdx > -1) {
          if (mockDb.books[bookIdx].availableCopies <= 0) {
            throw new Error('No available copies of this volume currently.');
          }
          mockDb.books[bookIdx].availableCopies--;
        }
        const newLoan: BookLoan = { ...item, id: `loan-${Date.now()}`, status: 'borrowed' };
        mockDb.bookLoans.push(newLoan);
        mockDb.saveAll();
        return newLoan;
      },
      { action: 'Issue Library Loan', module: 'Library', details: `Issued book ID ${item.bookId} to student ID ${item.studentId}` }
    ),
    returnBook: async (loanId: string) => handleApiCall(
      () => axiosClient.post(`/library/loans/${loanId}/return`),
      () => {
        const idx = mockDb.bookLoans.findIndex(l => l.id === loanId);
        if (idx > -1) {
          const loan = mockDb.bookLoans[idx];
          if (loan.status === 'borrowed') {
            loan.status = 'returned';
            loan.returnDate = new Date().toISOString().split('T')[0];
            const bookIdx = mockDb.books.findIndex(b => b.id === loan.bookId);
            if (bookIdx > -1) {
              mockDb.books[bookIdx].availableCopies++;
            }
            mockDb.saveAll();
            return loan;
          }
        }
        throw new Error('Loan already returned or not found');
      },
      { action: 'Return Library Book', module: 'Library', details: `Checked in returned book from loan ID ${loanId}` }
    )
  },

  announcements: {
    getAll: async () => handleApiCall(() => axiosClient.get('/announcements'), () => mockDb.announcements),
    create: async (item: Omit<Announcement, 'id' | 'createdAt' | 'createdBy'>) => handleApiCall(
      () => axiosClient.post('/announcements', item),
      () => {
        const author = activeSimulatedUser ? `${activeSimulatedUser.firstName} ${activeSimulatedUser.lastName}` : 'Administrator';
        const newItem: Announcement = {
          ...item,
          id: `ann-${Date.now()}`,
          createdBy: author,
          createdAt: new Date().toISOString()
        };
        mockDb.announcements.unshift(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Post Announcement', module: 'Announcements', details: `Created public notice: ${item.title}` }
    )
  },

  events: {
    getAll: async () => handleApiCall(() => axiosClient.get('/events'), () => mockDb.schoolEvents),
    create: async (item: Omit<SchoolEvent, 'id'>) => handleApiCall(
      () => axiosClient.post('/events', item),
      () => {
        const newItem = { ...item, id: `evt-${Date.now()}` };
        mockDb.schoolEvents.push(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Schedule Event', module: 'Events', details: `Scheduled calendar event: ${item.title}` }
    )
  },

  discipline: {
    getAll: async () => handleApiCall(() => axiosClient.get('/discipline'), () => mockDb.disciplineIncidents),
    create: async (item: Omit<DisciplineIncident, 'id' | 'reportedBy' | 'status'>) => handleApiCall(
      () => axiosClient.post('/discipline', item),
      () => {
        const author = activeSimulatedUser ? `${activeSimulatedUser.firstName} ${activeSimulatedUser.lastName}` : 'Staff Member';
        const newItem: DisciplineIncident = {
          ...item,
          id: `disc-${Date.now()}`,
          reportedBy: author,
          status: 'pending'
        };
        mockDb.disciplineIncidents.unshift(newItem);
        mockDb.saveAll();
        return newItem;
      },
      { action: 'Report Discipline Incident', module: 'Discipline', details: `Reported behavior incident on student ID ${item.studentId}` }
    ),
    resolve: async (id: string, actionTaken: string) => handleApiCall(
      () => axiosClient.post(`/discipline/${id}/resolve`, { actionTaken }),
      () => {
        const idx = mockDb.disciplineIncidents.findIndex(d => d.id === id);
        if (idx > -1) {
          mockDb.disciplineIncidents[idx].actionTaken = actionTaken;
          mockDb.disciplineIncidents[idx].status = 'resolved';
          mockDb.saveAll();
          return mockDb.disciplineIncidents[idx];
        }
        throw new Error('Incident report not found');
      },
      { action: 'Resolve Discipline Case', module: 'Discipline', details: `Resolved incident case ID ${id}` }
    )
  },

  auditLogs: {
    getAll: async () => handleApiCall(() => axiosClient.get('/audit-logs'), () => mockDb.auditLogs)
  },

  backup: {
    getAll: async () => handleApiCall(() => axiosClient.get('/backups'), () => mockDb.backups),
    triggerBackup: async () => handleApiCall(
      () => axiosClient.post('/backups/trigger'),
      () => {
        const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
        const fileName = `sms_backup_${timestamp}.sql`;
        const sizeKb = Math.floor(Math.random() * 500) + 18400; // ~18.4 to 18.9 MB
        const fileSize = `${(sizeKb / 1000).toFixed(1)} MB`;
        
        const newBackup: DatabaseBackup = {
          id: `bak-${Date.now()}`,
          fileName,
          fileSize,
          status: 'completed',
          createdAt: new Date().toISOString()
        };
        mockDb.backups.unshift(newBackup);
        mockDb.saveAll();
        return newBackup;
      },
      { action: 'Generate Database Backup', module: 'System', details: 'Manual database sql backup snapshot created offline.' }
    )
  }
};
export default api;
