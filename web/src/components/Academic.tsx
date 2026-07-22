import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosClient } from '../api';
import { useUIStore } from '../store';
import { Pencil, Plus, RefreshCw, Save, Trash2, Users, BookOpenCheck } from 'lucide-react';

type AcademicTab = 'classes' | 'subjects' | 'assignments' | 'years';

interface ApiAcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'PLANNED';
}

interface ApiTerm {
  id: number;
  academic_year_id: number;
  academic_year_name?: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current?: boolean;
  status: 'ACTIVE' | 'CLOSED' | 'PLANNED';
}

interface ApiGradeLevel {
  id: number;
  name: string;
  level_order: number;
}

interface ApiClassroom {
  id: number;
  grade_level_id: number;
  grade_level_name?: string;
  name: string;
  section_name?: string | null;
  capacity: number;
  class_teacher_id?: number | null;
  is_active?: boolean;
}

interface ApiSubject {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  maximum_marks: number;
  pass_marks: number;
  is_active?: boolean;
}

interface ApiTeacher {
  id: number;
  staff_id: number;
  teacher_number: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

interface ApiTeacherAssignment {
  id: number;
  teacher_id: number;
  classroom_id: number;
  subject_id: number;
  academic_year_id: number;
  term_id: number;
  classroom_name?: string;
  subject_name?: string;
  academic_year_name?: string;
  term_name?: string;
}

interface ApiClassSubject {
  id: number;
  classroom_id: number;
  subject_id: number;
  academic_year_id: number;
}

const toInputDate = (value?: string | null) => (value ? String(value).slice(0, 10) : '');
const TEACHER_NAME_STORAGE_KEY = 'teacher-name-overrides';

type TeacherNameOverrideMap = Record<string, { firstName: string; lastName: string }>;

const readTeacherNameOverrides = (): TeacherNameOverrideMap => {
  try {
    const raw = window.localStorage.getItem(TEACHER_NAME_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const formatApiError = (error: any, fallback: string) => {
  const fieldErrors = error?.response?.data?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    return fieldErrors
      .map((item: { field?: string; message?: string }) => `${item.field ? `${item.field}: ` : ''}${item.message || 'Invalid value'}`)
      .join(' | ');
  }
  return error?.response?.data?.message || error?.message || fallback;
};

export default function Academic() {
  const openConfirm = useUIStore((state) => state.openConfirm);
  const [activeTab, setActiveTab] = useState<AcademicTab>('classes');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [academicYears, setAcademicYears] = useState<ApiAcademicYear[]>([]);
  const [terms, setTerms] = useState<ApiTerm[]>([]);
  const [gradeLevels, setGradeLevels] = useState<ApiGradeLevel[]>([]);
  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [subjects, setSubjects] = useState<ApiSubject[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<ApiTeacherAssignment[]>([]);
  const [classSubjects, setClassSubjects] = useState<ApiClassSubject[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);
  const [currentTermId, setCurrentTermId] = useState<number | null>(null);

  const [editingClassroomId, setEditingClassroomId] = useState<number | null>(null);
  const [editingSubjectId, setEditingSubjectId] = useState<number | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [gradeLevelForm, setGradeLevelForm] = useState({
    name: 'Grade 1',
    levelOrder: 1,
    description: '',
  });

  const [classForm, setClassForm] = useState({
    name: '',
    gradeLevelId: '',
    capacity: 30,
    classTeacherId: '',
  });

  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    description: '',
    maximumMarks: 100,
    passMarks: 50,
  });

  const [assignmentForm, setAssignmentForm] = useState({
    classroomId: '',
    subjectId: '',
    teacherId: '',
  });

  const gradeLevelMap = useMemo(() => new Map(gradeLevels.map((item) => [item.id, item])), [gradeLevels]);
  const teacherMap = useMemo(() => new Map(teachers.map((item) => [item.id, item])), [teachers]);
  const getTeacherDisplayName = (teacher?: ApiTeacher) => {
    if (!teacher) return 'Unassigned';
    const override = readTeacherNameOverrides()[String(teacher.staff_id)];
    const fullName = `${teacher.first_name || override?.firstName || ''} ${teacher.last_name || override?.lastName || ''}`.trim();
    return fullName || teacher.email || teacher.teacher_number;
  };
  const nextGradeLevelOrder = useMemo(() => (gradeLevels.length ? Math.max(...gradeLevels.map((item) => Number(item.level_order) || 0)) + 1 : 1), [gradeLevels]);
  const primarySubjectPresets = [
    { name: 'English', code: 'ENG' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Somali', code: 'SOM' },
    { name: 'Science', code: 'SCI' },
    { name: 'Social Studies', code: 'SST' },
    { name: 'Arabic', code: 'ARB' },
  ];
  const secondarySubjectPresets = [
    { name: 'English', code: 'ENG' },
    { name: 'Physics', code: 'PHY' },
    { name: 'Mathematics', code: 'MATH' },
    { name: 'Chemistry', code: 'CHEM' },
    { name: 'Biology', code: 'BIO' },
    { name: 'History', code: 'HIST' },
    { name: 'Geography', code: 'GEO' },
    { name: 'Technology', code: 'TECH' },
    { name: 'Business', code: 'BUS' },
    { name: 'Tarbiyo', code: 'TAR' },
    { name: 'Arabic', code: 'ARB' },
    { name: 'Somali', code: 'SOM' },
  ];

  const refreshAcademicData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [
        yearsResponse,
        termsResponse,
        gradeLevelsResponse,
        classroomsResponse,
        subjectsResponse,
        teachersResponse,
        assignmentsResponse,
        classSubjectsResponse,
        currentYearResponse,
        currentTermResponse,
      ] = await Promise.all([
        axiosClient.get('/academic-years'),
        axiosClient.get('/terms'),
        axiosClient.get('/grade-levels'),
        axiosClient.get('/classrooms'),
        axiosClient.get('/subjects'),
        axiosClient.get('/teachers'),
        axiosClient.get('/teacher-subject-assignments'),
        axiosClient.get('/class-subjects'),
        axiosClient.get('/academic-years/current').catch(() => ({ data: { data: null } })),
        axiosClient.get('/terms/current').catch(() => ({ data: { data: null } })),
      ]);

      setAcademicYears(yearsResponse.data?.data || []);
      setTerms(termsResponse.data?.data || []);
      setGradeLevels(gradeLevelsResponse.data?.data || []);
      setClassrooms(classroomsResponse.data?.data || []);
      setSubjects(subjectsResponse.data?.data || []);
      setTeachers(teachersResponse.data?.data || []);
      setTeacherAssignments(assignmentsResponse.data?.data || []);
      setClassSubjects(classSubjectsResponse.data?.data || []);
      setCurrentAcademicYearId(currentYearResponse.data?.data?.id ? Number(currentYearResponse.data.data.id) : null);
      setCurrentTermId(currentTermResponse.data?.data?.id ? Number(currentTermResponse.data.data.id) : null);
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load academic data from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshAcademicData();
  }, []);

  useEffect(() => {
    setGradeLevelForm((prev) => ({
      ...prev,
      name: prev.name ? prev.name : `Grade ${nextGradeLevelOrder}`,
      levelOrder: prev.levelOrder || nextGradeLevelOrder,
    }));
  }, [nextGradeLevelOrder]);

  const resetClassForm = () => {
    setClassForm({ name: '', gradeLevelId: '', capacity: 30, classTeacherId: '' });
    setEditingClassroomId(null);
  };

  const resetGradeLevelForm = () => {
    setGradeLevelForm({ name: `Grade ${nextGradeLevelOrder}`, levelOrder: nextGradeLevelOrder, description: '' });
  };

  const resetSubjectForm = () => {
    setSubjectForm({ name: '', code: '', description: '', maximumMarks: 100, passMarks: 50 });
    setEditingSubjectId(null);
  };

  const buildSubjectCode = (name: string) =>
    name
      .split(/[\s./,&-]+/)
      .filter(Boolean)
      .map((part) => part.slice(0, 3).toUpperCase())
      .join('')
      .slice(0, 8);

  const resetAssignmentForm = () => {
    setAssignmentForm({ classroomId: '', subjectId: '', teacherId: '' });
    setEditingAssignmentId(null);
  };

  const handleSaveClassroom = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!classForm.name || !classForm.gradeLevelId) {
      return;
    }

