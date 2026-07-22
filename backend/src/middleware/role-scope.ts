import { NextFunction, Request, Response } from "express";
import { query } from "../config/database";
import { AuthorizationError } from "../utils/errors";

const requireUser = (request: Request) => {
  if (!request.user) {
    throw new AuthorizationError("Authentication required");
  }

  return request.user;
};

const parseNumeric = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const wrap =
  (handler: (request: Request) => Promise<void>) =>
  async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
    try {
      await handler(request);
      next();
    } catch (error) {
      next(error);
    }
  };

export const authorizeStudentSelfOrLinkedParent =
  (studentParam = "studentId") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "ACCOUNTANT" || user.role === "PRINCIPAL") {
      return;
    }

    const studentId = parseNumeric(request.params[studentParam] ?? request.body?.[studentParam]);
    if (!studentId) {
      throw new AuthorizationError("Student scope could not be determined");
    }

    if (user.role === "STUDENT" && user.linkedStudentId === studentId) {
      return;
    }

    if (user.role === "PARENT" && user.linkedParentId) {
      const rows = await query<{ student_id: number }>(
        `SELECT student_id
         FROM student_parents
         WHERE parent_id = $1 AND student_id = $2
         LIMIT 1`,
        [user.linkedParentId, studentId]
      );
      if (rows[0]) {
        return;
      }
    }

    throw new AuthorizationError("You do not have access to this student record");
  });

export const authorizeTeacherOwnRecord =
  (teacherParam = "id") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER") {
      throw new AuthorizationError("Teacher access is required");
    }

    const teacherId = parseNumeric(request.params[teacherParam] ?? request.body?.[teacherParam]);
    if (!teacherId || user.linkedTeacherId !== teacherId) {
      throw new AuthorizationError("You do not have access to this teacher record");
    }
  });

export const authorizeTeacherAssignedClassroomParam =
  (classroomParam = "classroomId") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER" || !user.linkedTeacherId) {
      throw new AuthorizationError("Teacher access is required");
    }

    const classroomId = parseNumeric(request.params[classroomParam] ?? request.body?.[classroomParam]);
    if (!classroomId) {
      throw new AuthorizationError("Classroom scope could not be determined");
    }

    const rows = await query<{ classroom_id: number }>(
      `SELECT classroom_id
       FROM teacher_subject_assignments
       WHERE teacher_id = $1 AND classroom_id = $2
       LIMIT 1`,
      [user.linkedTeacherId, classroomId]
    );

    if (!rows[0]) {
      throw new AuthorizationError("You do not have access to this classroom");
    }
  });

export const authorizeTeacherAssignedAttendanceSession =
  (sessionParam = "id") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER" || !user.linkedTeacherId) {
      throw new AuthorizationError("Teacher access is required");
    }

    const sessionId = parseNumeric(request.params[sessionParam]);
    if (!sessionId) {
      throw new AuthorizationError("Attendance session scope could not be determined");
    }

    const rows = await query<{ id: number }>(
      `SELECT ats.id
       FROM attendance_sessions ats
       JOIN teacher_subject_assignments tsa ON tsa.classroom_id = ats.classroom_id
       WHERE ats.id = $1
         AND tsa.teacher_id = $2
       LIMIT 1`,
      [sessionId, user.linkedTeacherId]
    );

    if (!rows[0]) {
      throw new AuthorizationError("You do not have access to this attendance session");
    }
  });

export const authorizeTeacherAssignedAttendanceRecord =
  (recordParam = "id") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER" || !user.linkedTeacherId) {
      throw new AuthorizationError("Teacher access is required");
    }

    const recordId = parseNumeric(request.params[recordParam]);
    if (!recordId) {
      throw new AuthorizationError("Attendance record scope could not be determined");
    }

    const rows = await query<{ id: number }>(
      `SELECT ar.id
       FROM attendance_records ar
       JOIN attendance_sessions ats ON ats.id = ar.attendance_session_id
       JOIN teacher_subject_assignments tsa ON tsa.classroom_id = ats.classroom_id
       WHERE ar.id = $1
         AND tsa.teacher_id = $2
       LIMIT 1`,
      [recordId, user.linkedTeacherId]
    );

    if (!rows[0]) {
      throw new AuthorizationError("You do not have access to this attendance record");
    }
  });

export const authorizeTeacherAssignedAssignment =
  (assignmentParam = "id") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER" || !user.linkedTeacherId) {
      throw new AuthorizationError("Teacher access is required");
    }

    const assignmentId = parseNumeric(request.params[assignmentParam]);
    if (!assignmentId) {
      throw new AuthorizationError("Assignment scope could not be determined");
    }

    const rows = await query<{ id: number }>(
      `SELECT id
       FROM assignments
       WHERE id = $1 AND teacher_id = $2
       LIMIT 1`,
      [assignmentId, user.linkedTeacherId]
    );

    if (!rows[0]) {
      throw new AuthorizationError("You do not have access to this assignment");
    }
  });

export const authorizeTeacherAssignedExamSubject =
  (examSubjectParam = "examSubjectId") =>
  wrap(async (request) => {
    const user = requireUser(request);
    if (user.role === "ADMINISTRATOR" || user.role === "PRINCIPAL") {
      return;
    }

    if (user.role !== "TEACHER" || !user.linkedTeacherId) {
      throw new AuthorizationError("Teacher access is required");
    }

    const examSubjectId = parseNumeric(request.params[examSubjectParam] ?? request.body?.[examSubjectParam]);
    if (!examSubjectId) {
      throw new AuthorizationError("Exam subject scope could not be determined");
    }

    const rows = await query<{ id: number }>(
      `SELECT es.id
       FROM exam_subjects es
       JOIN exams e ON e.id = es.exam_id
       JOIN teacher_subject_assignments tsa
         ON tsa.classroom_id = es.classroom_id
        AND tsa.subject_id = es.subject_id
        AND tsa.academic_year_id = e.academic_year_id
        AND tsa.term_id = e.term_id
       WHERE es.id = $1
         AND tsa.teacher_id = $2
       LIMIT 1`,
      [examSubjectId, user.linkedTeacherId]
    );

    if (!rows[0]) {
      throw new AuthorizationError("You do not have access to this exam subject");
    }
  });
