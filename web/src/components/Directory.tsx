import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { axiosClient } from '../api';
import { useUIStore } from '../store';
import { Pencil, RefreshCw, Save, Search, ShieldCheck, Trash2, UserRound, Power, UserPlus, Link as LinkIcon } from 'lucide-react';

type DirectoryTab = 'students' | 'parents' | 'staff' | 'accounts';
type PersonRole = 'TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN';

interface BackendRole {
  id: number;
  name: string;
}

interface BackendUser {
  id: number;
  username: string;
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email?: string | null;
  role_name?: string;
  roleName?: string;
  is_active?: boolean;
  isActive?: boolean;
}

interface ApiClassroom {
  id: number;
  name: string;
  grade_level_id?: number;
  grade_level_name?: string;
  capacity: number;
}

interface ApiParent {
  id: number;
  user_id?: number | null;
  parent_number: string;
  first_name: string;
  last_name: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  phone: string;
  email?: string | null;
  occupation?: string | null;
  address?: string | null;
  is_active?: boolean;
}

interface ApiStudent {
  id: number;
  user_id?: number | null;
  admission_number: string;
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  date_of_birth: string;
  phone?: string | null;
  address?: string | null;
  admission_date: string;
  student_status: 'ACTIVE' | 'GRADUATED' | 'TRANSFERRED' | 'SUSPENDED' | 'WITHDRAWN';
}

interface ApiStaff {
  id: number;
  user_id?: number | null;
  employee_number: string;
  staff_type: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  hire_date: string;
  qualification?: string | null;
  employment_status: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
}

interface ApiTeacher {
  id: number;
  staff_id: number;
  teacher_number: string;
  specialization?: string | null;
  qualification?: string | null;
  years_of_experience?: number | null;
  is_class_teacher?: boolean;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
}

interface ApiEnrollment {
  id: number;
  student_id: number;
  academic_year_id: number;
  classroom_id: number;
  classroom_name?: string;
  academic_year_name?: string;
  enrollment_date: string;
  enrollment_status: 'ACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'WITHDRAWN';
}

interface ApiLinkedParent {
  parent_id: number;
  first_name: string;
  last_name: string;
}

interface ApiParentChild {
  student_id: number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

const initialStudentForm = {
  admissionNumber: '',
  firstName: '',
  lastName: '',
  gender: 'FEMALE' as 'MALE' | 'FEMALE',
  dateOfBirth: '2012-01-01',
  admissionDate: '2026-07-21',
  phone: '',
  classroomId: '',
  parentId: '',
};

const initialParentForm = {
  parentNumber: '',
  firstName: '',
  lastName: '',
  gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
  phone: '',
  email: '',
  occupation: '',
  address: '',
};

const initialStaffForm = {
  employeeNumber: '',
  firstName: '',
  lastName: '',
  gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
  email: '',
  phone: '',
  role: 'TEACHER' as PersonRole,
  hireDate: '2026-07-21',
  employmentStatus: 'ACTIVE' as 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED',
  teacherNumber: '',
  specialization: '',
};

const initialAccountForm = {
  roleId: '',
  targetType: 'NONE' as 'NONE' | 'STUDENT' | 'PARENT' | 'TEACHER',
  targetId: '',
  username: '',
  password: '',
  firstName: '',
  lastName: '',
  email: '',
  isActive: true,
};

const toInputDate = (value?: string | null) => (value ? String(value).slice(0, 10) : '');
const currentYear = new Date().getFullYear();
const formatGeneratedNumber = (prefix: string, sequence: number) => `${prefix}-${currentYear}-${String(sequence).padStart(4, '0')}`;
const getNextGeneratedSequence = (values: Array<string | undefined | null>, prefix: string) => {
  const marker = `${prefix}-${currentYear}-`;
  const maxSequence = values.reduce((max, value) => {
    if (!value || !value.startsWith(marker)) return max;
    const parsed = Number(value.slice(marker.length));
    return Number.isFinite(parsed) ? Math.max(max, parsed) : max;
  }, 0);
  return maxSequence + 1;
};

const getBumpedGeneratedNumber = (currentValue: string, values: Array<string | undefined | null>, prefix: string) => {
  const marker = `${prefix}-${currentYear}-`;
  const currentSequence = currentValue.startsWith(marker) ? Number(currentValue.slice(marker.length)) : 0;
  const nextSequence = Math.max(getNextGeneratedSequence(values, prefix), Number.isFinite(currentSequence) ? currentSequence + 1 : 1);
  return formatGeneratedNumber(prefix, nextSequence);
};

const ensureUniqueGeneratedValue = (
  currentValue: string,
  values: Array<string | undefined | null>,
  prefix: string,
  preserveValue?: string,
) => {
  const normalizedValues = values.filter((value): value is string => Boolean(value));
  if (preserveValue && currentValue === preserveValue) {
    return currentValue;
  }
  if (!normalizedValues.includes(currentValue)) {
    return currentValue;
  }
  return getBumpedGeneratedNumber(currentValue, normalizedValues, prefix);
};
const TEACHER_NAME_STORAGE_KEY = 'teacher-name-overrides';

type TeacherNameOverrideMap = Record<string, { firstName: string; lastName: string }>;

const formatApiError = (error: any, fallback: string) => {
  const fieldErrors = error?.response?.data?.errors;
  if (Array.isArray(fieldErrors) && fieldErrors.length) {
    return fieldErrors.map((item: { field?: string; message?: string }) => `${item.field ? `${item.field}: ` : ''}${item.message || 'Invalid value'}`).join(' | ');
  }
  return error?.response?.data?.message || error?.message || fallback;
};

export default function Directory() {
  const openConfirm = useUIStore((state) => state.openConfirm);
  const [activeTab, setActiveTab] = useState<DirectoryTab>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [parents, setParents] = useState<ApiParent[]>([]);
  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [teachers, setTeachers] = useState<ApiTeacher[]>([]);
  const [classrooms, setClassrooms] = useState<ApiClassroom[]>([]);
  const [enrollments, setEnrollments] = useState<ApiEnrollment[]>([]);
  const [studentParentMap, setStudentParentMap] = useState<Record<number, ApiLinkedParent[]>>({});
  const [parentChildrenMap, setParentChildrenMap] = useState<Record<number, ApiParentChild[]>>({});
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<number | null>(null);

  const [studentForm, setStudentForm] = useState(initialStudentForm);
  const [parentForm, setParentForm] = useState(initialParentForm);
  const [staffForm, setStaffForm] = useState(initialStaffForm);
  const [accountForm, setAccountForm] = useState(initialAccountForm);

  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [editingParentId, setEditingParentId] = useState<number | null>(null);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editingTeacherId, setEditingTeacherId] = useState<number | null>(null);