    setErrorMessage('');
    try {
      const payload = {
        gradeLevelId: Number(classForm.gradeLevelId),
        name: classForm.name,
        capacity: classForm.capacity,
        classTeacherId: classForm.classTeacherId ? Number(classForm.classTeacherId) : undefined,
        isActive: true,
      };

      if (editingClassroomId) {
        await axiosClient.patch(`/classrooms/${editingClassroomId}`, payload);
      } else {
        await axiosClient.post('/classrooms', payload);
      }

      await refreshAcademicData();
      resetClassForm();
      toast.success(editingClassroomId ? 'Classroom updated successfully.' : 'Classroom created successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to save classroom.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSaveGradeLevel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!gradeLevelForm.name.trim()) {
      return;
    }

    setErrorMessage('');
    try {
      await axiosClient.post('/grade-levels', {
        name: gradeLevelForm.name.trim(),
        levelOrder: Number(gradeLevelForm.levelOrder),
        description: gradeLevelForm.description || undefined,
        isActive: true,
      });
      await refreshAcademicData();
      resetGradeLevelForm();
      toast.success('Grade level created successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to save grade level.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCreateDefaultGradeLevels = async () => {
    setErrorMessage('');
    try {
      for (let level = 1; level <= 12; level += 1) {
        const name = `Grade ${level}`;
        const exists = gradeLevels.some((item) => item.name.trim().toLowerCase() === name.toLowerCase());
        if (!exists) {
          await axiosClient.post('/grade-levels', {
            name,
            levelOrder: level,
            description: level <= 8 ? 'Primary level' : 'Secondary level',
            isActive: true,
          });
        }
      }
      await refreshAcademicData();
      resetGradeLevelForm();
      toast.success('Standard grade levels loaded successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to load standard grade levels.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditClassroom = (classroom: ApiClassroom) => {
    setEditingClassroomId(classroom.id);
    setClassForm({
      name: classroom.name,
      gradeLevelId: String(classroom.grade_level_id),
      capacity: classroom.capacity,
      classTeacherId: classroom.class_teacher_id ? String(classroom.class_teacher_id) : '',
    });
  };

  const handleDeleteClassroom = async (classroomId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete classroom?',
      message: 'This will remove the classroom from academic setup if there are no linked records blocking it.',
      confirmLabel: 'Delete classroom',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/classrooms/${classroomId}`);
      await refreshAcademicData();
      if (editingClassroomId === classroomId) {
        resetClassForm();
      }
      toast.success('Classroom deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete classroom.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSaveSubject = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!subjectForm.name || !subjectForm.code) {
      return;
    }

    setErrorMessage('');
    try {
      const payload = {
        code: subjectForm.code,
        name: subjectForm.name,
        description: subjectForm.description || undefined,
        maximumMarks: subjectForm.maximumMarks,
        passMarks: subjectForm.passMarks,
        isActive: true,
      };

      if (editingSubjectId) {
        await axiosClient.patch(`/subjects/${editingSubjectId}`, payload);
      } else {
        await axiosClient.post('/subjects', payload);
      }

      await refreshAcademicData();
      resetSubjectForm();
      toast.success(editingSubjectId ? 'Subject updated successfully.' : 'Subject created successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to save subject.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditSubject = (subject: ApiSubject) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      maximumMarks: Number(subject.maximum_marks),
      passMarks: Number(subject.pass_marks),
    });
  };

  const handleDeleteSubject = async (subjectId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete subject?',
      message: 'The selected subject will be removed if it is not in use by linked academic records.',
      confirmLabel: 'Delete subject',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/subjects/${subjectId}`);
      await refreshAcademicData();
      if (editingSubjectId === subjectId) {
        resetSubjectForm();
      }
      toast.success('Subject deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete subject.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCreateSubjectPreset = async (preset: Array<{ name: string; code: string }>) => {
    setErrorMessage('');
    try {
      for (const item of preset) {
        const exists = subjects.some(
          (subject) =>
            subject.name.trim().toLowerCase() === item.name.toLowerCase() ||
            subject.code.trim().toLowerCase() === item.code.toLowerCase(),
        );
        if (!exists) {
          await axiosClient.post('/subjects', {
            name: item.name,
            code: item.code,
            maximumMarks: 100,
            passMarks: 50,
            isActive: true,
          });
        }
      }
      await refreshAcademicData();
      toast.success('Standard subjects loaded successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to load standard subjects.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const ensureClassSubject = async (classroomId: number, subjectId: number) => {
    if (!currentAcademicYearId) {
      throw new Error('Please set a current academic year before assigning teachers.');
    }

    const exists = classSubjects.some(
      (item) => Number(item.classroom_id) === classroomId && Number(item.subject_id) === subjectId && Number(item.academic_year_id) === Number(currentAcademicYearId),
    );

    if (!exists) {
      await axiosClient.post('/class-subjects', {
        classroomId: Number(classroomId),
        subjectId: Number(subjectId),
        academicYearId: Number(currentAcademicYearId),
        isCompulsory: true,
      });
    }
  };

  const handleSaveTeacherAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assignmentForm.classroomId || !assignmentForm.subjectId || !assignmentForm.teacherId) {
      return;
    }

    if (!currentAcademicYearId || !currentTermId) {
      setErrorMessage('Please set the current academic year and current term before assigning teachers.');
      return;
    }

    setErrorMessage('');
    try {
      const classroomId = Number(assignmentForm.classroomId);
      const subjectId = Number(assignmentForm.subjectId);
      const teacherId = Number(assignmentForm.teacherId);

      await ensureClassSubject(classroomId, subjectId);

      const payload = {
        teacherId: Number(teacherId),
        classroomId: Number(classroomId),
        subjectId: Number(subjectId),
        academicYearId: Number(currentAcademicYearId),
        termId: Number(currentTermId),
      };

      if (editingAssignmentId) {
        await axiosClient.patch(`/teacher-subject-assignments/${editingAssignmentId}`, payload);
      } else {
        await axiosClient.post('/teacher-subject-assignments', payload);
      }

      await refreshAcademicData();
      resetAssignmentForm();
      toast.success(editingAssignmentId ? 'Teacher assignment updated successfully.' : 'Teacher assignment saved successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to save teacher assignment.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditAssignment = (item: ApiTeacherAssignment) => {
    setEditingAssignmentId(item.id);
    setAssignmentForm({
      classroomId: String(item.classroom_id),
      subjectId: String(item.subject_id),
      teacherId: String(item.teacher_id),
    });
  };

  const handleDeleteTeacherAssignment = async (assignmentId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete teacher assignment?',
      message: 'This will unassign the teacher from the selected class and subject.',
      confirmLabel: 'Delete assignment',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/teacher-subject-assignments/${assignmentId}`);
      await refreshAcademicData();
      if (editingAssignmentId === assignmentId) {
        resetAssignmentForm();
      }
      toast.success('Teacher assignment deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete teacher assignment.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSetCurrentYear = async (yearId: number) => {
    setErrorMessage('');
    try {
      await axiosClient.patch(`/academic-years/${yearId}/set-current`);
      await refreshAcademicData();
      toast.success('Current academic year updated successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to set current academic year.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDeleteAcademicYear = async (academicYearId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete academic year?',
      message: 'Delete this academic year only if it has no protected linked records.',
      confirmLabel: 'Delete year',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/academic-years/${academicYearId}`);
      await refreshAcademicData();
      toast.success('Academic year deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete academic year.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSetCurrentTerm = async (termId: number) => {
    setErrorMessage('');
    try {
      await axiosClient.patch(`/terms/${termId}/set-current`);
      await refreshAcademicData();
      toast.success('Current term updated successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to set current term.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleDeleteTerm = async (termId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete term?',
      message: 'This will remove the term if there are no linked records preventing deletion.',
      confirmLabel: 'Delete term',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/terms/${termId}`);
      await refreshAcademicData();
      toast.success('Term deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete term.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <div id="academic-view" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-base font-black text-slate-800">Academic & Course Setup</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage real classrooms, subjects, teacher assignments, and term structure.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1 p-0.5 bg-slate-200 rounded-lg">
            {(['classes', 'subjects', 'assignments', 'years'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-md cursor-pointer transition ${
                  activeTab === tab ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'years' ? 'Terms & Years' : tab === 'assignments' ? 'Teacher Assignments' : tab}
              </button>
            ))}
          </div>
          <button onClick={() => void refreshAcademicData()} className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600">
            <RefreshCw className="inline h-4 w-4 mr-1" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {errorMessage ? <p className="text-xs font-bold text-rose-700">{errorMessage}</p> : null}
        {loading ? <p className="text-xs text-slate-500">Loading academic records from PostgreSQL...</p> : null}

        {activeTab === 'classes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl self-start">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Grade Levels</h3>
                  <p className="mt-1 text-xs text-slate-500">Register any level you want, or load the full standard list.</p>
                </div>
                <button type="button" onClick={() => void handleCreateDefaultGradeLevels()} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">
                  <Plus className="mr-1 inline h-3.5 w-3.5" />
                  Load Grade 1-12
                </button>
              </div>
              <form onSubmit={handleSaveGradeLevel} className="space-y-3">
                <input
                  type="text"
                  value={gradeLevelForm.name}
                  onChange={(e) => setGradeLevelForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Grade name"
                />
                <input
                  type="number"
                  min="1"
                  value={gradeLevelForm.levelOrder}
                  onChange={(e) => setGradeLevelForm((prev) => ({ ...prev, levelOrder: Number(e.target.value) }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Level order"
                />
                <input
                  type="text"
                  value={gradeLevelForm.description}
                  onChange={(e) => setGradeLevelForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="Description"
                />
                <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold">
                  <Save className="inline h-4 w-4 mr-1" />
                  Save Grade Level
                </button>
              </form>
              <div className="mt-4 max-h-44 space-y-2 overflow-y-auto">
                {gradeLevels.map((item) => (
                  <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                    <span className="font-bold text-slate-800">{item.name}</span>
                    <span className="ml-2 text-slate-500">Order {item.level_order}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl self-start">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
                {editingClassroomId ? 'Update Classroom' : 'Add Classroom'}
              </h3>
              <form onSubmit={handleSaveClassroom} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Classroom name"
                  value={classForm.name}
                  onChange={(e) => setClassForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                />
                <select
                  required
                  value={classForm.gradeLevelId}
                  onChange={(e) => setClassForm((prev) => ({ ...prev, gradeLevelId: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Choose grade level</option>
                  {gradeLevels.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={classForm.capacity}
                  onChange={(e) => setClassForm((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                />
                <select
                  value={classForm.classTeacherId}
                  onChange={(e) => setClassForm((prev) => ({ ...prev, classTeacherId: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Choose class teacher</option>
                  {teachers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {getTeacherDisplayName(item)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold">
                    <Save className="inline h-4 w-4 mr-1" />
                    {editingClassroomId ? 'Update' : 'Save'}
                  </button>
                  {editingClassroomId ? (
                    <button type="button" onClick={resetClassForm} className="px-3 py-2 border rounded-md text-xs font-bold text-slate-600">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Classroom</th>
                    <th className="px-4 py-3">Grade</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Class Teacher</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classrooms.map((item) => {
                    const grade = item.grade_level_name || gradeLevelMap.get(item.grade_level_id)?.name;
                    const teacher = item.class_teacher_id ? teacherMap.get(item.class_teacher_id) : undefined;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                        <td className="px-4 py-3">{grade || 'N/A'}</td>
                        <td className="px-4 py-3">{item.capacity}</td>
                        <td className="px-4 py-3">{getTeacherDisplayName(teacher)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title="Edit classroom" onClick={() => handleEditClassroom(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button title="Delete classroom" onClick={() => void handleDeleteClassroom(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl self-start">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    {editingSubjectId ? 'Update Subject' : 'Add Subject'}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Subject code is generated automatically from the subject name.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => void handleCreateSubjectPreset(primarySubjectPresets)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-700">
                    <Plus className="mr-1 inline h-3.5 w-3.5" />
                    Primary Set
                  </button>
                  <button type="button" onClick={() => void handleCreateSubjectPreset(secondarySubjectPresets)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">
                    <Plus className="mr-1 inline h-3.5 w-3.5" />
                    Secondary Set
                  </button>
                </div>
              </div>
              <form onSubmit={handleSaveSubject} className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Subject name"
                  value={subjectForm.name}
                  onChange={(e) =>
                    setSubjectForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                      code: editingSubjectId ? prev.code : buildSubjectCode(e.target.value),
                    }))
                  }
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                />
                <input
                  type="text"
                  required
                  placeholder="Subject code"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                />
                <textarea
                  placeholder="Description"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md min-h-24"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="1"
                    value={subjectForm.maximumMarks}
                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, maximumMarks: Number(e.target.value) }))}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Maximum marks"
                  />
                  <input
                    type="number"
                    min="0"
                    value={subjectForm.passMarks}
                    onChange={(e) => setSubjectForm((prev) => ({ ...prev, passMarks: Number(e.target.value) }))}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md"
                    placeholder="Pass marks"
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold">
                    <Save className="inline h-4 w-4 mr-1" />
                    {editingSubjectId ? 'Update' : 'Save'}
                  </button>
                  {editingSubjectId ? (
                    <button type="button" onClick={resetSubjectForm} className="px-3 py-2 border rounded-md text-xs font-bold text-slate-600">
                      Cancel
                    </button>
                  ) : null}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Marks</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {subjects.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.code}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3">{item.pass_marks} / {item.maximum_marks}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button title="Edit subject" onClick={() => handleEditSubject(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button title="Delete subject" onClick={() => void handleDeleteSubject(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Assign Teacher To Subject</h3>
                  <p className="mt-1 text-xs text-slate-500">This is the main admin screen where teachers are assigned to classroom subjects.</p>
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">
                  <BookOpenCheck className="inline h-3.5 w-3.5 mr-1" />
                  Teacher Subject Assignment
                </div>
              </div>
              <form onSubmit={handleSaveTeacherAssignment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  required
                  value={assignmentForm.classroomId}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, classroomId: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Choose classroom</option>
                  {classrooms.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <select
                  required
                  value={assignmentForm.subjectId}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, subjectId: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Choose subject</option>
                  {subjects.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
                <select
                  required
                  value={assignmentForm.teacherId}
                  onChange={(e) => setAssignmentForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md bg-white"
                >
                  <option value="">Choose teacher</option>
                  {teachers.map((item) => (
                    <option key={item.id} value={item.id}>{getTeacherDisplayName(item)}</option>
                  ))}
                </select>
                <button type="submit" className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-bold">
                  <Plus className="inline h-4 w-4 mr-1" />
                  {editingAssignmentId ? 'Update Assignment' : 'Save Assignment'}
                </button>
              </form>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Classroom</th>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Year / Term</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {teacherAssignments.map((item) => {
                    const teacher = teacherMap.get(item.teacher_id);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{item.classroom_name || 'Unknown classroom'}</td>
                        <td className="px-4 py-3">{item.subject_name || 'Unknown subject'}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-600" />
                            <span>{getTeacherDisplayName(teacher)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.academic_year_name || 'Current'} / {item.term_name || 'Current'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title="Edit assignment" onClick={() => handleEditAssignment(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button title="Delete assignment" onClick={() => void handleDeleteTeacherAssignment(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'years' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Academic Years</h3>
              <div className="divide-y divide-slate-100">
                {academicYears.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{toInputDate(item.start_date)} to {toInputDate(item.end_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.is_current ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Current
                        </span>
                      ) : (
                        <button onClick={() => void handleSetCurrentYear(item.id)} className="px-2 py-1 border rounded text-[10px] font-bold text-blue-700">
                          Set Current
                        </button>
                      )}
                      <button onClick={() => void handleDeleteAcademicYear(item.id)} className="px-2 py-1 border rounded text-[10px] font-bold text-rose-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Terms</h3>
              <div className="divide-y divide-slate-100">
                {terms.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{toInputDate(item.start_date)} to {toInputDate(item.end_date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.is_current ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          Current
                        </span>
                      ) : (
                        <button onClick={() => void handleSetCurrentTerm(item.id)} className="px-2 py-1 border rounded text-[10px] font-bold text-blue-700">
                          Set Current
                        </button>
                      )}
                      <button onClick={() => void handleDeleteTerm(item.id)} className="px-2 py-1 border rounded text-[10px] font-bold text-rose-700">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
