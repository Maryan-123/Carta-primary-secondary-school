import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Award, BookOpenCheck, CalendarDays, ClipboardList, GraduationCap, Save } from 'lucide-react';
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

const isActiveEnrollmentStatus = (value?: string | null) => {
  const normalized = String(value || '').trim().toUpperCase();
  if (!normalized) return true;
  return !['INACTIVE', 'COMPLETED', 'TRANSFERRED', 'WITHDRAWN', 'CANCELLED'].includes(normalized);
};

export default function AcademicsOperational() {
  const { currentUser, activeTab } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [workspace, setWorkspace] = useState<TeacherWorkspace | null>(null);
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

  useEffect(() => {
    if (currentUser?.role === 'TEACHER') {
      void loadTeacherWorkspace();
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

    const directStudents = (workspace?.assignedStudents || []).filter((item) => {
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
      if (currentAcademicYearId && item.academic_year_id && toNumber(item.academic_year_id) !== currentAcademicYearId) {
        return false;
      }
      if (currentTermId && item.term_id && toNumber(item.term_id) !== currentTermId) {
        return false;
      }
      return true;
    });
  }, [assignmentClassroomId, currentAcademicYearId, currentTermId, selectedClassroomId, workspace?.assignmentLinks]);

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

    const firstExamSubjectId = String((workspace.upcomingExams[0] as any).exam_subject_id || '');
    setSelectedExamSubjectId((prev) => prev || firstExamSubjectId);
  }, [workspace?.upcomingExams]);

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

    if (currentUser?.role === 'TEACHER' && activeTab === 'attendance') {
      void loadAttendance();
    }
  }, [activeTab, attendanceDate, currentUser?.role, selectedClassroomId]);

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
      const payload = {
        academicYearId: effectiveAcademicYearId,
        termId: effectiveTermId,
        classroomId: toNumber(selectedClassroomId),
        attendanceDate,
        records,
      };

      if (existingAttendanceSessionId) {
        await axiosClient.put(`/attendance/sessions/${existingAttendanceSessionId}/records`, { records });
      } else {
        await axiosClient.post('/attendance/sessions', payload);
      }

      toast.success(existingAttendanceSessionId ? 'Attendance updated successfully.' : 'Attendance recorded successfully.');
      await loadTeacherWorkspace();
    } catch (error: any) {
      toast.error(getApiErrorMessage(error, 'Unable to save attendance.'));
    }
  };

  const createAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    const effectiveAcademicYearId = currentAcademicYearId ?? selectedTeacherLink?.academic_year_id ?? null;
    const effectiveTermId = currentTermId ?? selectedTeacherLink?.term_id ?? null;

    if (!workspace?.teacherId || !effectiveAcademicYearId || !effectiveTermId) {
      toast.error('Teacher context is not ready yet.');
      return;
    }

    if (!assignmentClassroomId || !assignmentSubjectId) {
      toast.error('Select a valid assigned classroom and subject first.');
      return;
    }

    try {
      await axiosClient.post('/assignments', {
        academicYearId: effectiveAcademicYearId,
        termId: effectiveTermId,
        classroomId: toNumber(assignmentClassroomId),
        subjectId: toNumber(assignmentSubjectId),
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

  if (currentUser?.role !== 'TEACHER') {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-600">
        Teacher operational tools are being migrated to real backend data first. Admin and principal academic operations will be updated next.
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <select className="rounded border bg-white px-3 py-2 text-xs font-bold" value={selectedClassroomId} onChange={(event) => setSelectedClassroomId(event.target.value)}>
                {workspace?.assignedClasses?.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>
                ))}
              </select>
              <input type="date" className="rounded border bg-white px-3 py-2 text-xs font-bold" value={attendanceDate} onChange={(event) => setAttendanceDate(event.target.value)} />
              <button onClick={() => void saveAttendance()} className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                <Save className="mr-1 inline h-4 w-4" />
                Save Attendance
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Admission</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activeStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{student.admission_number}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{student.first_name} {student.last_name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED', 'SICK'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => setAttendanceStatusByStudent((prev) => ({ ...prev, [student.id]: status }))}
                              className={`rounded border px-3 py-1 text-[10px] font-bold ${
                                (attendanceStatusByStudent[student.id] || 'PRESENT') === status
                                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
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
              <button onClick={() => setShowAssignmentForm((value) => !value)} className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">New Assignment</button>
            </div>

            {showAssignmentForm ? (
              <form onSubmit={createAssignment} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                <input className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" placeholder="Assignment title" value={assignmentTitle} onChange={(event) => setAssignmentTitle(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentClassroomId} onChange={(event) => setAssignmentClassroomId(event.target.value)}>
                  {workspace?.assignedClasses?.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</option>
                  ))}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={assignmentSubjectId} onChange={(event) => setAssignmentSubjectId(event.target.value)}>
                  {assignmentOptions.map((item) => (
                    <option key={item.id} value={item.subject_id}>
                      {item.subject_code || 'SUB'} - {item.subject_name || 'Subject'}
                    </option>
                  ))}
                </select>
                <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" rows={3} placeholder="Description" value={assignmentDescription} onChange={(event) => setAssignmentDescription(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentDueDate} onChange={(event) => setAssignmentDueDate(event.target.value)} />
                <input type="number" min="1" className="rounded border bg-white px-3 py-2 text-xs" value={assignmentMaximumMarks} onChange={(event) => setAssignmentMaximumMarks(event.target.value)} />
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
