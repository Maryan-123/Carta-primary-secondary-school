import { query } from "../config/database";
import { hashPassword } from "../utils/password";

const DEFAULT_PASSWORD = "Admin123!";

const ensureUser = async (
  roleName: string,
  username: string,
  firstName: string,
  lastName: string,
  email: string
): Promise<number> => {
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);
  const rows = await query<{ id: number }>(
    `INSERT INTO users (
      role_id, username, password_hash, first_name, last_name, email, is_active, must_change_password
    )
    SELECT id, $1, $2, $3, $4, $5, TRUE, TRUE
    FROM roles
    WHERE name = $6
    ON CONFLICT (username) DO UPDATE
    SET role_id = EXCLUDED.role_id,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        is_active = TRUE
    RETURNING id`,
    [username, passwordHash, firstName, lastName, email, roleName]
  );

  return rows[0].id;
};

const ensureAcademicYear = async (): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM academic_years WHERE name = '2026/2027' LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO academic_years (name, start_date, end_date, is_current, status)
     VALUES ('2026/2027', '2026-08-01', '2027-06-30', TRUE, 'ACTIVE')
     RETURNING id`
  );
  return rows[0].id;
};

const ensureTerm = async (academicYearId: number): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM terms WHERE academic_year_id = $1 AND name = 'Term 1' LIMIT 1`,
    [academicYearId]
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO terms (academic_year_id, name, start_date, end_date, is_current, status)
     VALUES ($1, 'Term 1', '2026-08-02', '2026-12-01', TRUE, 'ACTIVE')
     RETURNING id`,
    [academicYearId]
  );
  return rows[0].id;
};

const ensureGradeLevel = async (): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM grade_levels WHERE name = 'Grade 1' OR level_order = 1 LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO grade_levels (name, level_order, description, is_active)
     VALUES ('Grade 1', 1, 'Seeded grade level', TRUE)
     RETURNING id`
  );
  return rows[0].id;
};

const ensureClassroom = async (gradeLevelId: number): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM classrooms WHERE name = 'Grade 1 A' LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO classrooms (grade_level_id, name, section_name, capacity, room_name, is_active)
     VALUES ($1, 'Grade 1 A', 'A', 35, 'Room 1', TRUE)
     RETURNING id`,
    [gradeLevelId]
  );
  return rows[0].id;
};

const ensureSubject = async (): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM subjects WHERE code = 'ENG-001' LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO subjects (code, name, maximum_marks, pass_marks, is_active)
     VALUES ('ENG-001', 'English', 100, 50, TRUE)
     RETURNING id`
  );
  return rows[0].id;
};

const ensureClassSubject = async (classroomId: number, subjectId: number, academicYearId: number): Promise<void> => {
  await query(
    `INSERT INTO class_subjects (classroom_id, subject_id, academic_year_id, is_compulsory)
     VALUES ($1, $2, $3, TRUE)
     ON CONFLICT (classroom_id, subject_id, academic_year_id) DO NOTHING`,
    [classroomId, subjectId, academicYearId]
  );
};

const ensureStaff = async (
  userId: number,
  employeeNumber: string,
  staffType: string,
  firstName: string,
  email: string
): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM staff WHERE employee_number = $1 LIMIT 1`,
    [employeeNumber]
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO staff (
      user_id, employee_number, staff_type, gender, phone, email, address, hire_date, salary, qualification, employment_status
    )
    VALUES ($1, $2, $3, 'MALE', '0610000000', $4, 'Mogadishu', '2026-01-15', 500, 'Seeded', 'ACTIVE')
    RETURNING id`,
    [userId, employeeNumber, staffType, email]
  );
  return rows[0].id;
};

const ensureTeacher = async (staffId: number): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM teachers WHERE staff_id = $1 LIMIT 1`,
    [staffId]
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO teachers (staff_id, teacher_number, specialization, qualification, years_of_experience, is_class_teacher)
     VALUES ($1, 'TCH-001', 'English', 'B.Ed', 3, TRUE)
     RETURNING id`,
    [staffId]
  );
  return rows[0].id;
};

const ensureTeacherAssignment = async (
  teacherId: number,
  classroomId: number,
  subjectId: number,
  academicYearId: number,
  termId: number
): Promise<void> => {
  await query(
    `INSERT INTO teacher_subject_assignments (teacher_id, classroom_id, subject_id, academic_year_id, term_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (teacher_id, classroom_id, subject_id, academic_year_id, term_id) DO NOTHING`,
    [teacherId, classroomId, subjectId, academicYearId, termId]
  );
};

