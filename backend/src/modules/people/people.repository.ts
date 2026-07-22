import { query } from "../../config/database";

export const peopleRepository = {
  listParents: () => query(`SELECT * FROM parents ORDER BY created_at DESC`),
  getParent: async (id: number) => (await query(`SELECT * FROM parents WHERE id = $1`, [id]))[0] ?? null,
  listStudents: () => query(`SELECT * FROM students ORDER BY created_at DESC`),
  getStudent: async (id: number) => (await query(`SELECT * FROM students WHERE id = $1`, [id]))[0] ?? null,
  listEnrollments: () =>
    query(
      `SELECT se.*, s.admission_number, s.first_name, s.last_name, c.name AS classroom_name, ay.name AS academic_year_name
       FROM student_enrollments se
       JOIN students s ON s.id = se.student_id
       JOIN classrooms c ON c.id = se.classroom_id
       JOIN academic_years ay ON ay.id = se.academic_year_id
       ORDER BY se.created_at DESC`
    ),
  getEnrollment: async (id: number) => (await query(`SELECT * FROM student_enrollments WHERE id = $1`, [id]))[0] ?? null,
  getStudentParents: (studentId: number) =>
    query(
      `SELECT sp.*, p.first_name, p.middle_name, p.last_name, p.phone, p.email
       FROM student_parents sp
       JOIN parents p ON p.id = sp.parent_id
       WHERE sp.student_id = $1`,
      [studentId]
    ),
  getParentChildren: (parentId: number) =>
    query(
      `SELECT sp.*, s.first_name, s.middle_name, s.last_name, s.admission_number
       FROM student_parents sp
       JOIN students s ON s.id = sp.student_id
       WHERE sp.parent_id = $1`,
      [parentId]
    )
};
