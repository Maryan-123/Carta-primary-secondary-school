import { query } from "../../config/database";

export const operationsRepository = {
  listStaff: () =>
    query(
      `SELECT st.*, u.first_name, u.last_name
       FROM staff st
       LEFT JOIN users u ON u.id = st.user_id
       ORDER BY st.created_at DESC`
    ),
  getStaff: async (id: number) =>
    (
      await query(
        `SELECT st.*, u.first_name, u.last_name
         FROM staff st
         LEFT JOIN users u ON u.id = st.user_id
         WHERE st.id = $1`,
        [id]
      )
    )[0] ?? null,
  listTeachers: () =>
    query(
      `SELECT t.*, s.first_name, s.last_name
       FROM teachers t
       JOIN (
         SELECT st.id, st.email, st.phone, u.first_name, u.last_name
         FROM staff st
         LEFT JOIN users u ON u.id = st.user_id
       ) s ON s.id = t.staff_id
       ORDER BY t.created_at DESC`
    ),
  getTeacher: async (id: number) => (await query(`SELECT * FROM teachers WHERE id = $1`, [id]))[0] ?? null,
  listTeacherAssignments: () =>
    query(
      `SELECT tsa.*, c.name AS classroom_name, s.name AS subject_name, ay.name AS academic_year_name, t.name AS term_name
       FROM teacher_subject_assignments tsa
       JOIN classrooms c ON c.id = tsa.classroom_id
       JOIN subjects s ON s.id = tsa.subject_id
       JOIN academic_years ay ON ay.id = tsa.academic_year_id
       JOIN terms t ON t.id = tsa.term_id
       ORDER BY tsa.created_at DESC`
    ),
  getTeacherAssignmentsByTeacher: (teacherId: number) =>
    query(`SELECT * FROM teacher_subject_assignments WHERE teacher_id = $1 ORDER BY created_at DESC`, [teacherId]),
  getTeacherClasses: (teacherId: number) =>
    query(
      `SELECT DISTINCT c.*
       FROM teacher_subject_assignments tsa
       JOIN classrooms c ON c.id = tsa.classroom_id
       WHERE tsa.teacher_id = $1`,
      [teacherId]
    ),
  getTeacherSubjects: (teacherId: number) =>
    query(
      `SELECT DISTINCT s.*
       FROM teacher_subject_assignments tsa
       JOIN subjects s ON s.id = tsa.subject_id
       WHERE tsa.teacher_id = $1`,
      [teacherId]
    ),
  getTeacherTimetable: (teacherId: number) =>
    query(
      `SELECT te.*, tp.name AS period_name, tp.start_time, tp.end_time, c.name AS classroom_name, s.name AS subject_name
       FROM timetable_entries te
       JOIN timetable_periods tp ON tp.id = te.period_id
       LEFT JOIN classrooms c ON c.id = te.classroom_id
       LEFT JOIN subjects s ON s.id = te.subject_id
       WHERE te.teacher_id = $1
       ORDER BY te.day_of_week, tp.period_order`,
      [teacherId]
    ),
  listPromotions: () => query(`SELECT * FROM student_promotions ORDER BY promoted_at DESC`),
  getStudentPromotionHistory: (studentId: number) =>
    query(`SELECT * FROM student_promotions WHERE student_id = $1 ORDER BY promoted_at DESC`, [studentId]),
  listTimetablePeriods: () => query(`SELECT * FROM timetable_periods ORDER BY period_order`),
  getTimetablePeriod: async (id: number) => (await query(`SELECT * FROM timetable_periods WHERE id = $1`, [id]))[0] ?? null,
  listTimetableEntries: () =>
    query(
      `SELECT te.*, tp.name AS period_name, tp.start_time, tp.end_time, c.name AS classroom_name, s.name AS subject_name
       FROM timetable_entries te
       JOIN timetable_periods tp ON tp.id = te.period_id
       LEFT JOIN classrooms c ON c.id = te.classroom_id
       LEFT JOIN subjects s ON s.id = te.subject_id
       ORDER BY te.day_of_week, tp.period_order`
    ),
  getClassroomTimetable: (classroomId: number) =>
    query(
      `SELECT te.*, tp.name AS period_name, tp.start_time, tp.end_time, s.name AS subject_name
       FROM timetable_entries te
       JOIN timetable_periods tp ON tp.id = te.period_id
       LEFT JOIN subjects s ON s.id = te.subject_id
       WHERE te.classroom_id = $1
       ORDER BY te.day_of_week, tp.period_order`,
      [classroomId]
    ),
  listAttendanceSessions: () =>
    query(
      `SELECT ats.*, c.name AS classroom_name
       FROM attendance_sessions ats
       JOIN classrooms c ON c.id = ats.classroom_id
       ORDER BY ats.attendance_date DESC, ats.created_at DESC`
    ),
  getAttendanceSession: async (id: number) => (await query(`SELECT * FROM attendance_sessions WHERE id = $1`, [id]))[0] ?? null,
  getAttendanceByClassroom: (classroomId: number) =>
    query(
      `SELECT ats.*, ar.student_id, ar.status, ar.arrival_time, ar.absence_reason
       FROM attendance_sessions ats
       JOIN attendance_records ar ON ar.attendance_session_id = ats.id
       WHERE ats.classroom_id = $1
       ORDER BY ats.attendance_date DESC`,
      [classroomId]
    ),
  getAttendanceByStudent: (studentId: number) =>
    query(
      `SELECT ats.attendance_date, ats.classroom_id, ar.*
       FROM attendance_records ar
       JOIN attendance_sessions ats ON ats.id = ar.attendance_session_id
       WHERE ar.student_id = $1
       ORDER BY ats.attendance_date DESC`,
      [studentId]
    ),
  listStaffAttendance: () => query(`SELECT * FROM staff_attendance ORDER BY attendance_date DESC, created_at DESC`),
  getStaffAttendanceSummary: () =>
    query(
      `SELECT
         attendance_date,
         COUNT(*) FILTER (WHERE status = 'PRESENT') AS present_count,
         COUNT(*) FILTER (WHERE status = 'ABSENT') AS absent_count,
         COUNT(*) FILTER (WHERE status = 'LATE') AS late_count,
         COUNT(*) FILTER (WHERE status = 'ON_LEAVE') AS on_leave_count,
         COUNT(*) FILTER (WHERE status = 'SICK') AS sick_count
       FROM staff_attendance
       GROUP BY attendance_date
       ORDER BY attendance_date DESC`
    )
};