const ensureParent = async (userId: number): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM parents WHERE parent_number = 'PAR-001' LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO parents (
      user_id, parent_number, first_name, last_name, gender, phone, email, occupation, address, is_active
    )
    VALUES ($1, 'PAR-001', 'Yasin', 'Guardian', 'MALE', '0611111111', 'parent1@school.local', 'Business', 'Mogadishu', TRUE)
    RETURNING id`,
    [userId]
  );
  return rows[0].id;
};

const ensureStudent = async (userId: number): Promise<number> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM students WHERE admission_number = 'STD-001' LIMIT 1`
  );
  if (existing[0]) return existing[0].id;

  const rows = await query<{ id: number }>(
    `INSERT INTO students (
      user_id, admission_number, first_name, last_name, gender, date_of_birth, admission_date, address, student_status
    )
    VALUES ($1, 'STD-001', 'Sadia', 'Jama', 'FEMALE', '2015-05-10', '2026-08-05', 'Mogadishu', 'ACTIVE')
    RETURNING id`,
    [userId]
  );
  return rows[0].id;
};

const ensureStudentParent = async (studentId: number, parentId: number): Promise<void> => {
  await query(
    `INSERT INTO student_parents (student_id, parent_id, relationship, is_primary_contact, can_pick_student, lives_with_student)
     VALUES ($1, $2, 'GUARDIAN', TRUE, TRUE, TRUE)
     ON CONFLICT (student_id, parent_id) DO NOTHING`,
    [studentId, parentId]
  );
};

const ensureEnrollment = async (studentId: number, academicYearId: number, classroomId: number): Promise<void> => {
  await query(
    `INSERT INTO student_enrollments (
      student_id, academic_year_id, classroom_id, roll_number, enrollment_date, enrollment_status
    )
    VALUES ($1, $2, $3, '1', '2026-08-05', 'ACTIVE')
    ON CONFLICT (student_id, academic_year_id) DO NOTHING`,
    [studentId, academicYearId, classroomId]
  );
};

const ensureAnnouncement = async (publishedBy: number): Promise<void> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM announcements WHERE title = 'Welcome Back' LIMIT 1`
  );
  if (existing[0]) return;

  await query(
    `INSERT INTO announcements (title, message, audience_type, published_by, expiry_date, is_active)
     VALUES ('Welcome Back', 'School portal is ready for live use.', 'ALL', $1, '2026-12-31', TRUE)`,
    [publishedBy]
  );
};

const ensureEvent = async (createdBy: number): Promise<void> => {
  const existing = await query<{ id: number }>(
    `SELECT id FROM school_events WHERE title = 'Opening Day Meeting' LIMIT 1`
  );
  if (existing[0]) return;

  await query(
    `INSERT INTO school_events (title, description, event_type, start_date, end_date, location, created_by)
     VALUES ('Opening Day Meeting', 'Seeded school event for dashboards.', 'MEETING', '2026-08-03', '2026-08-03', 'Main Hall', $1)`,
    [createdBy]
  );
};

const seed = async (): Promise<void> => {
  const adminUserId = await ensureUser("ADMINISTRATOR", "admin", "System", "Administrator", "admin@school.local");
  const principalUserId = await ensureUser("PRINCIPAL", "principal", "Mohamed", "Ali", "principal@school.local");
  const teacherUserId = await ensureUser("TEACHER", "teacher1", "Abdi", "Hassan", "teacher1@school.local");
  const accountantUserId = await ensureUser("ACCOUNTANT", "accountant", "Fartun", "Osman", "accountant@school.local");
  const librarianUserId = await ensureUser("LIBRARIAN", "librarian", "Omar", "Warsame", "librarian@school.local");
  const studentUserId = await ensureUser("STUDENT", "student1", "Sadia", "Jama", "student1@school.local");
  const parentUserId = await ensureUser("PARENT", "parent1", "Yasin", "Jama", "parent1@school.local");

  const academicYearId = await ensureAcademicYear();
  const termId = await ensureTerm(academicYearId);
  const gradeLevelId = await ensureGradeLevel();
  const classroomId = await ensureClassroom(gradeLevelId);
  const subjectId = await ensureSubject();

  await ensureStaff(principalUserId, "EMP-P-001", "PRINCIPAL", "Mohamed", "principal@school.local");
  const teacherStaffId = await ensureStaff(teacherUserId, "EMP-T-001", "TEACHER", "Abdi", "teacher1@school.local");
  await ensureStaff(accountantUserId, "EMP-A-001", "ACCOUNTANT", "Fartun", "accountant@school.local");
  await ensureStaff(librarianUserId, "EMP-L-001", "LIBRARIAN", "Omar", "librarian@school.local");

  const teacherId = await ensureTeacher(teacherStaffId);
  const parentId = await ensureParent(parentUserId);
  const studentId = await ensureStudent(studentUserId);

  await ensureClassSubject(classroomId, subjectId, academicYearId);
  await ensureTeacherAssignment(teacherId, classroomId, subjectId, academicYearId, termId);
  await ensureStudentParent(studentId, parentId);
  await ensureEnrollment(studentId, academicYearId, classroomId);
  await ensureAnnouncement(adminUserId);
  await ensureEvent(principalUserId);

  console.log("Seed complete.");
  console.log("Created real role logins: admin, principal, teacher1, accountant, librarian, student1, parent1");
  console.log(`Default password for seeded users: ${DEFAULT_PASSWORD}`);
  console.log("Change these passwords immediately after first login.");
};

void seed();
