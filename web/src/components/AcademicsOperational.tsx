import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Award, BookOpenCheck, CalendarDays, ClipboardList, GraduationCap, Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';

interface TeacherAssignmentLink {
  id: number | string;
  classroom_id: number | string;
  subject_id: number | string;
  academic_year_id?: number | string | null;
  term_id?: number | string | null;
  classroom_name?: string | null;
  section_name?: string | null;
  subject_name?: string | null;
  subject_code?: string | null;
}

interface TeacherWorkspace {
  teacherId: number | string;
  assigned_classrooms: number;
  assigned_subjects: number;
  active_assignments: number;
  assignedClasses: Array<{ id: number | string; name: string; section_name?: string | null }>;
  assignedSubjects: Array<{ id: number | string; name: string; code: string }>;
  assignmentLinks: TeacherAssignmentLink[];
  assignedStudents: Array<{
    id: number | string;
    student_id: number | string;
    classroom_id: number | string;
    academic_year_id: number | string;
    enrollment_status?: string | null;
    admission_number: string;
    first_name: string;
    last_name: string;
  }>;
  timetable: Array<{ id: number; day_of_week: number; start_time?: string; end_time?: string; classroom_name?: string; subject_name?: string; period_name?: string; room_name?: string }>;
  assignments: Array<{ id: number; classroom_id: number | string; subject_id: number | string; title: string; description?: string | null; due_date?: string; maximum_marks?: number }>;
  submissions: Array<{ id: number; assignment_id: number | string; assignment_title?: string; student_id?: number | string; submitted_at?: string; submission_status?: string; marks_obtained?: number | null }>;
  upcomingExams: Array<{ id: number; name: string; start_date?: string; end_date?: string; status?: string; exam_date?: string; classroom_name?: string; section_name?: string | null; subject_name?: string; subject_code?: string; subject_start_time?: string; subject_end_time?: string }>;
  reportCards: Array<{ id: number; student_id: number | string; average_percentage?: number; overall_grade?: string; admission_number?: string; first_name?: string; last_name?: string; classroom_name?: string; section_name?: string | null; class_position?: number | string | null }>;
}

interface StudentRecord {
  id: number | string;
  admission_number: string;
  first_name: string;
  last_name: string;
}

interface EnrollmentRecord {
  id: number | string;
  student_id: number | string;
  classroom_id: number | string;
  academic_year_id: number | string;
  enrollment_status: string;
  created_at?: string;
  updated_at?: string;
}

interface AttendanceRow {
  id?: number | string;
  attendance_date?: string;
  student_id: number | string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'SICK';
}

interface ExamMarkDraft {
  marksObtained: string;
  remarks: string;
  isAbsent: boolean;
}

interface AdminAcademicWorkspace {
  classrooms: Array<{
    id: number | string;
    grade_level_id?: number | string | null;
    name: string;
    section_name?: string | null;
    grade_level_name?: string | null;
    capacity?: number | null;
    is_active?: boolean | null;
  }>;
  teacherAssignments: Array<{
    id: number | string;
    teacher_id?: number | string | null;
    classroom_id?: number | string | null;
    subject_id?: number | string | null;
    academic_year_id?: number | string | null;
    term_id?: number | string | null;
    classroom_name?: string | null;
    section_name?: string | null;
    subject_name?: string | null;
    subject_code?: string | null;
    teacher_name?: string | null;
    academic_year_name?: string | null;
    term_name?: string | null;
  }>;
  classSubjects: Array<{
    id: number | string;
    classroom_id?: number | string | null;
    subject_id?: number | string | null;
    academic_year_id?: number | string | null;
    classroom_name?: string | null;
    subject_name?: string | null;
    academic_year_name?: string | null;
    is_compulsory?: boolean | null;
  }>;
  timetable: Array<{
    id: number | string;
    academic_year_id?: number | string | null;
    term_id?: number | string | null;
    classroom_id?: number | string | null;
    subject_id?: number | string | null;
    teacher_id?: number | string | null;
    period_id?: number | string | null;
    day_of_week: number;
    start_time?: string | null;
    end_time?: string | null;
    classroom_name?: string | null;
    subject_name?: string | null;
    teacher_name?: string | null;
    period_name?: string | null;
    room_name?: string | null;
  }>;
  attendanceSessions: Array<{
    id: number | string;
    attendance_date?: string | null;
    classroom_name?: string | null;
    total_records?: number | null;
    present_count?: number | null;
    absent_count?: number | null;
    late_count?: number | null;
    excused_count?: number | null;
    sick_count?: number | null;
  }>;
  assignments: Array<{
    id: number | string;
    academic_year_id?: number | string | null;
    term_id?: number | string | null;
    classroom_id?: number | string | null;
    subject_id?: number | string | null;
    teacher_id?: number | string | null;
    title: string;
    description?: string | null;
    assigned_date?: string | null;
    classroom_name?: string | null;
    subject_name?: string | null;
    due_date?: string | null;
    maximum_marks?: number | null;
    status?: string | null;
  }>;
  exams: Array<{
    id: number | string;
    academic_year_id?: number | string | null;
    term_id?: number | string | null;
    exam_type_id?: number | string | null;
    name: string;
    exam_type_name?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    status?: string | null;
  }>;
  examSubjects: Array<{
    id: number | string;
    exam_id?: number | string | null;
    classroom_id?: number | string | null;
    subject_id?: number | string | null;
    exam_date?: string | null;
    start_time?: string | null;
    end_time?: string | null;
    maximum_marks?: number | null;
    pass_marks?: number | null;
  }>;
  reportCards: Array<{
    id: number | string;
    first_name?: string | null;
    last_name?: string | null;
    classroom_name?: string | null;
    average_percentage?: number | null;
    overall_grade?: string | null;
    class_position?: number | string | null;
  }>;
  teachers: Array<{
    id: number | string;
    first_name?: string | null;
    last_name?: string | null;
    teacher_number?: string | null;
    email?: string | null;
  }>;
  subjects: Array<{
    id: number | string;
    name: string;
    code?: string | null;
  }>;
  periods: Array<{
    id: number | string;
    name: string;
    start_time?: string | null;
    end_time?: string | null;
    period_order?: number | null;
  }>;
  examTypes: Array<{
    id: number | string;
    name: string;
  }>;
  academicYears: Array<{
    id: number | string;
    name: string;
    is_current?: boolean | null;
    status?: string | null;
  }>;
  terms: Array<{
    id: number | string;
    name: string;
    academic_year_id?: number | string | null;
    is_current?: boolean | null;
    status?: string | null;
  }>;
}

const today = new Date().toISOString().slice(0, 10);

const dayName = (day: number) => ['Unknown', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][day] || `Day ${day}`;

const getApiErrorMessage = (error: any, fallback: string) => {
  const fieldErrors = error?.response?.data?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors
      .map((item: { field?: string; message?: string }) => `${item.field || 'field'}: ${item.message || 'Invalid value'}`)
      .join(' | ');
  }

  return error?.response?.data?.message || fallback;
};

const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const DEFAULT_TIMETABLE_PERIODS = [
  { name: 'Period 1', startTime: '07:30', endTime: '08:15', periodOrder: 1, isBreak: false },
  { name: 'Period 2', startTime: '08:15', endTime: '09:00', periodOrder: 2, isBreak: false },
  { name: 'Break', startTime: '09:00', endTime: '09:20', periodOrder: 3, isBreak: true },
  { name: 'Period 3', startTime: '09:20', endTime: '10:05', periodOrder: 4, isBreak: false },
  { name: 'Period 4', startTime: '10:05', endTime: '10:50', periodOrder: 5, isBreak: false },
  { name: 'Period 5', startTime: '10:50', endTime: '11:35', periodOrder: 6, isBreak: false },
  { name: 'Period 6', startTime: '11:35', endTime: '12:20', periodOrder: 7, isBreak: false },
] as const;

const isActiveEnrollmentStatus = (value?: string | null) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return true;
  return !['INACTIVE', 'COMPLETED', 'TRANSFERRED', 'WITHDRAWN', 'CANCELLED'].includes(normalized);
};

const attendanceButtonClass = (active: boolean, status: AttendanceRow['status']) => {
  if (active) {
    if (status === 'PRESENT') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'ABSENT') return 'border-rose-200 bg-rose-50 text-rose-700';
    if (status === 'LATE') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (status === 'EXCUSED') return 'border-sky-200 bg-sky-50 text-sky-700';
    return 'border-violet-200 bg-violet-50 text-violet-700';
  }

  return 'border-slate-200 bg-white text-slate-600';
};

