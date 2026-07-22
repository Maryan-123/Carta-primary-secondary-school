import { query } from "../../config/database";

export const assessmentRepository = {
  listAssignments: () => query(`SELECT * FROM assignments ORDER BY created_at DESC`),
  getAssignment: async (id: number) => (await query(`SELECT * FROM assignments WHERE id = $1`, [id]))[0] ?? null,
  getAssignmentSubmissions: (assignmentId: number) =>
    query(`SELECT * FROM assignment_submissions WHERE assignment_id = $1 ORDER BY student_id`, [assignmentId]),
  getSubmission: async (id: number) =>
    (await query(`SELECT * FROM assignment_submissions WHERE id = $1`, [id]))[0] ?? null,

  listExamTypes: () => query(`SELECT * FROM exam_types ORDER BY name`),
  getExamType: async (id: number) => (await query(`SELECT * FROM exam_types WHERE id = $1`, [id]))[0] ?? null,
  listExams: () => query(`SELECT * FROM exams ORDER BY created_at DESC, start_date DESC`),
  getExam: async (id: number) => (await query(`SELECT * FROM exams WHERE id = $1`, [id]))[0] ?? null,
  listExamSubjects: () => query(`SELECT * FROM exam_subjects ORDER BY exam_date DESC, id DESC`),
  getExamSubject: async (id: number) => (await query(`SELECT * FROM exam_subjects WHERE id = $1`, [id]))[0] ?? null,

  listResults: () => query(`SELECT * FROM exam_results ORDER BY created_at DESC, id DESC`),
  getResult: async (id: number) => (await query(`SELECT * FROM exam_results WHERE id = $1`, [id]))[0] ?? null,
  getResultsByStudent: (studentId: number) =>
    query(`SELECT * FROM exam_results WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]),
  getResultsByExamSubject: (examSubjectId: number) =>
    query(`SELECT * FROM exam_results WHERE exam_subject_id = $1 ORDER BY student_id`, [examSubjectId]),
  getResultsByExam: (examId: number) =>
    query(
      `SELECT er.*
       FROM exam_results er
       JOIN exam_subjects es ON es.id = er.exam_subject_id
       WHERE es.exam_id = $1
       ORDER BY er.created_at DESC`,
      [examId]
    ),
  getResultsByClassroom: (classroomId: number) =>
    query(
      `SELECT er.*
       FROM exam_results er
       JOIN exam_subjects es ON es.id = er.exam_subject_id
       WHERE es.classroom_id = $1
       ORDER BY er.created_at DESC`,
      [classroomId]
    ),

  listGradingScales: () => query(`SELECT * FROM grading_scales ORDER BY maximum_percentage DESC, minimum_percentage DESC`),
  getGradingScale: async (id: number) => (await query(`SELECT * FROM grading_scales WHERE id = $1`, [id]))[0] ?? null,

  listReportCards: () => query(`SELECT * FROM report_cards ORDER BY published_at DESC NULLS LAST, id DESC`),
  getReportCard: async (id: number) => (await query(`SELECT * FROM report_cards WHERE id = $1`, [id]))[0] ?? null,
  getReportCardsByStudent: (studentId: number) =>
    query(`SELECT * FROM report_cards WHERE student_id = $1 ORDER BY id DESC`, [studentId]),
  getReportCardsByClassroom: (classroomId: number) =>
    query(`SELECT * FROM report_cards WHERE classroom_id = $1 ORDER BY id DESC`, [classroomId])
};