  const [backendUsers, setBackendUsers] = useState<BackendUser[]>([]);
  const [backendRoles, setBackendRoles] = useState<BackendRole[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [teacherNameOverrides, setTeacherNameOverrides] = useState<TeacherNameOverrideMap>(() => {
    try {
      const raw = window.localStorage.getItem(TEACHER_NAME_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const persistTeacherNameOverride = (staffId: number, firstName: string, lastName: string) => {
    const next = {
      ...teacherNameOverrides,
      [String(staffId)]: { firstName: firstName.trim(), lastName: lastName.trim() },
    };
    setTeacherNameOverrides(next);
    window.localStorage.setItem(TEACHER_NAME_STORAGE_KEY, JSON.stringify(next));
  };

  const getTeacherNameParts = (teacher?: ApiTeacher) => {
    if (!teacher) return { firstName: '', lastName: '' };
    const override = teacherNameOverrides[String(teacher.staff_id)];
    return {
      firstName: teacher.first_name || override?.firstName || teacher.email || '',
      lastName: teacher.last_name || override?.lastName || '',
    };
  };

  const getStaffNameParts = (staffMember?: ApiStaff) => {
    if (!staffMember) return { firstName: '', lastName: '' };
    return {
      firstName: staffMember.first_name || '',
      lastName: staffMember.last_name || '',
    };
  };

  const teacherByStaffId = useMemo(() => {
    return new Map(teachers.map((item) => [item.staff_id, item]));
  }, [teachers]);

  const enrollmentByStudentId = useMemo(() => {
    return new Map(enrollments.map((item) => [item.student_id, item]));
  }, [enrollments]);

  const filteredStudents = students.filter((item) =>
    item.student_status !== 'WITHDRAWN' &&
    `${item.first_name} ${item.last_name} ${item.admission_number}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredParents = parents.filter((item) =>
    `${item.first_name} ${item.last_name} ${item.parent_number}`.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredStaff = staff.filter((item) => {
    if (item.employment_status === 'TERMINATED') {
      return false;
    }
    const teacher = teacherByStaffId.get(item.id);
    const teacherNumber = teacher?.teacher_number || '';
    const teacherName = teacher ? getTeacherNameParts(teacher) : getStaffNameParts(item);
    return `${item.employee_number} ${item.staff_type} ${item.email || ''} ${teacherNumber}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${item.employee_number} ${item.staff_type} ${teacherName.firstName} ${teacherName.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
  });
  const filteredAccounts = backendUsers.filter((item) =>
    `${item.username} ${item.first_name || item.firstName || ''} ${item.last_name || item.lastName || ''} ${item.role_name || item.roleName || ''}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  const accountTargets = useMemo(() => {
    return {
      students: students.map((item) => ({
        id: item.id,
        label: `${item.admission_number} - ${item.first_name} ${item.last_name}`,
        firstName: item.first_name,
        lastName: item.last_name,
        email: '',
      })),
      parents: parents.map((item) => ({
        id: item.id,
        label: `${item.parent_number} - ${item.first_name} ${item.last_name}`,
        firstName: item.first_name,
        lastName: item.last_name,
        email: item.email || '',
      })),
      teachers: teachers.map((item) => ({
        id: item.id,
        staffId: item.staff_id,
        label: `${item.teacher_number} - ${getTeacherNameParts(item).firstName} ${getTeacherNameParts(item).lastName}`.trim(),
        firstName: getTeacherNameParts(item).firstName,
        lastName: getTeacherNameParts(item).lastName,
        email: item.email || '',
      })),
    };
  }, [students, parents, teachers, teacherNameOverrides]);

  const suggestedAdmissionNumber = useMemo(
    () => formatGeneratedNumber('ADM', getNextGeneratedSequence(students.map((item) => item.admission_number), 'ADM')),
    [students],
  );
  const suggestedParentNumber = useMemo(
    () => formatGeneratedNumber('PAR', getNextGeneratedSequence(parents.map((item) => item.parent_number), 'PAR')),
    [parents],
  );
  const suggestedTeacherNumber = useMemo(
    () => formatGeneratedNumber('TCH', getNextGeneratedSequence(teachers.map((item) => item.teacher_number), 'TCH')),
    [teachers],
  );
  const suggestedEmployeeNumber = useMemo(
    () => formatGeneratedNumber('EMP', getNextGeneratedSequence(staff.map((item) => item.employee_number), 'EMP')),
    [staff],
  );

  const resetStudentForm = () => {
    setStudentForm({ ...initialStudentForm, admissionNumber: suggestedAdmissionNumber });
    setEditingStudentId(null);
  };

  const resetParentForm = () => {
    setParentForm({ ...initialParentForm, parentNumber: suggestedParentNumber });
    setEditingParentId(null);
  };

  const resetStaffForm = () => {
    setStaffForm({ ...initialStaffForm, employeeNumber: suggestedEmployeeNumber, teacherNumber: suggestedTeacherNumber });
    setEditingStaffId(null);
    setEditingTeacherId(null);
  };

  useEffect(() => {
    if (!editingStudentId) {
      setStudentForm((prev) => (prev.admissionNumber ? prev : { ...prev, admissionNumber: suggestedAdmissionNumber }));
    }
  }, [suggestedAdmissionNumber, editingStudentId]);

  useEffect(() => {
    if (!editingParentId) {
      setParentForm((prev) => (prev.parentNumber ? prev : { ...prev, parentNumber: suggestedParentNumber }));
    }
  }, [suggestedParentNumber, editingParentId]);

  useEffect(() => {
    if (!editingStaffId) {
      setStaffForm((prev) => ({
        ...prev,
        employeeNumber: prev.employeeNumber || suggestedEmployeeNumber,
        teacherNumber: prev.teacherNumber || suggestedTeacherNumber,
      }));
    }
  }, [suggestedEmployeeNumber, suggestedTeacherNumber, editingStaffId]);

  const refreshAccounts = async () => {
    setAccountsLoading(true);
    setAccountError('');
    try {
      const [rolesResponse, usersResponse] = await Promise.all([
        axiosClient.get('/roles'),
        axiosClient.get('/users'),
      ]);
      setBackendRoles(rolesResponse.data?.data || []);
      setBackendUsers(usersResponse.data?.data || []);
    } catch (error: any) {
      setAccountError(error?.response?.data?.message || 'Unable to load portal accounts from the backend.');
    } finally {
      setAccountsLoading(false);
    }
  };

  const refreshDirectoryData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const [
        studentsResponse,
        parentsResponse,
        staffResponse,
        teachersResponse,
        classroomsResponse,
        enrollmentsResponse,
        currentYearResponse,
      ] = await Promise.all([
        axiosClient.get('/students'),
        axiosClient.get('/parents'),
        axiosClient.get('/staff'),
        axiosClient.get('/teachers'),
        axiosClient.get('/classrooms'),
        axiosClient.get('/enrollments'),
        axiosClient.get('/academic-years/current').catch(() => ({ data: { data: null } })),
      ]);

      const nextStudents = studentsResponse.data?.data || [];
      const nextParents = parentsResponse.data?.data || [];
      const nextStaff = staffResponse.data?.data || [];
      const nextTeachers = teachersResponse.data?.data || [];
      const nextClassrooms = classroomsResponse.data?.data || [];
      const nextEnrollments = enrollmentsResponse.data?.data || [];

      setStudents(nextStudents);
      setParents(nextParents);
      setStaff(nextStaff);
      setTeachers(nextTeachers);
      setClassrooms(nextClassrooms);
      setEnrollments(nextEnrollments);
      setCurrentAcademicYearId(currentYearResponse.data?.data?.id ?? null);

      const [studentParentEntries, parentChildrenEntries] = await Promise.all([
        Promise.all(
          nextStudents.map(async (student: ApiStudent) => {
            try {
              const response = await axiosClient.get(`/students/${student.id}/parents`);
              return [student.id, response.data?.data || []] as const;
            } catch {
              return [student.id, []] as const;
            }
          }),
        ),
        Promise.all(
          nextParents.map(async (parent: ApiParent) => {
            try {
              const response = await axiosClient.get(`/parents/${parent.id}/children`);
              return [parent.id, response.data?.data || []] as const;
            } catch {
              return [parent.id, []] as const;
            }
          }),
        ),
      ]);

      setStudentParentMap(Object.fromEntries(studentParentEntries));
      setParentChildrenMap(Object.fromEntries(parentChildrenEntries));
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load directory data from the backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshDirectoryData();
    void refreshAccounts();
  }, []);

  useEffect(() => {
    if (activeTab === 'accounts') {
      void refreshAccounts();
    }
  }, [activeTab]);

  const syncStudentRelationships = async (studentId: number, selectedParentId?: number) => {
    const existingParents = studentParentMap[studentId] || [];
    if (!selectedParentId) {
      return;
    }

    const existingPrimary = existingParents[0];
    if (existingPrimary && existingPrimary.parent_id !== selectedParentId) {
      await axiosClient.delete(`/students/${studentId}/parents/${existingPrimary.parent_id}`);
    }

    await axiosClient.post(`/students/${studentId}/parents`, {
      parentId: selectedParentId,
      relationship: 'GUARDIAN',
      isPrimaryContact: true,
      canPickStudent: true,
      livesWithStudent: true,
    });
  };

  const syncStudentEnrollment = async (studentId: number, classroomId: number) => {
    if (!currentAcademicYearId) {
      throw new Error('Please set a current academic year first.');
    }

    const existingEnrollment = enrollmentByStudentId.get(studentId);
    const payload = {
      studentId: Number(studentId),
      academicYearId: Number(currentAcademicYearId),
      classroomId: Number(classroomId),
      enrollmentDate: studentForm.admissionDate,
      enrollmentStatus: 'ACTIVE',
    };

    if (existingEnrollment) {
      await axiosClient.patch(`/enrollments/${existingEnrollment.id}`, payload);
    } else {
      await axiosClient.post('/enrollments', payload);
    }
  };

  const handleSaveStudent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!studentForm.admissionNumber || !studentForm.firstName || !studentForm.lastName || !studentForm.classroomId) {
      return;
    }

    setErrorMessage('');
    try {
      const existingStudentRecord = editingStudentId ? students.find((item) => item.id === editingStudentId) : undefined;
      const nextAdmissionNumber = ensureUniqueGeneratedValue(
        studentForm.admissionNumber,
        students.map((item) => item.admission_number),
        'ADM',
        existingStudentRecord?.admission_number,
      );

      if (nextAdmissionNumber !== studentForm.admissionNumber) {
        setStudentForm((prev) => ({
          ...prev,
          admissionNumber: nextAdmissionNumber,
        }));
      }

      const payload = {
        admissionNumber: nextAdmissionNumber,
        firstName: studentForm.firstName,
        lastName: studentForm.lastName,
        gender: studentForm.gender,
        dateOfBirth: studentForm.dateOfBirth,
        admissionDate: studentForm.admissionDate,
        phone: studentForm.phone || undefined,
        studentStatus: 'ACTIVE',
      };

      let studentId = editingStudentId;
      if (editingStudentId) {
        await axiosClient.patch(`/students/${editingStudentId}`, payload);
      } else {
        const response = await axiosClient.post('/students', payload);
        studentId = Number(response.data?.data?.id);
      }

      if (!studentId) {
        throw new Error('Student record was not returned by the server.');
      }

      await syncStudentEnrollment(studentId, Number(studentForm.classroomId));
      await syncStudentRelationships(studentId, studentForm.parentId ? Number(studentForm.parentId) : undefined);
      await refreshDirectoryData();
      resetStudentForm();
      toast.success(editingStudentId ? 'Student updated successfully.' : 'Student registered successfully.');
    } catch (error: any) {
      if (!editingStudentId && error?.response?.status === 409) {
        setStudentForm((prev) => ({
          ...prev,
          admissionNumber: getBumpedGeneratedNumber(prev.admissionNumber, students.map((item) => item.admission_number), 'ADM'),
        }));
      }
      const message = formatApiError(error, 'Unable to save student.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditStudent = (student: ApiStudent) => {
    const enrollment = enrollmentByStudentId.get(student.id);
    const linkedParent = studentParentMap[student.id]?.[0];
    setEditingStudentId(student.id);
    setStudentForm({
      admissionNumber: student.admission_number,
      firstName: student.first_name,
      lastName: student.last_name,
      gender: student.gender === 'MALE' ? 'MALE' : 'FEMALE',
      dateOfBirth: toInputDate(student.date_of_birth),
      admissionDate: toInputDate(student.admission_date),
      phone: student.phone || '',
      classroomId: enrollment?.classroom_id ? String(enrollment.classroom_id) : '',
      parentId: linkedParent ? String(linkedParent.parent_id) : '',
    });
  };

  const handleDeleteStudent = async (studentId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete student record?',
      message: 'This will remove the student from active records. You can continue only if you are sure.',
      confirmLabel: 'Delete student',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/students/${studentId}`);
      await refreshDirectoryData();
      if (editingStudentId === studentId) {
        resetStudentForm();
      }
      toast.success('Student deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to remove student.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSaveParent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!parentForm.parentNumber || !parentForm.firstName || !parentForm.lastName || !parentForm.phone) {
      return;
    }

    setErrorMessage('');
    try {
      const existingParentRecord = editingParentId ? parents.find((item) => item.id === editingParentId) : undefined;
      const nextParentNumber = ensureUniqueGeneratedValue(
        parentForm.parentNumber,
        parents.map((item) => item.parent_number),
        'PAR',
        existingParentRecord?.parent_number,
      );

      if (nextParentNumber !== parentForm.parentNumber) {
        setParentForm((prev) => ({
          ...prev,
          parentNumber: nextParentNumber,
        }));
      }

      const payload = {
        parentNumber: nextParentNumber,
        firstName: parentForm.firstName,
        lastName: parentForm.lastName,
        gender: parentForm.gender,
        phone: parentForm.phone,
        email: parentForm.email || undefined,
        occupation: parentForm.occupation || undefined,
        address: parentForm.address || undefined,
        isActive: true,
      };

      if (editingParentId) {
        await axiosClient.patch(`/parents/${editingParentId}`, payload);
      } else {
        await axiosClient.post('/parents', payload);
      }

      await refreshDirectoryData();
      resetParentForm();
      toast.success(editingParentId ? 'Parent updated successfully.' : 'Parent registered successfully.');
    } catch (error: any) {
      if (!editingParentId && error?.response?.status === 409) {
        setParentForm((prev) => ({
          ...prev,
          parentNumber: getBumpedGeneratedNumber(prev.parentNumber, parents.map((item) => item.parent_number), 'PAR'),
        }));
      }
      const message = formatApiError(error, 'Unable to save parent.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditParent = (parent: ApiParent) => {
    setEditingParentId(parent.id);
    setParentForm({
      parentNumber: parent.parent_number,
      firstName: parent.first_name,
      lastName: parent.last_name,
      gender: parent.gender || 'FEMALE',
      phone: parent.phone,
      email: parent.email || '',
      occupation: parent.occupation || '',
      address: parent.address || '',
    });
  };

  const handleDeleteParent = async (parentId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete parent record?',
      message: 'This action will remove the parent record from the system.',
      confirmLabel: 'Delete parent',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      await axiosClient.delete(`/parents/${parentId}`);
      await refreshDirectoryData();
      if (editingParentId === parentId) {
        resetParentForm();
      }
      toast.success('Parent deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to delete parent.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleSaveStaff = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!staffForm.employeeNumber || !staffForm.phone || !staffForm.hireDate) {
      setErrorMessage('Employee number, phone, and hire date are required.');
      return;
    }

    if (staffForm.role === 'TEACHER' && (!staffForm.firstName.trim() || !staffForm.lastName.trim())) {
      setErrorMessage('Teacher first name and last name are required.');
      return;
    }

    if (staffForm.role === 'TEACHER' && !staffForm.teacherNumber.trim()) {
      setErrorMessage('Teacher number is required for teacher registration.');
      return;
    }

    setErrorMessage('');
    try {
      const existingStaffRecord = editingStaffId ? staff.find((item) => item.id === editingStaffId) : undefined;
      const nextEmployeeNumber = ensureUniqueGeneratedValue(
        staffForm.employeeNumber,
        staff.map((item) => item.employee_number),
        'EMP',
        existingStaffRecord?.employee_number,
      );
      const existingTeacherRecord = editingTeacherId ? teachers.find((item) => item.id === Number(editingTeacherId)) : undefined;
      const nextTeacherNumber = staffForm.role === 'TEACHER'
        ? ensureUniqueGeneratedValue(
            staffForm.teacherNumber,
            teachers.map((item) => item.teacher_number),
            'TCH',
            existingTeacherRecord?.teacher_number,
          )
        : staffForm.teacherNumber;

      if (nextEmployeeNumber !== staffForm.employeeNumber || nextTeacherNumber !== staffForm.teacherNumber) {
        setStaffForm((prev) => ({
          ...prev,
          employeeNumber: nextEmployeeNumber,
          teacherNumber: nextTeacherNumber,
        }));
      }

      const staffPayload = {
        employeeNumber: nextEmployeeNumber,
        staffType: staffForm.role,
        gender: staffForm.gender,
        phone: staffForm.phone,
        email: staffForm.email || undefined,
        hireDate: staffForm.hireDate,
        qualification: staffForm.specialization || undefined,
        employmentStatus: staffForm.employmentStatus,
      };

      let targetTeacherId = editingTeacherId;

      if (editingStaffId) {
        await axiosClient.patch(`/staff/${editingStaffId}`, staffPayload);

        if (existingStaffRecord?.user_id && staffForm.firstName.trim() && staffForm.lastName.trim()) {
          await axiosClient.patch(`/users/${existingStaffRecord.user_id}`, {
            firstName: staffForm.firstName.trim(),
            lastName: staffForm.lastName.trim(),
            email: staffForm.email || undefined,
          });
        }

        if (staffForm.role === 'TEACHER') {
          if (editingTeacherId) {
            await axiosClient.patch(`/teachers/${editingTeacherId}`, {
              staffId: Number(editingStaffId),
              teacherNumber: nextTeacherNumber,
              specialization: staffForm.specialization || undefined,
              qualification: staffForm.specialization || undefined,
            });
            persistTeacherNameOverride(Number(editingStaffId), staffForm.firstName, staffForm.lastName);
            targetTeacherId = Number(editingTeacherId);
          } else {
            const teacherResponse = await axiosClient.post('/teachers', {
              staffId: Number(editingStaffId),
              teacherNumber: nextTeacherNumber,
              specialization: staffForm.specialization || undefined,
              qualification: staffForm.specialization || undefined,
            });
            persistTeacherNameOverride(Number(editingStaffId), staffForm.firstName, staffForm.lastName);
            targetTeacherId = Number(teacherResponse.data?.data?.id) || null;
          }
        }
      } else {
        const staffResponse = await axiosClient.post('/staff', staffPayload);
        const createdStaffId = Number(staffResponse.data?.data?.id);

        if (staffForm.role === 'TEACHER' && createdStaffId) {
          const teacherResponse = await axiosClient.post('/teachers', {
            staffId: Number(createdStaffId),
            teacherNumber: nextTeacherNumber,
            specialization: staffForm.specialization || undefined,
            qualification: staffForm.specialization || undefined,
          });
          persistTeacherNameOverride(Number(createdStaffId), staffForm.firstName, staffForm.lastName);
          targetTeacherId = Number(teacherResponse.data?.data?.id) || null;
        }
      }

      await refreshDirectoryData();

      if (staffForm.role === 'TEACHER' && targetTeacherId) {
        const teacherRole = backendRoles.find((item) => item.name.toUpperCase() === 'TEACHER');
        setAccountForm({
          roleId: teacherRole ? String(teacherRole.id) : '',
          targetType: 'TEACHER',
          targetId: String(targetTeacherId),
          username: '',
          password: '',
          firstName: staffForm.firstName.trim(),
          lastName: staffForm.lastName.trim(),
          email: staffForm.email || '',
          isActive: true,
        });
        setActiveTab('accounts');
        await refreshAccounts();
      }

      resetStaffForm();
      toast.success(editingStaffId ? 'Staff updated successfully.' : 'Staff registered successfully.');
    } catch (error: any) {
      if (!editingStaffId && error?.response?.status === 409) {
        setStaffForm((prev) => ({
          ...prev,
          employeeNumber: getBumpedGeneratedNumber(prev.employeeNumber, staff.map((item) => item.employee_number), 'EMP'),
          teacherNumber: prev.role === 'TEACHER'
            ? getBumpedGeneratedNumber(prev.teacherNumber, teachers.map((item) => item.teacher_number), 'TCH')
            : prev.teacherNumber,
        }));
      }
      const message = formatApiError(error, 'Unable to save staff member.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleEditStaff = (item: ApiStaff) => {
    const teacher = teacherByStaffId.get(item.id);
    const teacherName = teacher ? getTeacherNameParts(teacher) : getStaffNameParts(item);
    setEditingStaffId(item.id);
    setEditingTeacherId(teacher?.id ?? null);
    setStaffForm({
      employeeNumber: item.employee_number,
      firstName: teacherName.firstName,
      lastName: teacherName.lastName,
      gender: item.gender || 'FEMALE',
      email: item.email || '',
      phone: item.phone || '',
      role: (item.staff_type === 'TEACHER' ? 'TEACHER' : item.staff_type === 'ACCOUNTANT' ? 'ACCOUNTANT' : 'LIBRARIAN') as PersonRole,
      hireDate: toInputDate(item.hire_date),
      employmentStatus: item.employment_status === 'ON_LEAVE' || item.employment_status === 'SUSPENDED' ? item.employment_status : 'ACTIVE',
      teacherNumber: teacher?.teacher_number || '',
      specialization: teacher?.specialization || item.qualification || '',
    });
  };

  const handleDeleteStaff = async (item: ApiStaff) => {
    const confirmed = await openConfirm({
      title: 'Delete staff record?',
      message: 'This will remove the staff member from active records and unlink the teacher profile if one exists.',
      confirmLabel: 'Delete staff',
    });
    if (!confirmed) {
      return;
    }
    setErrorMessage('');
    try {
      const teacher = teacherByStaffId.get(item.id);
      if (teacher) {
        await axiosClient.delete(`/teachers/${teacher.id}`);
      }
      await axiosClient.delete(`/staff/${item.id}`);
      await refreshDirectoryData();
      if (editingStaffId === item.id) {
        resetStaffForm();
      }
      toast.success('Staff deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to remove staff member.');
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const handleCreateAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountError('');
    try {
      const createResponse = await axiosClient.post('/users', {
        roleId: Number(accountForm.roleId),
        username: accountForm.username,
        password: accountForm.password,
        firstName: accountForm.firstName,
        lastName: accountForm.lastName,
        email: accountForm.email || undefined,
        isActive: accountForm.isActive,
        mustChangePassword: true,
      });
      const createdUserId = Number(createResponse.data?.data?.id);

      if (createdUserId && accountForm.targetType !== 'NONE' && accountForm.targetId) {
        if (accountForm.targetType === 'STUDENT') {
          await axiosClient.patch(`/students/${accountForm.targetId}`, { userId: createdUserId });
        }
        if (accountForm.targetType === 'PARENT') {
          await axiosClient.patch(`/parents/${accountForm.targetId}`, { userId: createdUserId });
        }
        if (accountForm.targetType === 'TEACHER') {
          const teacher = accountTargets.teachers.find((item) => String(item.id) === accountForm.targetId);
          if (teacher) {
            await axiosClient.patch(`/staff/${teacher.staffId}`, { userId: createdUserId });
          }
        }
      }
      setAccountForm(initialAccountForm);
      await refreshAccounts();
      await refreshDirectoryData();
      toast.success('Portal account created successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to create portal account.');
      setAccountError(message);
      toast.error(message);
    }
  };

  const handleToggleBackendUserStatus = async (user: BackendUser) => {
    setAccountError('');
    try {
      await axiosClient.patch(`/users/${user.id}/status`, {
        isActive: !(user.is_active ?? user.isActive),
      });
      await refreshAccounts();
      toast.success(`Account ${(user.is_active ?? user.isActive) ? 'deactivated' : 'activated'} successfully.`);
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to update account status.');
      setAccountError(message);
      toast.error(message);
    }
  };

  const handleDeleteBackendUser = async (userId: number) => {
    const confirmed = await openConfirm({
      title: 'Delete portal account?',
      message: 'The selected login account will be removed from portal access.',
      confirmLabel: 'Delete account',
    });
    if (!confirmed) {
      return;
    }
    setAccountError('');
    try {
      await axiosClient.delete(`/users/${userId}`);
      await refreshAccounts();
      toast.success('Portal account deleted successfully.');
    } catch (error: any) {
      const message = formatApiError(error, 'Unable to deactivate account.');
      setAccountError(message);
      toast.error(message);
    }
  };

  return (
    <div id="directory-view" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-base font-black text-slate-800">People & Portal Accounts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Create and maintain students, parents, staff, teachers, and real login accounts.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1 p-0.5 bg-slate-200 rounded-lg">
            {(['students', 'parents', 'staff', 'accounts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-md capitalize transition ${
                  activeTab === tab ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'accounts' ? 'Portal Accounts' : tab}
              </button>
            ))}
          </div>

          <button
            onClick={() => void refreshDirectoryData()}
            className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-600"
          >
            <RefreshCw className="inline h-4 w-4 mr-1" />
            Refresh Data
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-xs border border-slate-300 rounded-lg"
          />
        </div>

        {errorMessage ? <p className="text-xs font-bold text-rose-700">{errorMessage}</p> : null}
        {loading ? <p className="text-xs text-slate-500">Loading live records from the database...</p> : null}

        {activeTab === 'students' && (
          <>
            <form onSubmit={handleSaveStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 border border-blue-100 bg-blue-50/50 rounded-xl">
              <h3 className="md:col-span-4 text-xs font-black text-slate-800 uppercase tracking-wider">
                {editingStudentId ? 'Update Student' : 'Register Student'}
              </h3>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Admission Number</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-slate-100 text-slate-700" placeholder="Admission number" value={studentForm.admissionNumber} readOnly />
              </div>
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="First name" value={studentForm.firstName} onChange={(e) => setStudentForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Last name" value={studentForm.lastName} onChange={(e) => setStudentForm((prev) => ({ ...prev, lastName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Phone" value={studentForm.phone} onChange={(e) => setStudentForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={studentForm.gender} onChange={(e) => setStudentForm((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' }))}>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
              </select>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Date Of Birth</label>
                <input type="date" className="w-full text-xs px-3 py-2 border rounded bg-white" value={studentForm.dateOfBirth} onChange={(e) => setStudentForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Admission Date</label>
                <input type="date" className="w-full text-xs px-3 py-2 border rounded bg-white" value={studentForm.admissionDate} onChange={(e) => setStudentForm((prev) => ({ ...prev, admissionDate: e.target.value }))} />
              </div>
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={studentForm.classroomId} onChange={(e) => setStudentForm((prev) => ({ ...prev, classroomId: e.target.value }))}>
                <option value="">Choose classroom</option>
                {classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <select className="w-full text-xs px-3 py-2 border rounded bg-white md:col-span-2" value={studentForm.parentId} onChange={(e) => setStudentForm((prev) => ({ ...prev, parentId: e.target.value }))}>
                <option value="">Choose parent</option>
                {parents.map((item) => <option key={item.id} value={item.id}>{item.first_name} {item.last_name}</option>)}
              </select>
              <div className="md:col-span-2 flex justify-end gap-2">
                {editingStudentId ? <button type="button" onClick={resetStudentForm} className="px-3 py-2 border rounded text-xs font-bold text-slate-600">Cancel</button> : null}
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-bold"><Save className="inline h-4 w-4 mr-1" />Save</button>
              </div>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Parent</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStudents.map((item) => {
                    const enrollment = enrollmentByStudentId.get(item.id);
                    const linkedParent = studentParentMap[item.id]?.[0];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.admission_number}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.first_name} {item.last_name}</td>
                        <td className="px-4 py-3">{enrollment?.classroom_name || 'Not enrolled'}</td>
                        <td className="px-4 py-3">{linkedParent ? `${linkedParent.first_name} ${linkedParent.last_name}` : 'Unlinked'}</td>
                        <td className="px-4 py-3">{item.student_status}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title="Edit student" onClick={() => handleEditStudent(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                            <button title="Delete student" onClick={() => void handleDeleteStudent(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'parents' && (
          <>
            <form onSubmit={handleSaveParent} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 border border-emerald-100 bg-emerald-50/50 rounded-xl">
              <h3 className="md:col-span-4 text-xs font-black text-slate-800 uppercase tracking-wider">
                {editingParentId ? 'Update Parent' : 'Add Parent'}
              </h3>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Parent Number</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-slate-100 text-slate-700" placeholder="Parent number" value={parentForm.parentNumber} readOnly />
              </div>
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="First name" value={parentForm.firstName} onChange={(e) => setParentForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Last name" value={parentForm.lastName} onChange={(e) => setParentForm((prev) => ({ ...prev, lastName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Phone" value={parentForm.phone} onChange={(e) => setParentForm((prev) => ({ ...prev, phone: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Email" value={parentForm.email} onChange={(e) => setParentForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Occupation" value={parentForm.occupation} onChange={(e) => setParentForm((prev) => ({ ...prev, occupation: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white md:col-span-2" placeholder="Address" value={parentForm.address} onChange={(e) => setParentForm((prev) => ({ ...prev, address: e.target.value }))} />
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={parentForm.gender} onChange={(e) => setParentForm((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }))}>
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="md:col-span-4 flex justify-end gap-2">
                {editingParentId ? <button type="button" onClick={resetParentForm} className="px-3 py-2 border rounded text-xs font-bold text-slate-600">Cancel</button> : null}
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-bold"><Save className="inline h-4 w-4 mr-1" />Save</button>
              </div>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Parent ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Children</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredParents.map((item) => {
                    const linked = parentChildrenMap[item.id] || [];
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.parent_number}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.first_name} {item.last_name}</td>
                        <td className="px-4 py-3">{item.phone}</td>
                        <td className="px-4 py-3">{linked.length ? linked.map((child) => child.first_name).join(', ') : 'None'}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title="Edit parent" onClick={() => handleEditParent(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                            <button title="Delete parent" onClick={() => void handleDeleteParent(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'staff' && (
          <>
            <form onSubmit={handleSaveStaff} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 border border-indigo-100 bg-indigo-50/50 rounded-xl">
              <h3 className="md:col-span-4 text-xs font-black text-slate-800 uppercase tracking-wider">
                {editingStaffId ? 'Update Staff' : 'Add Staff'}
              </h3>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Employee Number</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-slate-100 text-slate-700" placeholder="Employee number" value={staffForm.employeeNumber} readOnly />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">First Name</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="First name" value={staffForm.firstName} onChange={(e) => setStaffForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Last Name</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Last name" value={staffForm.lastName} onChange={(e) => setStaffForm((prev) => ({ ...prev, lastName: e.target.value }))} />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Staff Type</label>
                <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={staffForm.role} onChange={(e) => setStaffForm((prev) => ({ ...prev, role: e.target.value as PersonRole }))}>
                  <option value="TEACHER">Teacher</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="LIBRARIAN">Librarian</option>
                </select>
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Gender</label>
                <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={staffForm.gender} onChange={(e) => setStaffForm((prev) => ({ ...prev, gender: e.target.value as 'MALE' | 'FEMALE' | 'OTHER' }))}>
                  <option value="FEMALE">Female</option>
                  <option value="MALE">Male</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Phone</label>
                <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Phone" value={staffForm.phone} onChange={(e) => setStaffForm((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Hire Date</label>
                <input type="date" className="w-full text-xs px-3 py-2 border rounded bg-white" value={staffForm.hireDate} onChange={(e) => setStaffForm((prev) => ({ ...prev, hireDate: e.target.value }))} />
              </div>
              <div className="w-full">
                <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Employment Status</label>
                <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={staffForm.employmentStatus} onChange={(e) => setStaffForm((prev) => ({ ...prev, employmentStatus: e.target.value as 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' }))}>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              <input className="w-full text-xs px-3 py-2 border rounded bg-white md:col-span-2" placeholder="Email" value={staffForm.email} onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white md:col-span-2" placeholder="Specialization / qualification" value={staffForm.specialization} onChange={(e) => setStaffForm((prev) => ({ ...prev, specialization: e.target.value }))} />
              {staffForm.role === 'TEACHER' ? (
                <>
                  <div className="w-full">
                    <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-slate-500">Teacher Number</label>
                    <input className="w-full text-xs px-3 py-2 border rounded bg-slate-100 text-slate-700" placeholder="Teacher number" value={staffForm.teacherNumber} readOnly />
                  </div>
                  <div className="md:col-span-4 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-xs text-slate-600">
                    Teacher names are used to pre-fill the login account step automatically after saving this teacher record.
                  </div>
                </>
              ) : null}
              <div className="md:col-span-4 flex justify-end gap-2">
                {editingStaffId ? <button type="button" onClick={resetStaffForm} className="px-3 py-2 border rounded text-xs font-bold text-slate-600">Cancel</button> : null}
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded text-xs font-bold"><Save className="inline h-4 w-4 mr-1" />Save</button>
              </div>
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Employee ID</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Teacher Number</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredStaff.map((item) => {
                    const teacher = teacherByStaffId.get(item.id);
                    const teacherName = teacher ? getTeacherNameParts(teacher) : getStaffNameParts(item);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.employee_number}</td>
                        <td className="px-4 py-3">{item.staff_type}</td>
                        <td className="px-4 py-3">{teacher?.teacher_number || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div>{teacherName.firstName || teacherName.lastName ? `${teacherName.firstName} ${teacherName.lastName}`.trim() : item.email || item.phone || 'N/A'}</div>
                          {item.email || item.phone ? <div className="text-[10px] text-slate-500">{item.email || item.phone}</div> : null}
                        </td>
                        <td className="px-4 py-3">{item.employment_status}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title="Edit staff" onClick={() => handleEditStaff(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50"><Pencil className="h-3.5 w-3.5" /></button>
                            <button title="Delete staff" onClick={() => void handleDeleteStaff(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50"><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'accounts' && (
          <>
            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border border-amber-100 bg-amber-50/50 rounded-xl">
              <h3 className="md:col-span-3 text-xs font-black text-slate-800 uppercase tracking-wider">Create Real Login Account</h3>
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={accountForm.targetType} onChange={(e) => setAccountForm((prev) => ({ ...prev, targetType: e.target.value as 'NONE' | 'STUDENT' | 'PARENT' | 'TEACHER', targetId: '', firstName: '', lastName: '', email: '' }))}>
                <option value="NONE">Manual account only</option>
                <option value="STUDENT">Select registered student</option>
                <option value="PARENT">Select registered parent</option>
                <option value="TEACHER">Select registered teacher</option>
              </select>
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={accountForm.targetId} onChange={(e) => {
                const targetId = e.target.value;
                let target;
                if (accountForm.targetType === 'STUDENT') target = accountTargets.students.find((item) => String(item.id) === targetId);
                if (accountForm.targetType === 'PARENT') target = accountTargets.parents.find((item) => String(item.id) === targetId);
                if (accountForm.targetType === 'TEACHER') target = accountTargets.teachers.find((item) => String(item.id) === targetId);
                setAccountForm((prev) => ({
                  ...prev,
                  targetId,
                  firstName: target?.firstName || prev.firstName,
                  lastName: target?.lastName || prev.lastName,
                  email: target?.email || prev.email,
                }));
              }}>
                <option value="">Choose registered record</option>
                {accountForm.targetType === 'STUDENT' ? accountTargets.students.map((item) => <option key={item.id} value={item.id}>{item.label}</option>) : null}
                {accountForm.targetType === 'PARENT' ? accountTargets.parents.map((item) => <option key={item.id} value={item.id}>{item.label}</option>) : null}
                {accountForm.targetType === 'TEACHER' ? accountTargets.teachers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>) : null}
              </select>
              <select className="w-full text-xs px-3 py-2 border rounded bg-white" value={accountForm.roleId} onChange={(e) => setAccountForm((prev) => ({ ...prev, roleId: e.target.value }))}>
                <option value="">Choose role</option>
                {backendRoles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Username" value={accountForm.username} onChange={(e) => setAccountForm((prev) => ({ ...prev, username: e.target.value }))} />
              <input
                className="w-full text-xs px-3 py-2 border rounded bg-white"
                placeholder="4-digit temporary password"
                inputMode="numeric"
                maxLength={4}
                value={accountForm.password}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
              />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="First name" value={accountForm.firstName} onChange={(e) => setAccountForm((prev) => ({ ...prev, firstName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Last name" value={accountForm.lastName} onChange={(e) => setAccountForm((prev) => ({ ...prev, lastName: e.target.value }))} />
              <input className="w-full text-xs px-3 py-2 border rounded bg-white" placeholder="Email" value={accountForm.email} onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))} />
              {accountForm.targetType !== 'NONE' && accountForm.targetId ? (
                <div className="md:col-span-3 rounded-xl border border-amber-200 bg-white px-4 py-3 text-xs text-slate-700">
                  <span className="font-black text-amber-700 uppercase tracking-wider">Linked registered record</span>
                  <p className="mt-1 inline-flex items-center gap-2"><LinkIcon className="h-3.5 w-3.5" />This login will be connected to the selected record.</p>
                </div>
              ) : null}
              <div className="md:col-span-3 flex items-center justify-between gap-3">
                <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700">
                  <input type="checkbox" checked={accountForm.isActive} onChange={(e) => setAccountForm((prev) => ({ ...prev, isActive: e.target.checked }))} />
                  Activate account immediately
                </label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => void refreshAccounts()} className="px-3 py-2 border rounded text-xs font-bold text-slate-600">
                    <RefreshCw className="inline h-4 w-4 mr-1" />
                    Refresh
                  </button>
                  <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded text-xs font-bold">
                    <UserPlus className="inline h-4 w-4 mr-1" />
                    Create Account
                  </button>
                </div>
              </div>
              {accountError ? <p className="md:col-span-3 text-xs font-bold text-rose-700">{accountError}</p> : null}
            </form>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {accountsLoading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading accounts...</td></tr>
                  ) : filteredAccounts.map((item) => {
                    const isActive = item.is_active ?? item.isActive;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{item.username}</td>
                        <td className="px-4 py-3 font-bold text-slate-800">{item.first_name || item.firstName} {item.last_name || item.lastName}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase">
                            <UserRound className="h-3 w-3" />
                            {item.role_name || item.roleName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <ShieldCheck className="h-3 w-3" />
                            {isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button title={isActive ? 'Deactivate account' : 'Activate account'} onClick={() => void handleToggleBackendUserStatus(item)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-blue-700 hover:bg-blue-50">
                              <Power className="h-3.5 w-3.5" />
                            </button>
                            <button title="Deactivate account" onClick={() => void handleDeleteBackendUser(item.id)} className="h-8 w-8 inline-flex items-center justify-center border rounded text-rose-700 hover:bg-rose-50">
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
          </>
        )}
      </div>
    </div>
  );
}