export default function AcademicsOperational() {
  const { currentUser, activeTab, openConfirm } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [workspace, setWorkspace] = useState<TeacherWorkspace | null>(null);
  const [adminWorkspace, setAdminWorkspace] = useState<AdminAcademicWorkspace | null>(null);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentRecord[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  const [currentTermId, setCurrentTermId] = useState<number | null>(null);

  const [selectedClassroomId, setSelectedClassroomId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(today);
  const [attendanceStatusByStudent, setAttendanceStatusByStudent] = useState<Record<number, AttendanceRow['status']>>({});
  const [existingAttendanceSessionId, setExistingAttendanceSessionId] = useState<number | null>(null);

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentClassroomId, setAssignmentClassroomId] = useState('');
  const [assignmentSubjectId, setAssignmentSubjectId] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState(today);
  const [assignmentMaximumMarks, setAssignmentMaximumMarks] = useState('100');

  const [gradingSubmissionId, setGradingSubmissionId] = useState<number | null>(null);
  const [gradingMarks, setGradingMarks] = useState('0');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState('');
  const [examMarksByStudent, setExamMarksByStudent] = useState<Record<string, ExamMarkDraft>>({});
  const [loadingExamResults, setLoadingExamResults] = useState(false);
  const isTeacherRole = currentUser?.role === 'TEACHER';
  const isAdminAcademicRole = currentUser?.role === 'ADMIN' || currentUser?.role === 'PRINCIPAL';
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [editingTimetableId, setEditingTimetableId] = useState<number | null>(null);
  const [timetableForm, setTimetableForm] = useState({
    academicYearId: '',
    termId: '',
    classroomId: '',
    subjectId: '',
    teacherId: '',
    periodId: '',
    dayOfWeek: '1',
    roomName: '',
  });
  const [editingAdminAssignmentId, setEditingAdminAssignmentId] = useState<number | null>(null);
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [showExamSubjectForm, setShowExamSubjectForm] = useState(false);
  const [editingExamSubjectId, setEditingExamSubjectId] = useState<number | null>(null);
  const [attendanceSessionFilterClassroom, setAttendanceSessionFilterClassroom] = useState('');
  const [timetableFilterClassroom, setTimetableFilterClassroom] = useState('');
  const [timetableFilterDay, setTimetableFilterDay] = useState('');
  const [assignmentFilterClassroom, setAssignmentFilterClassroom] = useState('');
  const [examFilterStatus, setExamFilterStatus] = useState('');
  const [attendanceReloadToken, setAttendanceReloadToken] = useState(0);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [examSubjectForm, setExamSubjectForm] = useState({
    examId: '',
    classroomId: '',
    subjectId: '',
    examDate: today,
    startTime: '',
    endTime: '',
    maximumMarks: '100',
    passMarks: '50',
  });

  const loadTeacherWorkspace = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [dashboardResponse, studentsResponse, enrollmentsResponse, yearResponse, termResponse] = await Promise.all([
        axiosClient.get('/dashboard/teacher'),
        axiosClient.get('/students'),
        axiosClient.get('/enrollments'),
        axiosClient.get('/academic-years/current').catch(() => ({ data: { data: null } })),
        axiosClient.get('/terms/current').catch(() => ({ data: { data: null } })),
      ]);

      const dashboardData = dashboardResponse.data?.data || null;
      setWorkspace(dashboardData);
      setStudents(studentsResponse.data?.data || []);
      setEnrollments(enrollmentsResponse.data?.data || []);
      setCurrentAcademicYearId(toNumber(yearResponse.data?.data?.id));
      setCurrentTermId(toNumber(termResponse.data?.data?.id));
      setAdminWorkspace(null);

      if (dashboardData?.assignedClasses?.length) {
        setSelectedClassroomId((prev) => prev || String(dashboardData.assignedClasses[0].id));
        setAssignmentClassroomId((prev) => prev || String(dashboardData.assignedClasses[0].id));
      }
      if (dashboardData?.assignmentLinks?.length) {
        setAssignmentSubjectId((prev) => prev || String(dashboardData.assignmentLinks[0].subject_id));
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load teacher workspace.');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminAcademicWorkspace = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [
        classroomsResponse,
        teacherAssignmentsResponse,
        timetableResponse,
        attendanceSessionsResponse,
        assignmentsResponse,
        examsResponse,
        examSubjectsResponse,
        reportCardsResponse,
        teachersResponse,
        subjectsResponse,
        classSubjectsResponse,
        periodsResponse,
        examTypesResponse,
        currentYearResponse,
        currentTermResponse,
        academicYearsResponse,
        termsResponse,
        studentsResponse,
        enrollmentsResponse,
      ] = await Promise.all([
        axiosClient.get('/classrooms').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/teacher-subject-assignments').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/timetable').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/attendance/sessions').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/assignments').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/exams').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/exam-subjects').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/report-cards').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/teachers').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/subjects').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/class-subjects').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/timetable-periods').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/exam-types').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/academic-years/current').catch(() => ({ data: { data: null } })),
        axiosClient.get('/terms/current').catch(() => ({ data: { data: null } })),
        axiosClient.get('/academic-years').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/terms').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/students').catch(() => ({ data: { data: [] } })),
        axiosClient.get('/enrollments').catch(() => ({ data: { data: [] } })),
      ]);

      setWorkspace(null);
      const availableAcademicYears = academicYearsResponse.data?.data || [];
      const availableTerms = termsResponse.data?.data || [];
      const resolvedAcademicYearId =
        toNumber(currentYearResponse.data?.data?.id) ??
        toNumber(availableAcademicYears.find((item: any) => item.is_current)?.id) ??
        toNumber(availableAcademicYears.find((item: any) => String(item.status || '').toUpperCase() === 'ACTIVE')?.id) ??
        toNumber(availableAcademicYears[0]?.id);
      const resolvedTermId =
        toNumber(currentTermResponse.data?.data?.id) ??
        toNumber(availableTerms.find((item: any) => item.is_current)?.id) ??
        toNumber(
          availableTerms.find(
            (item: any) =>
              (!resolvedAcademicYearId || toNumber(item.academic_year_id) === resolvedAcademicYearId) &&
              String(item.status || '').toUpperCase() === 'ACTIVE',
          )?.id,
        ) ??
        toNumber(availableTerms.find((item: any) => !resolvedAcademicYearId || toNumber(item.academic_year_id) === resolvedAcademicYearId)?.id) ??
        toNumber(availableTerms[0]?.id);

      setCurrentAcademicYearId(resolvedAcademicYearId);
      setCurrentTermId(resolvedTermId);
      setStudents(studentsResponse.data?.data || []);
      setEnrollments(enrollmentsResponse.data?.data || []);
      setAdminWorkspace({
        classrooms: classroomsResponse.data?.data || [],
        teacherAssignments: teacherAssignmentsResponse.data?.data || [],
        classSubjects: classSubjectsResponse.data?.data || [],
        timetable: timetableResponse.data?.data || [],
        attendanceSessions: attendanceSessionsResponse.data?.data || [],
        assignments: assignmentsResponse.data?.data || [],
        exams: examsResponse.data?.data || [],
        examSubjects: examSubjectsResponse.data?.data || [],
        reportCards: reportCardsResponse.data?.data || [],
        teachers: teachersResponse.data?.data || [],
        subjects: subjectsResponse.data?.data || [],
        periods: periodsResponse.data?.data || [],
        examTypes: examTypesResponse.data?.data || [],
        academicYears: availableAcademicYears,
        terms: availableTerms,
      });
      setSelectedClassroomId((prev) => prev || String((classroomsResponse.data?.data || [])[0]?.id || ''));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load academic operations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdminAcademicRole || !adminWorkspace) return;

    setTimetableForm((prev) => ({
      academicYearId: prev.academicYearId || String(currentAcademicYearId || ''),
      termId: prev.termId || String(currentTermId || ''),
      classroomId: prev.classroomId || String(adminWorkspace.classrooms[0]?.id || ''),
      subjectId: prev.subjectId || String(adminWorkspace.classSubjects[0]?.subject_id || adminWorkspace.subjects[0]?.id || ''),
      teacherId: prev.teacherId || String(adminWorkspace.teachers[0]?.id || ''),
      periodId: prev.periodId || String(adminWorkspace.periods[0]?.id || ''),
      dayOfWeek: prev.dayOfWeek || '1',
      roomName: prev.roomName || '',
    }));

    if (!assignmentClassroomId) {
      setAssignmentClassroomId(String(adminWorkspace.classrooms[0]?.id || ''));
    }
    if (!assignmentSubjectId) {
      setAssignmentSubjectId(String(adminWorkspace.classSubjects[0]?.subject_id || adminWorkspace.subjects[0]?.id || ''));
    }
  }, [adminWorkspace, assignmentClassroomId, assignmentSubjectId, currentAcademicYearId, currentTermId, isAdminAcademicRole]);

  const adminAssignmentLinksForClassroom = useMemo(() => {
    if (!adminWorkspace?.teacherAssignments?.length) return [];
    if (!assignmentClassroomId) return adminWorkspace.teacherAssignments;
    return adminWorkspace.teacherAssignments.filter((item) => String(item.classroom_id) === String(assignmentClassroomId));
  }, [adminWorkspace?.teacherAssignments, assignmentClassroomId]);

  const adminClassSubjectsForAssignmentClassroom = useMemo(() => {
    if (!adminWorkspace?.classSubjects?.length) return [];
    if (!assignmentClassroomId) return adminWorkspace.classSubjects;
    return adminWorkspace.classSubjects.filter((item) => String(item.classroom_id) === String(assignmentClassroomId));
  }, [adminWorkspace?.classSubjects, assignmentClassroomId]);

  const adminAssignmentSubjectOptions = useMemo(() => {
    if (!adminWorkspace?.subjects?.length) return [];
    const linkedSubjectIds = new Set(adminClassSubjectsForAssignmentClassroom.map((item) => String(item.subject_id)));
    if (!linkedSubjectIds.size) return [];
    return adminWorkspace.subjects.filter((item) => linkedSubjectIds.has(String(item.id)));
  }, [adminClassSubjectsForAssignmentClassroom, adminWorkspace?.subjects]);

  const adminTimetableLinksForClassroom = useMemo(() => {
    if (!adminWorkspace?.teacherAssignments?.length) return [];
    if (!timetableForm.classroomId) return adminWorkspace.teacherAssignments;
    return adminWorkspace.teacherAssignments.filter((item) => String(item.classroom_id) === String(timetableForm.classroomId));
  }, [adminWorkspace?.teacherAssignments, timetableForm.classroomId]);

  const adminClassSubjectsForTimetableClassroom = useMemo(() => {
    if (!adminWorkspace?.classSubjects?.length) return [];
    if (!timetableForm.classroomId) return adminWorkspace.classSubjects;
    return adminWorkspace.classSubjects.filter((item) => String(item.classroom_id) === String(timetableForm.classroomId));
  }, [adminWorkspace?.classSubjects, timetableForm.classroomId]);

  const adminTimetableSubjectOptions = useMemo(() => {
    if (!adminWorkspace?.subjects?.length) return [];
    const linkedSubjectIds = new Set(adminClassSubjectsForTimetableClassroom.map((item) => String(item.subject_id)));
    if (!linkedSubjectIds.size) return [];
    return adminWorkspace.subjects.filter((item) => linkedSubjectIds.has(String(item.id)));
  }, [adminClassSubjectsForTimetableClassroom, adminWorkspace?.subjects]);

  const adminTimetableTeacherOptions = useMemo(() => {
    if (!adminWorkspace?.teachers?.length) return [];
    const matchingLinks = adminTimetableLinksForClassroom.filter(
      (item) => !timetableForm.subjectId || String(item.subject_id) === String(timetableForm.subjectId),
    );
    const teacherIds = new Set(matchingLinks.map((item) => String(item.teacher_id)));
    if (!teacherIds.size) return [];
    return adminWorkspace.teachers.filter((item) => teacherIds.has(String(item.id)));
  }, [adminTimetableLinksForClassroom, adminWorkspace?.teachers, timetableForm.subjectId]);

  const selectedAdminExam = useMemo(
    () => (adminWorkspace?.exams || []).find((item) => String(item.id) === String(examSubjectForm.examId)) || null,
    [adminWorkspace?.exams, examSubjectForm.examId],
  );

  const getDefaultTimetableSeed = () => {
    const firstLink = adminWorkspace?.teacherAssignments?.[0];
    const firstClassroomId = String(firstLink?.classroom_id || adminWorkspace?.classrooms[0]?.id || '');
    const firstSubjectId = String(firstLink?.subject_id || adminWorkspace?.classSubjects[0]?.subject_id || adminWorkspace?.subjects[0]?.id || '');
    const firstTeacherId = String(firstLink?.teacher_id || adminWorkspace?.teachers[0]?.id || '');
    return {
      academicYearId: String(currentAcademicYearId || firstLink?.academic_year_id || adminWorkspace?.academicYears[0]?.id || ''),
      termId: String(
        currentTermId ||
          firstLink?.term_id ||
          adminWorkspace?.terms.find((item) => toNumber(item.academic_year_id) === currentAcademicYearId)?.id ||
          adminWorkspace?.terms[0]?.id ||
          '',
      ),
      classroomId: firstClassroomId,
      subjectId: firstSubjectId,
      teacherId: firstTeacherId,
      periodId: String(adminWorkspace?.periods[0]?.id || ''),
      dayOfWeek: '1',
      roomName: '',
    };
  };

  const ensureDefaultTimetablePeriods = async () => {
    if ((adminWorkspace?.periods || []).length) {
      return adminWorkspace?.periods || [];
    }

    try {
      await Promise.all(
        DEFAULT_TIMETABLE_PERIODS.map((period) =>
          axiosClient.post('/timetable-periods', period).catch(() => null),
        ),
      );
      const periodsResponse = await axiosClient.get('/timetable-periods').catch(() => ({ data: { data: [] } }));
      const freshPeriods = periodsResponse.data?.data || [];
      setAdminWorkspace((prev) => (prev ? { ...prev, periods: freshPeriods } : prev));
      return freshPeriods;
    } catch (_error) {
      return [];
    }
  };

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    const validClassroomIds = new Set((adminWorkspace?.classrooms || []).map((item) => String(item.id)));
    const firstClassroomId = String(adminWorkspace?.classrooms[0]?.id || '');
    if (!validClassroomIds.size) {
      setTimetableForm((prev) => ({ ...prev, classroomId: '' }));
      return;
    }

    setTimetableForm((prev) => ({
      ...prev,
      classroomId: validClassroomIds.has(String(prev.classroomId)) ? prev.classroomId : firstClassroomId,
    }));
  }, [adminWorkspace?.classrooms, isAdminAcademicRole]);

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    const validPeriodIds = new Set((adminWorkspace?.periods || []).map((item) => String(item.id)));
    const firstPeriodId = String(adminWorkspace?.periods[0]?.id || '');
    if (!validPeriodIds.size) {
      setTimetableForm((prev) => ({ ...prev, periodId: '' }));
      return;
    }

    setTimetableForm((prev) => ({
      ...prev,
      periodId: validPeriodIds.has(String(prev.periodId)) ? prev.periodId : firstPeriodId,
    }));
  }, [adminWorkspace?.periods, isAdminAcademicRole]);

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    if (!adminAssignmentSubjectOptions.length) {
      setAssignmentSubjectId('');
      return;
    }
    if (!adminAssignmentSubjectOptions.some((item) => String(item.id) === String(assignmentSubjectId))) {
      setAssignmentSubjectId(String(adminAssignmentSubjectOptions[0].id));
    }
  }, [adminAssignmentSubjectOptions, assignmentSubjectId, isAdminAcademicRole]);

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    if (!adminTimetableSubjectOptions.length) {
      setTimetableForm((prev) => ({ ...prev, subjectId: '', teacherId: '' }));
      return;
    }

    setTimetableForm((prev) => {
      const nextSubjectId = adminTimetableSubjectOptions.some((item) => String(item.id) === String(prev.subjectId))
        ? prev.subjectId
        : String(adminTimetableSubjectOptions[0].id);
      return { ...prev, subjectId: nextSubjectId };
    });
  }, [adminTimetableSubjectOptions, isAdminAcademicRole]);

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    if (!adminTimetableTeacherOptions.length) {
      setTimetableForm((prev) => ({ ...prev, teacherId: '' }));
      return;
    }

    setTimetableForm((prev) => {
      const nextTeacherId = adminTimetableTeacherOptions.some((item) => String(item.id) === String(prev.teacherId))
        ? prev.teacherId
        : String(adminTimetableTeacherOptions[0].id);
      return { ...prev, teacherId: nextTeacherId };
    });
  }, [adminTimetableTeacherOptions, isAdminAcademicRole]);

  useEffect(() => {
    if (!showExamSubjectForm) return;
    if (!selectedAdminExam) return;

    setExamSubjectForm((prev) => {
      const startDate = String(selectedAdminExam.start_date || '').slice(0, 10);
      const endDate = String(selectedAdminExam.end_date || '').slice(0, 10);
      let nextExamDate = prev.examDate || startDate || today;

      if (startDate && nextExamDate < startDate) {
        nextExamDate = startDate;
      }
      if (endDate && nextExamDate > endDate) {
        nextExamDate = endDate;
      }

      return { ...prev, examDate: nextExamDate };
    });
  }, [selectedAdminExam, showExamSubjectForm]);

  useEffect(() => {
    if (!showExamSubjectForm) return;
    if (!selectedAdminExam) return;

    const startDate = String(selectedAdminExam.start_date || '').slice(0, 10);
    if (!startDate) return;

    setExamSubjectForm((prev) => ({ ...prev, examDate: startDate }));
  }, [examSubjectForm.examId, selectedAdminExam, showExamSubjectForm]);

  const openAdminTimetableForm = async (entry?: AdminAcademicWorkspace['timetable'][number]) => {
    if (entry) {
      handleEditTimetable(entry);
      return;
    }

    const periodOptions = (adminWorkspace?.periods || []).length
      ? adminWorkspace?.periods || []
      : await ensureDefaultTimetablePeriods();

    setEditingTimetableId(null);
    setTimetableForm({
      ...getDefaultTimetableSeed(),
      periodId: String(periodOptions[0]?.id || ''),
    });
    setShowTimetableForm(true);
  };

  const openAdminAssignmentForm = (item?: AdminAcademicWorkspace['assignments'][number]) => {
    if (item) {
      handleEditAdminAssignment(item);
      return;
    }

    setEditingAdminAssignmentId(null);
    const defaultClassroomId = String(adminWorkspace?.classrooms[0]?.id || '');
    const defaultClassSubject =
      adminWorkspace?.classSubjects.find((item) => String(item.classroom_id) === defaultClassroomId) ||
      adminWorkspace?.classSubjects[0];
    const defaultLink =
      adminWorkspace?.teacherAssignments.find((link) => String(link.classroom_id) === defaultClassroomId) ||
      adminWorkspace?.teacherAssignments[0];
    setAssignmentClassroomId(defaultClassroomId || String(defaultLink?.classroom_id || defaultClassSubject?.classroom_id || ''));
    setAssignmentSubjectId(String(defaultClassSubject?.subject_id || defaultLink?.subject_id || adminWorkspace?.subjects[0]?.id || ''));
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentDueDate(today);
    setAssignmentMaximumMarks('100');
    setShowAssignmentForm(true);
  };

  const filteredAttendanceSessions = useMemo(
    () =>
      (adminWorkspace?.attendanceSessions || []).filter(
        (item) =>
          !attendanceSessionFilterClassroom ||
          String(item.classroom_name || '').toLowerCase().includes(attendanceSessionFilterClassroom.toLowerCase()),
      ),
    [adminWorkspace?.attendanceSessions, attendanceSessionFilterClassroom],
  );

  const filteredTimetableEntries = useMemo(
    () =>
      (adminWorkspace?.timetable || []).filter(
        (item) =>
          (!timetableFilterClassroom ||
            String(item.classroom_name || '').toLowerCase().includes(timetableFilterClassroom.toLowerCase())) &&
          (!timetableFilterDay || String(item.day_of_week || '') === String(timetableFilterDay)),
      ),
    [adminWorkspace?.timetable, timetableFilterClassroom, timetableFilterDay],
  );

  const groupedTimetableEntries = useMemo(() => {
    const grouped = filteredTimetableEntries.reduce<Record<string, AdminAcademicWorkspace['timetable']>>((accumulator, item) => {
      const key = String(item.day_of_week || 0);
      if (!accumulator[key]) {
        accumulator[key] = [];
      }
      accumulator[key].push(item);
      return accumulator;
    }, {});

    return Object.entries(grouped)
      .sort(([left], [right]) => Number(left) - Number(right))
      .map(([day, items]) => ({
        day: Number(day),
        items: [...(items as AdminAcademicWorkspace['timetable'])].sort((left, right) => {
          const leftOrder = Number(left.period_id || 0);
          const rightOrder = Number(right.period_id || 0);
          if (leftOrder !== rightOrder) {
            return leftOrder - rightOrder;
          }
          return String(left.start_time || '').localeCompare(String(right.start_time || ''));
        }),
      }));
  }, [filteredTimetableEntries]);

  const filteredAssignments = useMemo(
    () =>
      (adminWorkspace?.assignments || []).filter(
        (item) =>
          !assignmentFilterClassroom ||
          `${item.classroom_name || ''} ${item.subject_name || ''} ${item.title || ''}`
            .toLowerCase()
            .includes(assignmentFilterClassroom.toLowerCase()),
      ),
    [adminWorkspace?.assignments, assignmentFilterClassroom],
  );

  const filteredExams = useMemo(
    () =>
      (adminWorkspace?.exams || []).filter((item) => !examFilterStatus || String(item.status || '').toUpperCase() === examFilterStatus),
    [adminWorkspace?.exams, examFilterStatus],
  );

  const adminExamSubjectOptions = useMemo(() => {
    if (!adminWorkspace?.subjects?.length) return [];
    const selectedClassroomId = examSubjectForm.classroomId;
    const selectedAcademicYearId =
      toNumber(
        (adminWorkspace?.exams || []).find((item) => String(item.id) === String(examSubjectForm.examId))?.academic_year_id,
      ) ?? currentAcademicYearId;
    const relevantClassSubjects = (adminWorkspace?.classSubjects || []).filter((item) => {
      if (selectedClassroomId && String(item.classroom_id) !== String(selectedClassroomId)) {
        return false;
      }
      if (selectedAcademicYearId && item.academic_year_id && toNumber(item.academic_year_id) !== selectedAcademicYearId) {
        return false;
      }
      return true;
    });
    const subjectIds = new Set(relevantClassSubjects.map((item) => String(item.subject_id)));
    return (adminWorkspace?.subjects || []).filter((item) => subjectIds.has(String(item.id)));
  }, [adminWorkspace?.classSubjects, adminWorkspace?.exams, adminWorkspace?.subjects, currentAcademicYearId, examSubjectForm.classroomId, examSubjectForm.examId]);

  const resetExamSubjectForm = () => {
    const firstExamId = String((adminWorkspace?.exams || [])[0]?.id || '');
    const firstClassroomId = String((adminWorkspace?.classrooms || [])[0]?.id || '');
    const matchingSubjectId =
      String(
        (adminWorkspace?.classSubjects || []).find((item) => String(item.classroom_id) === firstClassroomId)?.subject_id || '',
      ) || String((adminWorkspace?.subjects || [])[0]?.id || '');
    setExamSubjectForm({
      examId: firstExamId,
      classroomId: firstClassroomId,
      subjectId: matchingSubjectId,
      examDate: today,
      startTime: '',
      endTime: '',
      maximumMarks: '100',
      passMarks: '50',
    });
    setEditingExamSubjectId(null);
    setShowExamSubjectForm(false);
  };

  useEffect(() => {
    if (!isAdminAcademicRole) return;
    if (!showExamSubjectForm) return;

    setExamSubjectForm((prev) => {
      const nextExamId = prev.examId || String((adminWorkspace?.exams || [])[0]?.id || '');
      const nextClassroomId = prev.classroomId || String((adminWorkspace?.classrooms || [])[0]?.id || '');
      const validSubjectId = adminExamSubjectOptions.some((item) => String(item.id) === String(prev.subjectId))
        ? prev.subjectId
        : String(adminExamSubjectOptions[0]?.id || '');
      return {
        ...prev,
        examId: nextExamId,
        classroomId: nextClassroomId,
        subjectId: validSubjectId,
      };
    });
  }, [adminExamSubjectOptions, adminWorkspace?.classrooms, adminWorkspace?.exams, isAdminAcademicRole, showExamSubjectForm]);

  const openAdminExamForm = (item?: AdminAcademicWorkspace['exams'][number]) => {
    if (item) {
      handleEditExam(item);
      return;
    }

    setEditingExamId(null);
    setExamForm({
      academicYearId: String(currentAcademicYearId || adminWorkspace?.academicYears[0]?.id || ''),
      termId: String(
        currentTermId ||
          adminWorkspace?.terms.find((term) => toNumber(term.academic_year_id) === currentAcademicYearId)?.id ||
          adminWorkspace?.terms[0]?.id ||
          '',
      ),
      examTypeId: String(adminWorkspace?.examTypes[0]?.id || ''),
      name: '',
      startDate: today,
      endDate: today,
      status: 'PLANNED',
    });
    setShowExamForm(true);
  };

  useEffect(() => {
    if (isTeacherRole) {
      void loadTeacherWorkspace();
      return;
    }

    if (isAdminAcademicRole) {
      void loadAdminAcademicWorkspace();
    }
  }, [currentUser?.role]);

  const activeStudents = useMemo(() => {
    if (!selectedClassroomId) return [];

    const classroomId = toNumber(selectedClassroomId);
    if (!classroomId) return [];

    const preferredAcademicYearId =
      currentAcademicYearId ??
      toNumber(workspace?.assignmentLinks?.find((item) => toNumber(item.classroom_id) === classroomId)?.academic_year_id) ??
      null;

    const directStudentsForPreferredYear = (workspace?.assignedStudents || []).filter((item) => {
      if (toNumber(item.classroom_id) !== classroomId) {
        return false;
      }
      if (!isActiveEnrollmentStatus(item.enrollment_status)) {
        return false;
      }
      if (preferredAcademicYearId && toNumber(item.academic_year_id) !== preferredAcademicYearId) {
        return false;
      }
      return true;
    });

    const directStudents = directStudentsForPreferredYear.length
      ? directStudentsForPreferredYear
      : (workspace?.assignedStudents || []).filter(
          (item) =>
            toNumber(item.classroom_id) === classroomId && isActiveEnrollmentStatus(item.enrollment_status),
        );

    if (directStudents.length) {
      return directStudents.map((item) => ({
        id: item.student_id,
        admission_number: item.admission_number,
        first_name: item.first_name,
        last_name: item.last_name,
      }));
    }

    const classroomEnrollments = enrollments.filter(
      (item) => toNumber(item.classroom_id) === classroomId && isActiveEnrollmentStatus(item.enrollment_status),
    );
    const fallbackEnrollments =
      preferredAcademicYearId
        ? classroomEnrollments.filter((item) => toNumber(item.academic_year_id) === preferredAcademicYearId)
        : classroomEnrollments;
    const studentIds = new Set(
      (fallbackEnrollments.length ? fallbackEnrollments : classroomEnrollments).map((item) => String(item.student_id)),
    );
    return students.filter((item) => studentIds.has(String(item.id)));
  }, [currentAcademicYearId, enrollments, selectedClassroomId, students, workspace?.assignedStudents, workspace?.assignmentLinks]);

  const assignmentOptions = useMemo(() => {
    if (!workspace?.assignmentLinks?.length) return [];

    const selectedClassroom = toNumber(assignmentClassroomId || selectedClassroomId);

    return workspace.assignmentLinks.filter((item) => {
      if (selectedClassroom && toNumber(item.classroom_id) !== selectedClassroom) {
        return false;
      }
      return true;
    });
  }, [assignmentClassroomId, selectedClassroomId, workspace?.assignmentLinks]);

  const selectedTeacherLink = useMemo(() => {
    if (!workspace?.assignmentLinks?.length) return null;

    return (
      assignmentOptions[0] ||
      workspace.assignmentLinks.find((item) => toNumber(item.classroom_id) === toNumber(selectedClassroomId)) ||
      workspace.assignmentLinks[0]
    );
  }, [assignmentOptions, selectedClassroomId, workspace?.assignmentLinks]);

  const selectedExam = useMemo(
    () => (workspace?.upcomingExams || []).find((item) => String((item as any).exam_subject_id) === selectedExamSubjectId) || null,
    [selectedExamSubjectId, workspace?.upcomingExams],
  );

  const examStudents = useMemo(() => {
    const classroomId = toNumber((selectedExam as any)?.classroom_id);
    if (!classroomId) return [];

    return (workspace?.assignedStudents || [])
      .filter((item) => toNumber(item.classroom_id) === classroomId && isActiveEnrollmentStatus(item.enrollment_status))
      .map((item) => ({
        id: item.student_id,
        admission_number: item.admission_number,
        first_name: item.first_name,
        last_name: item.last_name,
      }));
  }, [selectedExam, workspace?.assignedStudents]);

  const assignedClassSummaries = useMemo(() => {
    if (!workspace?.assignedClasses?.length) return [];

    return workspace.assignedClasses.map((classroom) => {
      const classroomId = toNumber(classroom.id);
      const classStudents = activeStudents.filter((student) =>
        (workspace.assignedStudents || []).some(
          (entry) =>
            String(entry.student_id) === String(student.id) &&
            toNumber(entry.classroom_id) === classroomId &&
            isActiveEnrollmentStatus(entry.enrollment_status),
        ),
      );
      const classSubjects = (workspace.assignmentLinks || []).filter((entry) => toNumber(entry.classroom_id) === classroomId);

      return {
        ...classroom,
        studentCount: classStudents.length,
        subjects: classSubjects,
      };
    });
  }, [activeStudents, workspace?.assignedClasses, workspace?.assignedStudents, workspace?.assignmentLinks]);

  const currentAttendanceSummary = useMemo(() => {
    const summary = {
      total: activeStudents.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      sick: 0,
    };

    activeStudents.forEach((student) => {
      const status = attendanceStatusByStudent[Number(student.id)] || 'PRESENT';
      if (status === 'PRESENT') summary.present += 1;
      if (status === 'ABSENT') summary.absent += 1;
      if (status === 'LATE') summary.late += 1;
      if (status === 'EXCUSED') summary.excused += 1;
      if (status === 'SICK') summary.sick += 1;
    });

    return summary;
  }, [activeStudents, attendanceStatusByStudent]);

  useEffect(() => {
    if (!assignmentOptions.length) {
      setAssignmentSubjectId('');
      return;
    }

    const subjectStillValid = assignmentOptions.some((item) => String(item.subject_id) === assignmentSubjectId);
    if (!subjectStillValid) {
      setAssignmentSubjectId(String(assignmentOptions[0].subject_id));
    }
  }, [assignmentOptions, assignmentSubjectId]);

  useEffect(() => {
    if (!workspace?.upcomingExams?.length) {
      setSelectedExamSubjectId('');
      return;
    }

    const examSubjectIds = workspace.upcomingExams.map((item) => String((item as any).exam_subject_id || ''));
    setSelectedExamSubjectId((prev) => (examSubjectIds.includes(prev) ? prev : examSubjectIds[0] || ''));
  }, [workspace?.upcomingExams]);

  useEffect(() => {
    const classroomIds = (workspace?.assignedClasses || []).map((item) => String(item.id));
    if (!classroomIds.length) {
      setSelectedClassroomId('');
      return;
    }
    setSelectedClassroomId((prev) => (classroomIds.includes(String(prev)) ? prev : classroomIds[0]));
  }, [workspace?.assignedClasses]);

  useEffect(() => {
    const classroomIds = (workspace?.assignedClasses || []).map((item) => String(item.id));
    if (!classroomIds.length) {
      setAssignmentClassroomId('');
      return;
    }
    setAssignmentClassroomId((prev) => (classroomIds.includes(String(prev)) ? prev : classroomIds[0]));
  }, [workspace?.assignedClasses]);

  useEffect(() => {
    if (!isTeacherRole || !showAssignmentForm) return;
    if (!workspace?.assignmentLinks?.length) return;

    const validClassroomIds = new Set(workspace.assignmentLinks.map((item) => String(item.classroom_id)));
    const nextClassroomId =
      assignmentClassroomId && validClassroomIds.has(String(assignmentClassroomId))
        ? String(assignmentClassroomId)
        : String(workspace.assignmentLinks[0].classroom_id || '');
    const nextSubjectOptions = workspace.assignmentLinks.filter((item) => String(item.classroom_id) === nextClassroomId);
    const validSubjectIds = new Set(nextSubjectOptions.map((item) => String(item.subject_id)));
    const nextSubjectId =
      assignmentSubjectId && validSubjectIds.has(String(assignmentSubjectId))
        ? String(assignmentSubjectId)
        : String(nextSubjectOptions[0]?.subject_id || '');

    if (nextClassroomId !== assignmentClassroomId) {
      setAssignmentClassroomId(nextClassroomId);
    }
    if (nextSubjectId !== assignmentSubjectId) {
      setAssignmentSubjectId(nextSubjectId);
    }
  }, [assignmentClassroomId, assignmentSubjectId, isTeacherRole, showAssignmentForm, workspace?.assignmentLinks]);

  useEffect(() => {
    const classroomIds = (adminWorkspace?.classrooms || []).map((item) => String(item.id));
    if (!classroomIds.length) {
      setSelectedClassroomId('');
      return;
    }
    if (isAdminAcademicRole) {
      setSelectedClassroomId((prev) => (classroomIds.includes(String(prev)) ? prev : classroomIds[0]));
    }
  }, [adminWorkspace?.classrooms, isAdminAcademicRole]);

  useEffect(() => {
    const loadExamResults = async () => {
      if (!selectedExamSubjectId) {
        setExamMarksByStudent({});
        return;
      }

      setLoadingExamResults(true);
      try {
        const response = await axiosClient.get(`/results/exam-subject/${selectedExamSubjectId}`);
        const rows = response.data?.data || [];
        const next: Record<string, ExamMarkDraft> = {};
        rows.forEach((item: any) => {
          next[String(item.student_id)] = {
            marksObtained: item.marks_obtained === null || item.marks_obtained === undefined ? '' : String(item.marks_obtained),
            remarks: item.remarks || '',
            isAbsent: Boolean(item.is_absent),
          };
        });
        setExamMarksByStudent(next);
      } catch (_error) {
        setExamMarksByStudent({});
      } finally {
        setLoadingExamResults(false);
      }
    };

    if (currentUser?.role === 'TEACHER' && activeTab === 'exams') {
      void loadExamResults();
    }
  }, [activeTab, currentUser?.role, selectedExamSubjectId]);

  useEffect(() => {
    const loadAttendance = async () => {
      if (!selectedClassroomId) return;
      try {
        const response = await axiosClient.get(`/attendance/classroom/${selectedClassroomId}`);
        const rows = (response.data?.data || []) as AttendanceRow[];
        const sameDateRows = rows.filter((item) => String(item.attendance_date).slice(0, 10) === attendanceDate);
        const nextMap: Record<number, AttendanceRow['status']> = {};
        sameDateRows.forEach((item) => {
          const studentId = toNumber(item.student_id);
          if (studentId) {
            nextMap[studentId] = item.status;
          }
        });
        setAttendanceStatusByStudent(nextMap);
        setExistingAttendanceSessionId(toNumber(sameDateRows[0]?.id));
      } catch (_error) {
        setAttendanceStatusByStudent({});
        setExistingAttendanceSessionId(null);
      }
    };

    if ((currentUser?.role === 'TEACHER' || isAdminAcademicRole) && activeTab === 'attendance') {
      void loadAttendance();
    }
  }, [activeTab, attendanceDate, attendanceReloadToken, currentUser?.role, isAdminAcademicRole, selectedClassroomId]);

  const saveAttendance = async () => {
    const effectiveAcademicYearId = currentAcademicYearId ?? selectedTeacherLink?.academic_year_id ?? null;
    const effectiveTermId = currentTermId ?? selectedTeacherLink?.term_id ?? null;

    if (!selectedClassroomId || !effectiveAcademicYearId || !effectiveTermId || !activeStudents.length) {
      toast.error('Select a valid classroom with active enrolled students first.');
      return;
    }

    const records = activeStudents.map((student) => ({
      studentId: toNumber(student.id),
      status: attendanceStatusByStudent[student.id] || 'PRESENT',
    }));

    try {
      setAttendanceSaving(true);
      const payload = {
        academicYearId: effectiveAcademicYearId,
        termId: effectiveTermId,
        classroomId: toNumber(selectedClassroomId),
        attendanceDate,
        records,
      };
      const nextMap = Object.fromEntries(
        records
          .filter((record) => toNumber(record.studentId))
          .map((record) => [Number(record.studentId), record.status]),
      ) as Record<number, AttendanceRow['status']>;

      if (existingAttendanceSessionId) {
        await axiosClient.put(`/attendance/sessions/${existingAttendanceSessionId}/records`, { records });
        setAttendanceStatusByStudent(nextMap);
      } else {
        const response = await axiosClient.post('/attendance/sessions', payload);
        setExistingAttendanceSessionId(toNumber(response.data?.data?.id));
        setAttendanceStatusByStudent(nextMap);
      }

      toast.success(existingAttendanceSessionId ? 'Attendance updated successfully.' : 'Attendance recorded successfully.');
      setAttendanceReloadToken((value) => value + 1);
      if (isAdminAcademicRole) {
        await loadAdminAcademicWorkspace();
      } else {
        await loadTeacherWorkspace();
      }
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save attendance.'));
    } finally {
      setAttendanceSaving(false);
    }
  };

  const createAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    const effectiveAcademicYearId = currentAcademicYearId ?? selectedTeacherLink?.academic_year_id ?? null;
    const effectiveTermId = currentTermId ?? selectedTeacherLink?.term_id ?? null;
    const resolvedClassroomId = assignmentClassroomId || String(assignmentOptions[0]?.classroom_id || selectedTeacherLink?.classroom_id || '');
    const resolvedSubjectId = assignmentSubjectId || String(assignmentOptions[0]?.subject_id || selectedTeacherLink?.subject_id || '');

    if (!workspace?.teacherId || !effectiveAcademicYearId || !effectiveTermId) {
      toast.error('Teacher context is not ready yet.');
      return;
    }

    if (!resolvedClassroomId || !resolvedSubjectId) {
      toast.error('Select a valid assigned classroom and subject first.');
      return;
    }

    try {
      await axiosClient.post('/assignments', {
        academicYearId: effectiveAcademicYearId,
        termId: effectiveTermId,
        classroomId: toNumber(resolvedClassroomId),
        subjectId: toNumber(resolvedSubjectId),
        teacherId: toNumber(workspace.teacherId),
        title: assignmentTitle,
        description: assignmentDescription || undefined,
        assignedDate: today,
        dueDate: assignmentDueDate,
        maximumMarks: Number(assignmentMaximumMarks),
        status: 'PUBLISHED',
      });

      toast.success('Assignment created successfully.');
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentDueDate(today);
      setAssignmentMaximumMarks('100');
      setShowAssignmentForm(false);
      await loadTeacherWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to create assignment.'));
    }
  };

  const gradeSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!gradingSubmissionId) return;

    try {
      await axiosClient.patch(`/assignment-submissions/${gradingSubmissionId}/grade`, {
        marksObtained: Number(gradingMarks),
        teacherFeedback: gradingFeedback || undefined,
        submissionStatus: 'GRADED',
      });
      toast.success('Submission graded successfully.');
      setGradingSubmissionId(null);
      setGradingMarks('0');
      setGradingFeedback('');
      await loadTeacherWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to grade submission.'));
    }
  };

  const saveExamResults = async () => {
    if (!selectedExamSubjectId || !examStudents.length) {
      toast.error('Select a valid exam subject with students first.');
      return;
    }

    try {
      await axiosClient.post('/results/bulk', {
        examSubjectId: toNumber(selectedExamSubjectId),
        results: examStudents.map((student) => {
          const draft = examMarksByStudent[String(student.id)] || {
            marksObtained: '',
            remarks: '',
            isAbsent: false,
          };

          return {
            studentId: toNumber(student.id),
            marksObtained: draft.isAbsent || draft.marksObtained === '' ? null : Number(draft.marksObtained),
            remarks: draft.remarks || undefined,
            isAbsent: draft.isAbsent,
          };
        }),
      });

      toast.success('Exam results recorded successfully.');
      await loadTeacherWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to record exam results.'));
    }
  };

  const resetTimetableForm = () => {
    setTimetableForm(getDefaultTimetableSeed());
    setEditingTimetableId(null);
    setShowTimetableForm(false);
  };

  const handleAdminTimetableSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      let availablePeriods = adminWorkspace?.periods || [];
      if (!availablePeriods.length) {
        availablePeriods = await ensureDefaultTimetablePeriods();
      }

      const resolvedClassroomId = toNumber(timetableForm.classroomId) ?? toNumber(adminWorkspace?.classrooms[0]?.id);
      const resolvedPeriodId = toNumber(timetableForm.periodId) ?? toNumber(availablePeriods[0]?.id);
      const academicYearId = toNumber(timetableForm.academicYearId) ?? currentAcademicYearId;
      const termId = toNumber(timetableForm.termId) ?? currentTermId;
      const classroomId = resolvedClassroomId;
      const periodId = resolvedPeriodId;
      const subjectId = toNumber(timetableForm.subjectId);
      const teacherId = toNumber(timetableForm.teacherId);

      if (!academicYearId || !termId) {
        toast.error('Set a current academic year and current term first.');
        return;
      }

      if (!classroomId || !periodId) {
        toast.error('Select a valid classroom and period first.');
        return;
      }

      if (!subjectId || !teacherId) {
        toast.error('Select a valid subject and teacher first.');
        return;
      }

      const payload = {
        academicYearId,
        termId,
        classroomId,
        subjectId,
        teacherId,
        periodId,
        dayOfWeek: Number(timetableForm.dayOfWeek),
        roomName: timetableForm.roomName || undefined,
      };

      if (editingTimetableId) {
        await axiosClient.patch(`/timetable/${editingTimetableId}`, payload);
        toast.success('Timetable updated successfully.');
      } else {
        await axiosClient.post('/timetable', payload);
        toast.success('Timetable entry created successfully.');
      }

      resetTimetableForm();
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save timetable entry.'));
    }
  };

  const handleEditTimetable = (item: AdminAcademicWorkspace['timetable'][number]) => {
    setEditingTimetableId(toNumber(item.id));
    setTimetableForm({
      academicYearId: String(item.academic_year_id || currentAcademicYearId || ''),
      termId: String(item.term_id || currentTermId || ''),
      classroomId: String(item.classroom_id || ''),
      subjectId: String(item.subject_id || ''),
      teacherId: String(item.teacher_id || ''),
      periodId: String(item.period_id || ''),
      dayOfWeek: String(item.day_of_week || 1),
      roomName: item.room_name || '',
    });
    setShowTimetableForm(true);
  };

  const handleDeleteTimetable = async (id: number | string) => {
    const confirmed = await openConfirm({
      title: 'Delete timetable entry?',
      message: 'This timetable record will be removed from the academic schedule.',
      confirmLabel: 'Delete entry',
    });
    if (!confirmed) return;
    try {
      await axiosClient.delete(`/timetable/${id}`);
      toast.success('Timetable entry deleted successfully.');
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to delete timetable entry.'));
    }
  };

  const handleAdminAssignmentSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const academicYearId = currentAcademicYearId;
      const termId = currentTermId;
      const resolvedClassroomId =
        assignmentClassroomId ||
        String(adminAssignmentLinksForClassroom[0]?.classroom_id || adminClassSubjectsForAssignmentClassroom[0]?.classroom_id || '');
      const resolvedSubjectId =
        assignmentSubjectId ||
        String(adminAssignmentLinksForClassroom[0]?.subject_id || adminAssignmentSubjectOptions[0]?.id || '');
      const classroomId = toNumber(resolvedClassroomId);
      const subjectId = toNumber(resolvedSubjectId);
      const matchedTeacherAssignment = adminWorkspace?.teacherAssignments.find(
        (item) => String(item.classroom_id) === String(classroomId) && String(item.subject_id) === String(subjectId),
      );
      const teacherId = toNumber(matchedTeacherAssignment?.teacher_id);

      if (!academicYearId || !termId) {
        toast.error('Set a current academic year and current term first.');
        return;
      }

      if (!classroomId || !subjectId) {
        toast.error('Select a valid classroom and subject first.');
        return;
      }

      if (!teacherId) {
        toast.error('Assign a teacher to this classroom subject first.');
        return;
      }

      const payload = {
        academicYearId,
        termId,
        classroomId,
        subjectId,
        teacherId,
        title: assignmentTitle,
        description: assignmentDescription || undefined,
        assignedDate: today,
        dueDate: assignmentDueDate,
        maximumMarks: Number(assignmentMaximumMarks),
        status: 'PUBLISHED',
      };
      if (editingAdminAssignmentId) {
        await axiosClient.patch(`/assignments/${editingAdminAssignmentId}`, payload);
        toast.success('Assignment updated successfully.');
      } else {
        await axiosClient.post('/assignments', payload);
        toast.success('Assignment created successfully.');
      }

      setEditingAdminAssignmentId(null);
      setShowAssignmentForm(false);
      setAssignmentTitle('');
      setAssignmentDescription('');
      setAssignmentDueDate(today);
      setAssignmentMaximumMarks('100');
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save assignment.'));
    }
  };

  const handleEditAdminAssignment = (item: AdminAcademicWorkspace['assignments'][number]) => {
    setEditingAdminAssignmentId(toNumber(item.id));
    setAssignmentTitle(item.title || '');
    setAssignmentDescription(item.description || '');
    setAssignmentClassroomId(String(item.classroom_id || ''));
    setAssignmentSubjectId(String(item.subject_id || ''));
    setAssignmentDueDate(String(item.due_date || today).slice(0, 10));
    setAssignmentMaximumMarks(String(item.maximum_marks || 100));
    setShowAssignmentForm(true);
  };

  const handleDeleteAssignment = async (id: number | string) => {
    const confirmed = await openConfirm({
      title: 'Delete assignment?',
      message: 'This assignment will be permanently removed.',
      confirmLabel: 'Delete assignment',
    });
    if (!confirmed) return;
    try {
      await axiosClient.delete(`/assignments/${id}`);
      toast.success('Assignment deleted successfully.');
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to delete assignment.'));
    }
  };

  const [showExamForm, setShowExamForm] = useState(false);
  const [examForm, setExamForm] = useState({
    academicYearId: '',
    termId: '',
    examTypeId: '',
    name: '',
    startDate: today,
    endDate: today,
    status: 'PLANNED',
  });

  useEffect(() => {
    if (!isAdminAcademicRole || !adminWorkspace) return;
    setExamForm((prev) => ({
      academicYearId: prev.academicYearId || String(currentAcademicYearId || ''),
      termId: prev.termId || String(currentTermId || ''),
      examTypeId: prev.examTypeId || String(adminWorkspace.examTypes[0]?.id || ''),
      name: prev.name,
      startDate: prev.startDate || today,
      endDate: prev.endDate || today,
      status: prev.status || 'PLANNED',
    }));
  }, [adminWorkspace, currentAcademicYearId, currentTermId, isAdminAcademicRole]);

  const resetExamForm = () => {
    setExamForm({
      academicYearId: String(currentAcademicYearId || ''),
      termId: String(currentTermId || ''),
      examTypeId: String(adminWorkspace?.examTypes[0]?.id || ''),
      name: '',
      startDate: today,
      endDate: today,
      status: 'PLANNED',
    });
    setEditingExamId(null);
    setShowExamForm(false);
  };

  const handleAdminExamSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const academicYearId = toNumber(examForm.academicYearId) ?? currentAcademicYearId;
      const termId = toNumber(examForm.termId) ?? currentTermId;
      const examTypeId = toNumber(examForm.examTypeId);

      if (!academicYearId || !termId) {
        toast.error('Set a current academic year and current term first.');
        return;
      }

      if (!examTypeId) {
        toast.error('Select a valid exam type first.');
        return;
      }

      const payload = {
        academicYearId,
        termId,
        examTypeId,
        name: examForm.name,
        startDate: examForm.startDate,
        endDate: examForm.endDate,
        status: examForm.status as 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED',
      };

      if (editingExamId) {
        await axiosClient.patch(`/exams/${editingExamId}`, payload);
        toast.success('Exam updated successfully.');
      } else {
        await axiosClient.post('/exams', payload);
        toast.success('Exam created successfully.');
      }

      resetExamForm();
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save exam.'));
    }
  };

  const handleSaveExamSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const examId = toNumber(examSubjectForm.examId);
      const classroomId = toNumber(examSubjectForm.classroomId);
      const subjectId = toNumber(examSubjectForm.subjectId);
      const maximumMarks = Number(examSubjectForm.maximumMarks);
      const passMarks = Number(examSubjectForm.passMarks);

      if (!examId || !classroomId || !subjectId) {
        toast.error('Select a valid exam, classroom, and subject first.');
        return;
      }

      const examRecord = (adminWorkspace?.exams || []).find((item) => toNumber(item.id) === examId);
      const selectedExamStartDate = String(examRecord?.start_date || '').slice(0, 10);
      const selectedExamEndDate = String(examRecord?.end_date || '').slice(0, 10);

      let resolvedExamDate = examSubjectForm.examDate || selectedExamStartDate || today;
      if (selectedExamStartDate && resolvedExamDate < selectedExamStartDate) {
        resolvedExamDate = selectedExamStartDate;
      }
      if (selectedExamEndDate && resolvedExamDate > selectedExamEndDate) {
        resolvedExamDate = selectedExamEndDate;
      }
      if (resolvedExamDate !== examSubjectForm.examDate) {
        setExamSubjectForm((prev) => ({ ...prev, examDate: resolvedExamDate }));
      }

      const payload = {
        examId,
        classroomId,
        subjectId,
        examDate: resolvedExamDate,
        startTime: examSubjectForm.startTime || undefined,
        endTime: examSubjectForm.endTime || undefined,
        maximumMarks,
        passMarks,
      };

      if (editingExamSubjectId) {
        await axiosClient.patch(`/exam-subjects/${editingExamSubjectId}`, payload);
        toast.success('Exam subject updated successfully.');
      } else {
        await axiosClient.post('/exam-subjects', payload);
        toast.success('Exam subject created successfully.');
      }

      resetExamSubjectForm();
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save exam subject.'));
    }
  };

  const handleEditExam = (item: AdminAcademicWorkspace['exams'][number]) => {
    setEditingExamId(toNumber(item.id));
    setExamForm({
      academicYearId: String(item.academic_year_id || currentAcademicYearId || ''),
      termId: String(item.term_id || currentTermId || ''),
      examTypeId: String(item.exam_type_id || ''),
      name: item.name || '',
      startDate: String(item.start_date || today).slice(0, 10),
      endDate: String(item.end_date || today).slice(0, 10),
      status: item.status || 'PLANNED',
    });
    setShowExamForm(true);
  };

  const handleEditExamSubject = (item: AdminAcademicWorkspace['examSubjects'][number]) => {
    setEditingExamSubjectId(toNumber(item.id));
    setExamSubjectForm({
      examId: String(item.exam_id || ''),
      classroomId: String(item.classroom_id || ''),
      subjectId: String(item.subject_id || ''),
      examDate: String(item.exam_date || today).slice(0, 10),
      startTime: item.start_time || '',
      endTime: item.end_time || '',
      maximumMarks: String(item.maximum_marks || 100),
      passMarks: String(item.pass_marks || 50),
    });
    setShowExamSubjectForm(true);
  };

  const handleDeleteExam = async (id: number | string) => {
    const confirmed = await openConfirm({
      title: 'Delete exam?',
      message: 'This exam record will be removed from the school assessment plan.',
      confirmLabel: 'Delete exam',
    });
    if (!confirmed) return;
    try {
      await axiosClient.delete(`/exams/${id}`);
      toast.success('Exam deleted successfully.');
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to delete exam.'));
    }
  };

  const handleDeleteExamSubject = async (id: number | string) => {
    const confirmed = await openConfirm({
      title: 'Delete exam subject?',
      message: 'This classroom subject exam schedule will be removed.',
      confirmLabel: 'Delete exam subject',
    });
    if (!confirmed) return;
    try {
      await axiosClient.delete(`/exam-subjects/${id}`);
      toast.success('Exam subject deleted successfully.');
      await loadAdminAcademicWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to delete exam subject.'));
    }
  };

  if (isAdminAcademicRole) {
    const attendanceSessions = adminWorkspace?.attendanceSessions || [];
    const timetableEntries = adminWorkspace?.timetable || [];
    const assignments = adminWorkspace?.assignments || [];
    const exams = adminWorkspace?.exams || [];
    const reportCards = adminWorkspace?.reportCards || [];
    const classrooms = adminWorkspace?.classrooms || [];
    const teacherAssignments = adminWorkspace?.teacherAssignments || [];

    if (loading) {
      return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading academic operations...</div>;
    }

    return (
      <div id="academic-operations-view" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <h1 className="text-base font-black text-slate-800">Academic Operations</h1>
          <p className="mt-0.5 text-xs text-slate-500">Real backend data for school-wide attendance, timetable, assignments, exams, and report-card activity.</p>
        </div>

        <div className="space-y-6 p-6">
          {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

          {activeTab === 'attendance' ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_55%,#eefaf4_100%)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">Attendance Register</p>
                    <h3 className="mt-2 text-lg font-black text-slate-900">{existingAttendanceSessionId ? 'Update saved attendance' : 'Create daily attendance'}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {existingAttendanceSessionId
                        ? 'This class already has attendance for the selected date. Your next save will update it.'
                        : 'No attendance exists yet for this class and date. Your next save will create it.'}
                    </p>
                  </div>
                  <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${existingAttendanceSessionId ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {existingAttendanceSessionId ? 'Update Mode' : 'New Session'}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold" value={selectedClassroomId} onChange={(event) => setSelectedClassroomId(event.target.value)}>
                    {classrooms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}{item.section_name ? ` - ${item.section_name}` : ''}
                      </option>
                    ))}
                  </select>
                  <input type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
                  <button onClick={() => void saveAttendance()} disabled={attendanceSaving || !activeStudents.length} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                    <Save className="mr-1 inline h-4 w-4" />
                    {attendanceSaving ? 'Saving...' : existingAttendanceSessionId ? 'Update Attendance' : 'Save Attendance'}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setAttendanceStatusByStudent(Object.fromEntries(activeStudents.map((student) => [Number(student.id), 'PRESENT' as const])))}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceStatusByStudent(Object.fromEntries(activeStudents.map((student) => [Number(student.id), 'ABSENT' as const])))}
                    className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700"
                  >
                    Mark All Absent
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttendanceStatusByStudent({})}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
                  >
                    Reset to Default
                  </button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Students</p>
                    <p className="mt-2 text-xl font-black text-slate-900">{currentAttendanceSummary.total}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Present</p>
                    <p className="mt-2 text-xl font-black text-emerald-700">{currentAttendanceSummary.present}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Absent</p>
                    <p className="mt-2 text-xl font-black text-rose-700">{currentAttendanceSummary.absent}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Late</p>
                    <p className="mt-2 text-xl font-black text-amber-700">{currentAttendanceSummary.late}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Excused</p>
                    <p className="mt-2 text-xl font-black text-sky-700">{currentAttendanceSummary.excused}</p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sick</p>
                    <p className="mt-2 text-xl font-black text-violet-700">{currentAttendanceSummary.sick}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">Admission</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Current Status</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeStudents.length ? activeStudents.map((student, index) => (
                      <tr key={student.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-black text-slate-400">{index + 1}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{student.admission_number}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{student.first_name} {student.last_name}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                            attendanceStatusByStudent[Number(student.id)] === 'ABSENT'
                              ? 'bg-rose-100 text-rose-700'
                              : attendanceStatusByStudent[Number(student.id)] === 'LATE'
                                ? 'bg-amber-100 text-amber-700'
                                : attendanceStatusByStudent[Number(student.id)] === 'EXCUSED'
                                  ? 'bg-sky-100 text-sky-700'
                                  : attendanceStatusByStudent[Number(student.id)] === 'SICK'
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {attendanceStatusByStudent[Number(student.id)] || 'PRESENT'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK'] as const).map((status) => (
                              <button
                                key={status}
                                onClick={() => setAttendanceStatusByStudent((prev) => ({ ...prev, [Number(student.id)]: status }))}
                                className={`rounded-full border px-3 py-1 text-[10px] font-bold ${attendanceButtonClass((attendanceStatusByStudent[Number(student.id)] || 'PRESENT') === status, status)}`}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No active enrolled students were found for this classroom.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Sessions</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{attendanceSessions.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Classrooms</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{classrooms.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Present</p>
                  <p className="mt-2 text-2xl font-black text-emerald-700">{attendanceSessions.reduce((sum, item) => sum + Number(item.present_count || 0), 0)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Absent</p>
                  <p className="mt-2 text-2xl font-black text-rose-700">{attendanceSessions.reduce((sum, item) => sum + Number(item.absent_count || 0), 0)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  className="rounded border bg-white px-3 py-2 text-xs"
                  placeholder="Filter attendance sessions by classroom"
                  value={attendanceSessionFilterClassroom}
                  onChange={(event) => setAttendanceSessionFilterClassroom(event.target.value)}
                />
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Classroom</th>
                      <th className="px-4 py-3">Records</th>
                      <th className="px-4 py-3">Present</th>
                      <th className="px-4 py-3">Absent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAttendanceSessions.length ? filteredAttendanceSessions.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-bold text-slate-800">{String(item.attendance_date || '').slice(0, 10) || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.classroom_name || 'Classroom'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.total_records ?? 0}</td>
                        <td className="px-4 py-3 text-emerald-700">{item.present_count ?? 0}</td>
                        <td className="px-4 py-3 text-rose-700">{item.absent_count ?? 0}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No attendance sessions match this filter yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === 'timetable' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-black uppercase tracking-wider text-slate-800">School Timetable</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => void loadAdminAcademicWorkspace()}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    <RefreshCw className="mr-1 inline h-4 w-4" />
                    Refresh
                  </button>
                  <button
                    onClick={() => {
                      if (showTimetableForm) {
                        resetTimetableForm();
                        return;
                      }
                      openAdminTimetableForm();
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    {showTimetableForm ? 'Close Form' : 'New Timetable Entry'}
                  </button>
                </div>
              </div>

              {showTimetableForm ? (
                <form onSubmit={handleAdminTimetableSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                  <div className="md:col-span-4 grid grid-cols-1 gap-3 md:grid-cols-5">
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classroom</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {classrooms.find((item) => String(item.id) === String(timetableForm.classroomId))?.name || 'Select classroom'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Subject</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {adminTimetableSubjectOptions.find((item) => String(item.id) === String(timetableForm.subjectId))?.name || 'Select subject'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Teacher</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {(() => {
                          const teacher = adminTimetableTeacherOptions.find((item) => String(item.id) === String(timetableForm.teacherId));
                          if (!teacher) return 'Select teacher';
                          return `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() || teacher.email || teacher.teacher_number || `Teacher #${teacher.id}`;
                        })()}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Period</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {adminWorkspace?.periods.find((item) => String(item.id) === String(timetableForm.periodId))?.name || 'Select period'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-blue-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Day</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{dayName(Number(timetableForm.dayOfWeek || 0))}</p>
                    </div>
                  </div>

                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.academicYearId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, academicYearId: event.target.value }))}>
                    {(adminWorkspace?.academicYears || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.termId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, termId: event.target.value }))}>
                    {(adminWorkspace?.terms || [])
                      .filter((item) => !timetableForm.academicYearId || String(item.academic_year_id) === String(timetableForm.academicYearId))
                      .map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.classroomId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, classroomId: event.target.value }))}>
                    {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.periodId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, periodId: event.target.value }))}>
                    {!(adminWorkspace?.periods || []).length ? <option value="">Create or load timetable periods first</option> : null}
                    {(adminWorkspace?.periods || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.subjectId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, subjectId: event.target.value }))}>
                    {!adminTimetableSubjectOptions.length ? <option value="">No classroom subjects available</option> : null}
                    {adminTimetableSubjectOptions.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ''}{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.teacherId} onChange={(event) => setTimetableForm((prev) => ({ ...prev, teacherId: event.target.value }))}>
                    {!adminTimetableTeacherOptions.length ? <option value="">No assigned teacher available</option> : null}
                    {adminTimetableTeacherOptions.map((item) => <option key={item.id} value={item.id}>{`${item.first_name || ''} ${item.last_name || ''}`.trim() || item.email || item.teacher_number || `Teacher #${item.id}`}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={timetableForm.dayOfWeek} onChange={(event) => setTimetableForm((prev) => ({ ...prev, dayOfWeek: event.target.value }))}>
                    {[1, 2, 3, 4, 5].map((day) => <option key={day} value={day}>{dayName(day)}</option>)}
                  </select>
                  <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Room name" value={timetableForm.roomName} onChange={(event) => setTimetableForm((prev) => ({ ...prev, roomName: event.target.value }))} />
                  {!adminTimetableSubjectOptions.length ? (
                    <div className="md:col-span-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                      No classroom subjects exist for this classroom yet. Add classroom subjects first, then create the timetable entry.
                    </div>
                  ) : null}
                  {!adminTimetableLinksForClassroom.length ? (
                    <div className="md:col-span-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                      No teacher-subject assignment exists for this classroom yet. Assign a teacher to a subject first in `Subjects & Teachers`.
                    </div>
                  ) : null}
                  {!(adminWorkspace?.periods || []).length ? (
                    <div className="md:col-span-4 flex items-center justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-semibold text-sky-800">
                      <span>No timetable periods exist yet. Generate the standard school periods once, then continue.</span>
                      <button
                        type="button"
                        onClick={() => void ensureDefaultTimetablePeriods()}
                        className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-bold text-white"
                      >
                        Create Standard Periods
                      </button>
                    </div>
                  ) : null}
                  <div className="md:col-span-4 flex justify-end gap-2">
                    <button type="button" onClick={resetTimetableForm} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                    <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">{editingTimetableId ? 'Update Entry' : 'Create Entry'}</button>
                  </div>
                </form>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Timetable Entries</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{timetableEntries.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Teacher Assignments</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{teacherAssignments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Active Classrooms</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{classrooms.filter((item) => item.is_active !== false).length}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  className="rounded border bg-white px-3 py-2 text-xs"
                  placeholder="Filter timetable by classroom"
                  value={timetableFilterClassroom}
                  onChange={(event) => setTimetableFilterClassroom(event.target.value)}
                />
                <select
                  className="rounded border bg-white px-3 py-2 text-xs"
                  value={timetableFilterDay}
                  onChange={(event) => setTimetableFilterDay(event.target.value)}
                >
                  <option value="">All school days</option>
                  {[1, 2, 3, 4, 5].map((day) => (
                    <option key={day} value={day}>
                      {dayName(day)}
                    </option>
                  ))}
                </select>
              </div>

              {groupedTimetableEntries.length ? (
                <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                  {groupedTimetableEntries.map((group) => (
                    <div key={group.day} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">{dayName(group.day)}</h4>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-blue-700">
                          {group.items.length} period{group.items.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {group.items.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{item.subject_name || item.period_name || 'Scheduled period'}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.classroom_name || 'Classroom'}
                                  {item.teacher_name ? ` | ${item.teacher_name}` : ''}
                                </p>
                              </div>
                              <div className="text-right text-xs text-slate-500">
                                <p>{item.start_time || '-'}{item.end_time ? ` - ${item.end_time}` : ''}</p>
                                <p>{item.period_name || 'Period'}{item.room_name ? ` | ${item.room_name}` : ''}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Day</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Classroom</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Teacher</th>
                      <th className="px-4 py-3">Period / Room</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTimetableEntries.length ? filteredTimetableEntries.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-bold text-slate-800">{dayName(Number(item.day_of_week || 0))}</td>
                        <td className="px-4 py-3 text-slate-600">{item.start_time || '-'} {item.end_time ? `- ${item.end_time}` : ''}</td>
                        <td className="px-4 py-3 text-slate-600">{item.classroom_name || 'Classroom'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.subject_name || item.period_name || 'Subject'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.teacher_name || '-'}</td>
                        <td className="px-4 py-3 text-slate-600">{item.period_name || 'Period'}{item.room_name ? ` | ${item.room_name}` : ''}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => openAdminTimetableForm(item)} className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => void handleDeleteTimetable(item.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-slate-500">No timetable entries match this filter yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}

          {activeTab === 'assignments' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-black uppercase tracking-wider text-slate-800">School Assignments</div>
                <button
                  onClick={() => {
                    if (showAssignmentForm) {
                      setEditingAdminAssignmentId(null);
                      setShowAssignmentForm(false);
                      return;
                    }
                    openAdminAssignmentForm();
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  {showAssignmentForm ? 'Close Form' : 'New Assignment'}
                </button>
              </div>

              {showAssignmentForm ? (
                <form onSubmit={handleAdminAssignmentSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                  <input className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" placeholder="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentClassroomId} onChange={(event) => setAssignmentClassroomId(event.target.value)}>
                    {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentSubjectId} onChange={(event) => setAssignmentSubjectId(event.target.value)}>
                    {!adminAssignmentSubjectOptions.length ? <option value="">No classroom subjects available</option> : null}
                    {adminAssignmentSubjectOptions.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ''}{item.name}</option>)}
                  </select>
                  <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" rows={3} placeholder="Description" value={assignmentDescription} onChange={(event) => setAssignmentDescription(event.target.value)} />
                  <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} />
                  <input type="number" min="1" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentMaximumMarks} onChange={(event) => setAssignmentMaximumMarks(event.target.value)} />
                  {!adminAssignmentSubjectOptions.length ? (
                    <div className="md:col-span-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                      No subjects are assigned to this classroom yet. Add them first in `Subjects & Teachers`.
                    </div>
                  ) : null}
                  {!adminAssignmentLinksForClassroom.length ? (
                    <div className="md:col-span-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
                      No teacher-subject assignment exists for this classroom yet. Create the teacher assignment first, then this assignment form will work.
                    </div>
                  ) : null}
                  <div className="md:col-span-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAdminAssignmentId(null);
                        setShowAssignmentForm(false);
                        setAssignmentTitle('');
                        setAssignmentDescription('');
                        setAssignmentDueDate(today);
                        setAssignmentMaximumMarks('100');
                      }}
                      className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">{editingAdminAssignmentId ? 'Update Assignment' : 'Create Assignment'}</button>
                  </div>
                </form>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Assignments</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{assignments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Classrooms</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{classrooms.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Teacher Links</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{teacherAssignments.length}</p>
                </div>
              </div>

              <input
                className="rounded border bg-white px-3 py-2 text-xs"
                placeholder="Filter assignments by classroom, subject, or title"
                value={assignmentFilterClassroom}
                onChange={(event) => setAssignmentFilterClassroom(event.target.value)}
              />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredAssignments.length ? filteredAssignments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <div className="flex gap-2">
                        <button onClick={() => openAdminAssignmentForm(item)} className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => void handleDeleteAssignment(item.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{item.classroom_name || 'Classroom'} | {item.subject_name || 'Subject'}</p>
                    <p className="mt-2 text-xs text-slate-500">Due: {String(item.due_date || '').slice(0, 10) || '-'} | Max Marks: {item.maximum_marks ?? 0}</p>
                    <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">{item.status || 'PUBLISHED'}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 xl:col-span-2">No assignments match this filter yet.</div>
                )}
              </div>
            </div>
          ) : null}

          {activeTab === 'exams' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-sm font-black uppercase tracking-wider text-slate-800">Exams & Report Cards</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      if (showExamForm) {
                        resetExamForm();
                        return;
                      }
                      openAdminExamForm();
                    }}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    {showExamForm ? 'Close Exam Form' : 'New Exam'}
                  </button>
                  <button
                    onClick={() => {
                      if (showExamSubjectForm) {
                        resetExamSubjectForm();
                        return;
                      }
                      setShowExamSubjectForm(true);
                      setEditingExamSubjectId(null);
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700"
                  >
                    <Plus className="mr-1 inline h-4 w-4" />
                    {showExamSubjectForm ? 'Close Subject Form' : 'New Exam Subject'}
                  </button>
                </div>
              </div>

              {showExamForm ? (
                <form onSubmit={handleAdminExamSubmit} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examForm.academicYearId} onChange={(event) => setExamForm((prev) => ({ ...prev, academicYearId: event.target.value }))}>
                    {(adminWorkspace?.academicYears || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examForm.termId} onChange={(event) => setExamForm((prev) => ({ ...prev, termId: event.target.value }))}>
                    {(adminWorkspace?.terms || [])
                      .filter((item) => !examForm.academicYearId || String(item.academic_year_id) === String(examForm.academicYearId))
                      .map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examForm.examTypeId} onChange={(event) => setExamForm((prev) => ({ ...prev, examTypeId: event.target.value }))}>
                    {(adminWorkspace?.examTypes || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examForm.status} onChange={(event) => setExamForm((prev) => ({ ...prev, status: event.target.value }))}>
                    {['PLANNED', 'ONGOING', 'COMPLETED', 'PUBLISHED', 'CANCELLED'].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <input className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" placeholder="Exam name" value={examForm.name} onChange={(event) => setExamForm((prev) => ({ ...prev, name: event.target.value }))} />
                  <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={examForm.startDate} onChange={(event) => setExamForm((prev) => ({ ...prev, startDate: event.target.value }))} />
                  <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={examForm.endDate} onChange={(event) => setExamForm((prev) => ({ ...prev, endDate: event.target.value }))} />
                  <div className="md:col-span-4 flex justify-end gap-2">
                    <button type="button" onClick={resetExamForm} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                    <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">{editingExamId ? 'Update Exam' : 'Create Exam'}</button>
                  </div>
                </form>
              ) : null}

              {showExamSubjectForm ? (
                <form onSubmit={handleSaveExamSubject} className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-4">
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.examId} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, examId: event.target.value }))}>
                    {!adminWorkspace?.exams?.length ? <option value="">No exams available</option> : null}
                    {(adminWorkspace?.exams || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.classroomId} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, classroomId: event.target.value }))}>
                    {!classrooms.length ? <option value="">No classrooms available</option> : null}
                    {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>)}
                  </select>
                  <select className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.subjectId} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, subjectId: event.target.value }))}>
                    {!adminExamSubjectOptions.length ? <option value="">No classroom subjects available</option> : null}
                    {adminExamSubjectOptions.map((item) => <option key={item.id} value={item.id}>{item.code ? `${item.code} - ` : ''}{item.name}</option>)}
                  </select>
                  <input
                    type="date"
                    min={String(selectedAdminExam?.start_date || '').slice(0, 10) || undefined}
                    max={String(selectedAdminExam?.end_date || '').slice(0, 10) || undefined}
                    className="rounded border bg-white px-3 py-2 text-xs"
                    value={examSubjectForm.examDate}
                    onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, examDate: event.target.value }))}
                  />
                  <input type="time" className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.startTime} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, startTime: event.target.value }))} />
                  <input type="time" className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.endTime} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, endTime: event.target.value }))} />
                  <input type="number" min="1" className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.maximumMarks} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, maximumMarks: event.target.value }))} />
                  <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" value={examSubjectForm.passMarks} onChange={(event) => setExamSubjectForm((prev) => ({ ...prev, passMarks: event.target.value }))} />
                  {selectedAdminExam ? (
                    <div className="md:col-span-4 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-xs text-emerald-800">
                      Exam date must be between {String(selectedAdminExam.start_date || '').slice(0, 10) || '-'} and {String(selectedAdminExam.end_date || '').slice(0, 10) || '-'}.
                    </div>
                  ) : null}
                  <div className="md:col-span-4 flex justify-end gap-2">
                    <button type="button" onClick={resetExamSubjectForm} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                    <button type="submit" className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white">{editingExamSubjectId ? 'Update Exam Subject' : 'Create Exam Subject'}</button>
                  </div>
                </form>
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Exams</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{exams.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Report Cards</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{reportCards.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Assignments</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{assignments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Teacher Links</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{teacherAssignments.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[11px] font-black uppercase tracking-wider text-slate-500">Exam Subjects</p>
                  <p className="mt-2 text-2xl font-black text-slate-900">{(adminWorkspace?.examSubjects || []).length}</p>
                </div>
              </div>

              <select
                className="rounded border bg-white px-3 py-2 text-xs"
                value={examFilterStatus}
                onChange={(event) => setExamFilterStatus(event.target.value)}
              >
                <option value="">All exam statuses</option>
                {['PLANNED', 'ONGOING', 'COMPLETED', 'PUBLISHED', 'CANCELLED'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Scheduled Exams</div>
                  <div className="divide-y divide-slate-100">
                    {filteredExams.length ? filteredExams.map((item) => (
                      <div key={item.id} className="px-4 py-3 text-xs">
                        <div className="flex items-start justify-between gap-4">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <div className="flex gap-2">
                            <button onClick={() => openAdminExamForm(item)} className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => void handleDeleteExam(item.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <p className="mt-1 text-slate-500">{item.exam_type_name || 'Exam'} | {String(item.start_date || '').slice(0, 10) || '-'} {item.end_date ? `to ${String(item.end_date).slice(0, 10)}` : ''}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{item.status || 'PLANNED'}</p>
                      </div>
                    )) : <div className="px-4 py-6 text-xs text-slate-500">No exams match this filter yet.</div>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Exam Subjects</div>
                  <div className="divide-y divide-slate-100">
                    {(adminWorkspace?.examSubjects || []).length ? (adminWorkspace?.examSubjects || []).map((item) => {
                      const examName = (adminWorkspace?.exams || []).find((exam) => String(exam.id) === String(item.exam_id))?.name || 'Exam';
                      const classroomName = classrooms.find((classroom) => String(classroom.id) === String(item.classroom_id));
                      const subjectName = (adminWorkspace?.subjects || []).find((subject) => String(subject.id) === String(item.subject_id));
                      return (
                        <div key={item.id} className="px-4 py-3 text-xs">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">{examName}</p>
                              <p className="mt-1 text-slate-500">
                                {classroomName?.name || 'Classroom'}{classroomName?.section_name ? ` - ${classroomName.section_name}` : ''} | {subjectName?.code ? `${subjectName.code} - ` : ''}{subjectName?.name || 'Subject'}
                              </p>
                              <p className="mt-1 text-slate-400">
                                {String(item.exam_date || '').slice(0, 10) || '-'} | {item.maximum_marks ?? 0} marks | Pass {item.pass_marks ?? 0}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleEditExamSubject(item)} className="rounded-lg border border-blue-200 bg-blue-50 p-2 text-blue-700"><Pencil className="h-4 w-4" /></button>
                              <button onClick={() => void handleDeleteExamSubject(item.id)} className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-rose-700"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </div>
                      );
                    }) : <div className="px-4 py-6 text-xs text-slate-500">No exam subjects have been created yet.</div>}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Published Report Cards</div>
                  <div className="divide-y divide-slate-100">
                    {reportCards.length ? reportCards.map((item) => (
                      <div key={item.id} className="px-4 py-3 text-xs">
                        <p className="font-bold text-slate-900">{item.first_name || 'Student'} {item.last_name || ''}</p>
                        <p className="mt-1 text-slate-500">{item.classroom_name || 'Classroom'} | Average: {item.average_percentage ?? '-'}%</p>
                        <p className="mt-1 text-slate-500">Grade: {item.overall_grade || '-'} | Position: {item.class_position ?? '-'}</p>
                      </div>
                    )) : <div className="px-4 py-6 text-xs text-slate-500">No report cards have been generated yet.</div>}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading teacher tools...</div>;
  }

  return (
    <div id="teacher-operations-view" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h1 className="text-base font-black text-slate-800">Teacher Operations</h1>
        <p className="mt-0.5 text-xs text-slate-500">Real backend data for your assigned classes, attendance, timetable, assignments, and exam-related summaries.</p>
      </div>

      <div className="space-y-6 p-6">
        {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

        {activeTab === 'attendance' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f7fbff_55%,#eefaf4_100%)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">My Attendance Register</p>
                  <h3 className="mt-2 text-lg font-black text-slate-900">{existingAttendanceSessionId ? 'Update saved class attendance' : 'Take daily class attendance'}</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {existingAttendanceSessionId
                      ? 'Attendance already exists for this class and date. Any changes you make now will update it.'
                      : 'Choose each student status, then save once to create today’s attendance.'}
                  </p>
                </div>
                <div className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${existingAttendanceSessionId ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {existingAttendanceSessionId ? 'Update Mode' : 'New Session'}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold" value={selectedClassroomId} onChange={(event) => setSelectedClassroomId(event.target.value)}>
                  {workspace?.assignedClasses?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>
                  ))}
                </select>
                <input type="date" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
                <button onClick={() => void saveAttendance()} disabled={attendanceSaving || !activeStudents.length} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                  <Save className="mr-1 inline h-4 w-4" />
                  {attendanceSaving ? 'Saving...' : existingAttendanceSessionId ? 'Update Attendance' : 'Save Attendance'}
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setAttendanceStatusByStudent(Object.fromEntries(activeStudents.map((student) => [Number(student.id), 'PRESENT' as const])))}
                  className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"
                >
                  Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceStatusByStudent(Object.fromEntries(activeStudents.map((student) => [Number(student.id), 'ABSENT' as const])))}
                  className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-bold text-rose-700"
                >
                  Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={() => setAttendanceStatusByStudent({})}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700"
                >
                  Reset to Default
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-6">
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Students</p>
                  <p className="mt-2 text-xl font-black text-slate-900">{currentAttendanceSummary.total}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Present</p>
                  <p className="mt-2 text-xl font-black text-emerald-700">{currentAttendanceSummary.present}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Absent</p>
                  <p className="mt-2 text-xl font-black text-rose-700">{currentAttendanceSummary.absent}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Late</p>
                  <p className="mt-2 text-xl font-black text-amber-700">{currentAttendanceSummary.late}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Excused</p>
                  <p className="mt-2 text-xl font-black text-sky-700">{currentAttendanceSummary.excused}</p>
                </div>
                <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Sick</p>
                  <p className="mt-2 text-xl font-black text-violet-700">{currentAttendanceSummary.sick}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Admission</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Current Status</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-black text-slate-400">{index + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{student.admission_number}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                          attendanceStatusByStudent[Number(student.id)] === 'ABSENT'
                            ? 'bg-rose-100 text-rose-700'
                            : attendanceStatusByStudent[Number(student.id)] === 'LATE'
                              ? 'bg-amber-100 text-amber-700'
                              : attendanceStatusByStudent[Number(student.id)] === 'EXCUSED'
                                ? 'bg-sky-100 text-sky-700'
                                : attendanceStatusByStudent[Number(student.id)] === 'SICK'
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {attendanceStatusByStudent[Number(student.id)] || 'PRESENT'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setAttendanceStatusByStudent((prev) => ({ ...prev, [student.id]: status }))}
                              className={`rounded-full border px-3 py-1 text-[10px] font-bold ${attendanceButtonClass((attendanceStatusByStudent[Number(student.id)] || 'PRESENT') === status, status)}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {activeTab === 'timetable' ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              My Timetable
            </div>
            {(workspace?.timetable || []).length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {(workspace?.timetable || []).map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-bold text-slate-900">{item.classroom_name || 'Class'} - {item.subject_name || 'Subject'}</p>
                    <p className="mt-1 text-xs text-slate-500">{dayName(item.day_of_week)} | {item.start_time} - {item.end_time}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{item.period_name || 'Scheduled period'}{item.room_name ? ` | Room: ${item.room_name}` : ''}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                  No timetable entries have been created yet for this teacher. Your assigned classes and subjects are shown below from the real database.
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {assignedClassSummaries.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-bold text-slate-900">
                        {item.name}{item.section_name ? ` - ${item.section_name}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{item.studentCount} active students</p>
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-600">Assigned Subjects</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.subjects.map((subject) => (
                          <span key={subject.id} className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
                            {subject.subject_code || 'SUB'} - {subject.subject_name || 'Subject'}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {activeTab === 'assignments' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-800">
                  <ClipboardList className="h-4 w-4 text-blue-600" />
                  Assignments & Submissions
                </div>
              <button
                onClick={() => {
                  if (showAssignmentForm) {
                    setShowAssignmentForm(false);
                    return;
                  }
                  const firstLink = workspace?.assignmentLinks?.[0];
                  if (firstLink) {
                    setAssignmentClassroomId(String(firstLink.classroom_id || ''));
                    setAssignmentSubjectId(String(firstLink.subject_id || ''));
                  }
                  setShowAssignmentForm(true);
                }}
                className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                New Assignment
              </button>
            </div>

            {showAssignmentForm ? (
              <form onSubmit={createAssignment} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                <input className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" placeholder="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentClassroomId} onChange={(event) => setAssignmentClassroomId(event.target.value)}>
                  {!workspace?.assignmentLinks?.length ? <option value="">No assigned classrooms available</option> : null}
                  {workspace?.assignedClasses?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>
                  ))}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentSubjectId} onChange={(event) => setAssignmentSubjectId(event.target.value)}>
                  {!assignmentOptions.length ? <option value="">No assigned subjects for this classroom</option> : null}
                  {assignmentOptions.map((item) => (
                    <option key={item.id} value={item.subject_id}>
                      {item.subject_code || 'SUB'} - {item.subject_name || 'Subject'}
                    </option>
                  ))}
                </select>
                <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" rows={3} placeholder="Description" value={assignmentDescription} onChange={(event) => setAssignmentDescription(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} />
                <input type="number" min="1" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentMaximumMarks} onChange={(event) => setAssignmentMaximumMarks(event.target.value)} />
                {!assignmentOptions.length ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 md:col-span-4">
                    This teacher does not yet have a subject assignment for the selected classroom. Create the teacher-subject assignment first.
                  </div>
                ) : null}
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAssignmentForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Create</button>
                </div>
              </form>
            ) : null}

            {gradingSubmissionId ? (
              <form onSubmit={gradeSubmission} className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 md:grid-cols-3">
                <input type="number" min="0" className="rounded border bg-white px-3 py-2 text-xs" value={gradingMarks} onChange={(event) => setGradingMarks(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Teacher feedback" value={gradingFeedback} onChange={(event) => setGradingFeedback(event.target.value)} />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setGradingSubmissionId(null)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-emerald-700 px-4 py-2 text-xs font-bold text-white">Grade</button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">My Assignments</div>
                <div className="divide-y divide-slate-100">
                  {(workspace?.assignments || []).map((item) => (
                    <div key={item.id} className="px-4 py-3 text-xs">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-slate-500">{item.description || 'No description'}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        Due: {String(item.due_date || '').slice(0, 10)} | Max: {item.maximum_marks ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Recent Submissions</div>
                <div className="divide-y divide-slate-100">
                  {(workspace?.submissions || []).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.assignment_title || 'Assignment Submission'}</p>
                        <p className="mt-1 text-slate-500">Student #{item.student_id} | {item.submission_status || 'SUBMITTED'}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{String(item.submitted_at || '').replace('T', ' ').slice(0, 16)}</p>
                      </div>
                      <button
                        onClick={() => {
                          setGradingSubmissionId(item.id);
                          setGradingMarks(String(item.marks_obtained ?? 0));
                          setGradingFeedback('');
                        }}
                        className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700"
                      >
                        Grade
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'exams' ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <Award className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="font-bold">Exams and report-card summary</p>
                  <p className="mt-1 text-xs text-blue-700">This section shows your assigned exam schedule and the latest published report-card results for your classes.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  Upcoming Exams
                </div>
                {(workspace?.upcomingExams || []).length ? (
                  <div className="divide-y divide-slate-100">
                    {(workspace?.upcomingExams || []).map((item, index) => (
                      <div key={`${item.id}-${index}`} className="px-4 py-3 text-xs">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="mt-1 text-slate-500">
                          {item.classroom_name || 'Classroom'}{item.section_name ? ` - ${item.section_name}` : ''} | {item.subject_code || 'SUB'} {item.subject_name || 'Subject'}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Exam Date: {String(item.exam_date || item.start_date || '').slice(0, 10) || '-'}
                          {item.subject_start_time ? ` | ${item.subject_start_time} - ${item.subject_end_time || ''}` : ''}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-400">{item.status || 'PLANNED'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-xs text-slate-500">
                    No exam schedule has been created yet for your assigned classes and subjects.
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800 flex items-center gap-2">
                  <BookOpenCheck className="h-4 w-4 text-emerald-600" />
                  Published Report Cards
                </div>
                {(workspace?.reportCards || []).length ? (
                  <div className="divide-y divide-slate-100">
                    {(workspace?.reportCards || []).map((item) => (
                      <div key={item.id} className="px-4 py-3 text-xs">
                        <p className="font-bold text-slate-900">
                          {item.first_name || students.find((student) => String(student.id) === String(item.student_id))?.first_name || 'Student'}{' '}
                          {item.last_name || students.find((student) => String(student.id) === String(item.student_id))?.last_name || `#${item.student_id}`}
                        </p>
                        <p className="mt-1 text-slate-500">
                          {item.admission_number || `Student #${item.student_id}`} | {item.classroom_name || 'Classroom'}{item.section_name ? ` - ${item.section_name}` : ''}
                        </p>
                        <p className="mt-1 text-slate-500">
                          Average: {item.average_percentage ?? '-'}% | Grade: {item.overall_grade || '-'} | Position: {item.class_position ?? '-'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-xs text-slate-500">
                    No report cards have been generated yet for your assigned classes.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-800">Teacher Marks Entry</p>
                  <p className="mt-1 text-xs text-slate-500">Enter marks for your assigned exam subjects using real enrolled students from the selected classroom.</p>
                </div>
                <button onClick={() => void saveExamResults()} className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                  Save Results
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <select className="rounded border bg-white px-3 py-2 text-xs font-bold" value={selectedExamSubjectId} onChange={(event) => setSelectedExamSubjectId(event.target.value)}>
                  {(workspace?.upcomingExams || []).map((item, index) => (
                    <option key={`${item.id}-${index}`} value={(item as any).exam_subject_id}>
                      {item.name} | {item.classroom_name || 'Classroom'} | {item.subject_code || 'SUB'} - {item.subject_name || 'Subject'}
                    </option>
                  ))}
                </select>
                <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  {selectedExam
                    ? `${selectedExam.classroom_name || 'Classroom'} | ${selectedExam.subject_name || 'Subject'} | ${String(selectedExam.exam_date || selectedExam.start_date || '').slice(0, 10)}`
                    : 'No exam subject selected yet.'}
                </div>
              </div>

              {loadingExamResults ? (
                <div className="mt-4 text-xs text-slate-500">Loading saved marks...</div>
              ) : examStudents.length ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 font-bold text-slate-500">
                      <tr>
                        <th className="px-4 py-3">Admission</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Marks</th>
                        <th className="px-4 py-3">Absent</th>
                        <th className="px-4 py-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {examStudents.map((student) => {
                        const key = String(student.id);
                        const draft = examMarksByStudent[key] || { marksObtained: '', remarks: '', isAbsent: false };
                        return (
                          <tr key={key}>
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">{student.admission_number}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{student.first_name} {student.last_name}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                disabled={draft.isAbsent}
                                className="w-24 rounded border bg-white px-3 py-2 text-xs"
                                value={draft.marksObtained}
                                onChange={(event) =>
                                  setExamMarksByStudent((prev) => ({
                                    ...prev,
                                    [key]: { ...draft, marksObtained: event.target.value },
                                  }))
                                }
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={draft.isAbsent}
                                onChange={(event) =>
                                  setExamMarksByStudent((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...draft,
                                      isAbsent: event.target.checked,
                                      marksObtained: event.target.checked ? '' : draft.marksObtained,
                                    },
                                  }))
                                }
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                className="w-full rounded border bg-white px-3 py-2 text-xs"
                                value={draft.remarks}
                                onChange={(event) =>
                                  setExamMarksByStudent((prev) => ({
                                    ...prev,
                                    [key]: { ...draft, remarks: event.target.value },
                                  }))
                                }
                                placeholder="Optional remark"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
                  No students or exam subjects are available yet for marks entry. First create exam subjects for the teacher's assigned classroom and subject.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-800">Assigned Class Report View</p>
              <p className="mt-1 text-xs text-slate-500">This roster comes directly from your assigned classrooms in the database and helps confirm the classes you are reporting on.</p>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                {assignedClassSummaries.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-sm font-bold text-slate-900">
                      {item.name}{item.section_name ? ` - ${item.section_name}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.studentCount} active students | {item.subjects.length} assigned subjects</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.subjects.map((subject) => (
                        <span key={subject.id} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                          {subject.subject_code || 'SUB'} - {subject.subject_name || 'Subject'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
