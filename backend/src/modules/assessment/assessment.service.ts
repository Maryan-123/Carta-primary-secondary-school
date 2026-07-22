import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { assessmentRepository } from "./assessment.repository";

const ensureDateOrder = (startDate: string, endDate: string, startField: string, endField: string): void => {
  if (new Date(endDate) < new Date(startDate)) {
    throw new ValidationAppError("Validation failed", [
      { field: endField, message: `${endField} must be on or after ${startField}` }
    ]);
  }
};

const ensureStrictTimeOrder = (startTime?: string, endTime?: string): void => {
  if (startTime && endTime && endTime <= startTime) {
    throw new ValidationAppError("Validation failed", [
      { field: "endTime", message: "endTime must be after startTime" }
    ]);
  }
};

const toIsoDate = (value: string | Date): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
};

const clampDateToRange = (value: string, min: string, max: string): string => {
  if (value < min) return min;
  if (value > max) return max;
  return value;
};

const normalizeGrade = async (client: Parameters<Parameters<typeof withTransaction>[0]>[0], percentage: number) => {
  const scaleResult = await client.query<{
    grade_name: string;
  }>(
    `SELECT grade_name
     FROM grading_scales
     WHERE $1 BETWEEN minimum_percentage AND maximum_percentage
     ORDER BY maximum_percentage DESC
     LIMIT 1`,
    [percentage]
  );

  return scaleResult.rows[0]?.grade_name ?? null;
};

export const assessmentService = {
  listAssignments: () => assessmentRepository.listAssignments(),
  async getAssignment(id: number) {
    const row = await assessmentRepository.getAssignment(id);
    if (!row) throw new NotFoundError("Assignment not found");
    return row;
  },
  async createAssignment(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    ensureDateOrder(String(payload.assignedDate), String(payload.dueDate), "assignedDate", "dueDate");
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO assignments (
          academic_year_id, term_id, classroom_id, subject_id, teacher_id, title,
          description, assigned_date, due_date, maximum_marks, attachment_path, status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id`,
        [
          payload.academicYearId,
          payload.termId,
          payload.classroomId,
          payload.subjectId,
          payload.teacherId,
          payload.title,
          payload.description ?? null,
          payload.assignedDate,
          payload.dueDate,
          payload.maximumMarks,
          payload.attachmentPath ?? null,
          payload.status ?? "PUBLISHED"
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_ASSIGNMENT",
        tableName: "assignments",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getAssignment(id);
  },
  async updateAssignment(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getAssignment(id);
    if (payload.assignedDate && payload.dueDate) {
      ensureDateOrder(String(payload.assignedDate), String(payload.dueDate), "assignedDate", "dueDate");
    }
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE assignments
         SET academic_year_id = COALESCE($2, academic_year_id),
             term_id = COALESCE($3, term_id),
             classroom_id = COALESCE($4, classroom_id),
             subject_id = COALESCE($5, subject_id),
             teacher_id = COALESCE($6, teacher_id),
             title = COALESCE($7, title),
             description = COALESCE($8, description),
             assigned_date = COALESCE($9, assigned_date),
             due_date = COALESCE($10, due_date),
             maximum_marks = COALESCE($11, maximum_marks),
             attachment_path = COALESCE($12, attachment_path),
             status = COALESCE($13, status)
         WHERE id = $1`,
        [
          id,
          payload.academicYearId ?? null,
          payload.termId ?? null,
          payload.classroomId ?? null,
          payload.subjectId ?? null,
          payload.teacherId ?? null,
          payload.title ?? null,
          payload.description ?? null,
          payload.assignedDate ?? null,
          payload.dueDate ?? null,
          payload.maximumMarks ?? null,
          payload.attachmentPath ?? null,
          payload.status ?? null
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_ASSIGNMENT",
        tableName: "assignments",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getAssignment(id);
  },
  async deleteAssignment(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM assignments WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_ASSIGNMENT",
        tableName: "assignments",
        recordId: id,
        ipAddress
      });
    });
  },
  getAssignmentSubmissions: (assignmentId: number) => assessmentRepository.getAssignmentSubmissions(assignmentId),
  async createAssignmentSubmission(
    actorUserId: number,
    assignmentId: number,
    studentId: number,
    payload: Record<string, unknown>,
    ipAddress: string | null
  ) {
    const assignment = await this.getAssignment(assignmentId);
    const status =
      new Date().toISOString().slice(0, 10) > String(assignment.due_date) ? "LATE" : "SUBMITTED";

    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO assignment_submissions (
          assignment_id, student_id, submission_text, attachment_path, submitted_at, submission_status
        )
        VALUES ($1,$2,$3,$4,CURRENT_TIMESTAMP,$5)
        ON CONFLICT (assignment_id, student_id) DO UPDATE
        SET submission_text = EXCLUDED.submission_text,
            attachment_path = EXCLUDED.attachment_path,
            submitted_at = EXCLUDED.submitted_at,
            submission_status = EXCLUDED.submission_status
        RETURNING id`,
        [assignmentId, studentId, payload.submissionText ?? null, payload.attachmentPath ?? null, status]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_ASSIGNMENT_SUBMISSION",
        tableName: "assignment_submissions",
        recordId: result.rows[0].id,
        newValues: { assignmentId, studentId, ...payload },
        ipAddress
      });
      return result.rows[0].id;
    });
    return assessmentRepository.getSubmission(id);
  },
  async gradeAssignmentSubmission(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const submission = await assessmentRepository.getSubmission(id);
    if (!submission) throw new NotFoundError("Assignment submission not found");
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE assignment_submissions
         SET marks_obtained = COALESCE($2, marks_obtained),
             teacher_feedback = COALESCE($3, teacher_feedback),
             submission_status = COALESCE($4, submission_status),
             graded_by = $5,
             graded_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id, payload.marksObtained ?? null, payload.teacherFeedback ?? null, payload.submissionStatus ?? "GRADED", actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "GRADE_ASSIGNMENT_SUBMISSION",
        tableName: "assignment_submissions",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return assessmentRepository.getSubmission(id);
  },

  listExamTypes: () => assessmentRepository.listExamTypes(),
  async getExamType(id: number) {
    const row = await assessmentRepository.getExamType(id);
    if (!row) throw new NotFoundError("Exam type not found");
    return row;
  },
  async createExamType(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO exam_types (name, weight_percentage, description)
         VALUES ($1,$2,$3)
         RETURNING id`,
        [payload.name, payload.weightPercentage ?? 0, payload.description ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_EXAM_TYPE",
        tableName: "exam_types",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getExamType(id);
  },
  async updateExamType(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getExamType(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE exam_types
         SET name = COALESCE($2, name),
             weight_percentage = COALESCE($3, weight_percentage),
             description = COALESCE($4, description)
         WHERE id = $1`,
        [id, payload.name ?? null, payload.weightPercentage ?? null, payload.description ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_EXAM_TYPE",
        tableName: "exam_types",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getExamType(id);
  },
  async deleteExamType(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM exam_types WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_EXAM_TYPE",
        tableName: "exam_types",
        recordId: id,
        ipAddress
      });
    });
  },

  listExams: () => assessmentRepository.listExams(),
  async getExam(id: number) {
    const row = await assessmentRepository.getExam(id);
    if (!row) throw new NotFoundError("Exam not found");
    return row;
  },
  async createExam(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    ensureDateOrder(String(payload.startDate), String(payload.endDate), "startDate", "endDate");
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO exams (
          academic_year_id, term_id, exam_type_id, name, start_date, end_date, status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id`,
        [
          payload.academicYearId,
          payload.termId,
          payload.examTypeId,
          payload.name,
          payload.startDate,
          payload.endDate,
          payload.status ?? "PLANNED"
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_EXAM",
        tableName: "exams",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getExam(id);
  },
  async updateExam(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getExam(id);
    if (payload.startDate && payload.endDate) {
      ensureDateOrder(String(payload.startDate), String(payload.endDate), "startDate", "endDate");
    }
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE exams
         SET academic_year_id = COALESCE($2, academic_year_id),
             term_id = COALESCE($3, term_id),
             exam_type_id = COALESCE($4, exam_type_id),
             name = COALESCE($5, name),
             start_date = COALESCE($6, start_date),
             end_date = COALESCE($7, end_date),
             status = COALESCE($8, status)
         WHERE id = $1`,
        [id, payload.academicYearId ?? null, payload.termId ?? null, payload.examTypeId ?? null, payload.name ?? null, payload.startDate ?? null, payload.endDate ?? null, payload.status ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_EXAM",
        tableName: "exams",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getExam(id);
  },
  async updateExamStatus(actorUserId: number, id: number, status: string, ipAddress: string | null) {
    return this.updateExam(actorUserId, id, { status }, ipAddress);
  },
  async deleteExam(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM exams WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_EXAM",
        tableName: "exams",
        recordId: id,
        ipAddress
      });
    });
  },

  listExamSubjects: () => assessmentRepository.listExamSubjects(),
  async getExamSubject(id: number) {
    const row = await assessmentRepository.getExamSubject(id);
    if (!row) throw new NotFoundError("Exam subject not found");
    return row;
  },
  async createExamSubject(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (Number(payload.passMarks) > Number(payload.maximumMarks)) {
      throw new ValidationAppError("Validation failed", [
        { field: "passMarks", message: "Pass marks cannot exceed maximum marks" }
      ]);
    }
    ensureStrictTimeOrder(payload.startTime as string | undefined, payload.endTime as string | undefined);
    const id = await withTransaction(async (client) => {
      const exam = await client.query<{ start_date: string; end_date: string }>(`SELECT start_date, end_date FROM exams WHERE id = $1`, [payload.examId]);
      const examRow = exam.rows[0];
      if (!examRow) throw new NotFoundError("Exam not found");
      const startDate = toIsoDate(examRow.start_date);
      const endDate = toIsoDate(examRow.end_date);
      const normalizedExamDate = clampDateToRange(String(payload.examDate || startDate).slice(0, 10), startDate, endDate);

      const result = await client.query<{ id: number }>(
        `INSERT INTO exam_subjects (
          exam_id, classroom_id, subject_id, exam_date, start_time, end_time, maximum_marks, pass_marks
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [payload.examId, payload.classroomId, payload.subjectId, normalizedExamDate, payload.startTime ?? null, payload.endTime ?? null, payload.maximumMarks, payload.passMarks]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_EXAM_SUBJECT",
        tableName: "exam_subjects",
        recordId: result.rows[0].id,
        newValues: { ...payload, examDate: normalizedExamDate },
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getExamSubject(id);
  },
  async updateExamSubject(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const existing = await this.getExamSubject(id);
    ensureStrictTimeOrder(payload.startTime as string | undefined, payload.endTime as string | undefined);
    await withTransaction(async (client) => {
      const resolvedExamId = Number(payload.examId ?? existing.exam_id);
      const exam = await client.query<{ start_date: string; end_date: string }>(`SELECT start_date, end_date FROM exams WHERE id = $1`, [resolvedExamId]);
      const examRow = exam.rows[0];
      if (!examRow) throw new NotFoundError("Exam not found");
      const startDate = toIsoDate(examRow.start_date);
      const endDate = toIsoDate(examRow.end_date);
      const rawExamDate = String(payload.examDate ?? existing.exam_date ?? startDate).slice(0, 10);
      const normalizedExamDate = clampDateToRange(rawExamDate, startDate, endDate);

      await client.query(
        `UPDATE exam_subjects
         SET exam_id = COALESCE($2, exam_id),
             classroom_id = COALESCE($3, classroom_id),
             subject_id = COALESCE($4, subject_id),
             exam_date = COALESCE($5, exam_date),
             start_time = COALESCE($6, start_time),
             end_time = COALESCE($7, end_time),
             maximum_marks = COALESCE($8, maximum_marks),
             pass_marks = COALESCE($9, pass_marks)
         WHERE id = $1`,
        [id, payload.examId ?? null, payload.classroomId ?? null, payload.subjectId ?? null, normalizedExamDate, payload.startTime ?? null, payload.endTime ?? null, payload.maximumMarks ?? null, payload.passMarks ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_EXAM_SUBJECT",
        tableName: "exam_subjects",
        recordId: id,
        newValues: { ...payload, examDate: normalizedExamDate },
        ipAddress
      });
    });
    return this.getExamSubject(id);
  },
  async deleteExamSubject(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM exam_subjects WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_EXAM_SUBJECT",
        tableName: "exam_subjects",
        recordId: id,
        ipAddress
      });
    });
  },

  listResults: () => assessmentRepository.listResults(),
  async getResult(id: number) {
    const row = await assessmentRepository.getResult(id);
    if (!row) throw new NotFoundError("Exam result not found");
    return row;
  },
  async createBulkResults(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const examSubject = await this.getExamSubject(Number(payload.examSubjectId));
    const results = payload.results as Array<Record<string, unknown>>;

    await withTransaction(async (client) => {
      for (const result of results) {
        const isAbsent = Boolean(result.isAbsent);
        const marksObtained = result.marksObtained === undefined ? null : result.marksObtained;
        if (isAbsent && marksObtained !== null) {
          throw new ValidationAppError("Validation failed", [
            { field: "marksObtained", message: "Absent students must have marksObtained = null" }
          ]);
        }
        if (!isAbsent && marksObtained !== null && Number(marksObtained) > Number(examSubject.maximum_marks)) {
          throw new ValidationAppError("Validation failed", [
            { field: "marksObtained", message: "Marks cannot exceed maximum marks for the exam subject" }
          ]);
        }

        const percentage =
          marksObtained === null ? 0 : (Number(marksObtained) / Number(examSubject.maximum_marks)) * 100;
        const grade = isAbsent ? null : await normalizeGrade(client, percentage);

        await client.query(
          `INSERT INTO exam_results (
            exam_subject_id, student_id, marks_obtained, grade, remarks, is_absent, entered_by
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7)
          ON CONFLICT (exam_subject_id, student_id) DO UPDATE
          SET marks_obtained = EXCLUDED.marks_obtained,
              grade = EXCLUDED.grade,
              remarks = EXCLUDED.remarks,
              is_absent = EXCLUDED.is_absent,
              entered_by = EXCLUDED.entered_by,
              updated_at = CURRENT_TIMESTAMP`,
          [
            payload.examSubjectId,
            result.studentId,
            marksObtained,
            grade,
            result.remarks ?? null,
            isAbsent,
            actorUserId
          ]
        );
      }

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_BULK_RESULTS",
        tableName: "exam_results",
        recordId: Number(payload.examSubjectId),
        newValues: payload,
        ipAddress
      });
    });

    return this.getResultsByExamSubject(Number(payload.examSubjectId));
  },
  async updateResult(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const result = await this.getResult(id);
    await withTransaction(async (client) => {
      const examSubject = await client.query<{ maximum_marks: string }>(
        `SELECT maximum_marks FROM exam_subjects WHERE id = $1`,
        [result.exam_subject_id]
      );
      const maximumMarks = Number(examSubject.rows[0]?.maximum_marks ?? 100);
      if (payload.marksObtained !== undefined && Number(payload.marksObtained) > maximumMarks) {
        throw new ValidationAppError("Validation failed", [
          { field: "marksObtained", message: "Marks cannot exceed maximum marks for the exam subject" }
        ]);
      }

      const marksObtained =
        payload.marksObtained === undefined ? result.marks_obtained : payload.marksObtained;
      const isAbsent = payload.isAbsent === undefined ? result.is_absent : payload.isAbsent;
      const percentage =
        !marksObtained || isAbsent ? 0 : (Number(marksObtained) / maximumMarks) * 100;
      const grade = isAbsent ? null : await normalizeGrade(client, percentage);

      await client.query(
        `UPDATE exam_results
         SET marks_obtained = COALESCE($2, marks_obtained),
             grade = $3,
             remarks = COALESCE($4, remarks),
             is_absent = COALESCE($5, is_absent),
             entered_by = $6,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id, payload.marksObtained ?? null, grade, payload.remarks ?? null, payload.isAbsent ?? null, actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_RESULT",
        tableName: "exam_results",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getResult(id);
  },
  async deleteResult(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM exam_results WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_RESULT",
        tableName: "exam_results",
        recordId: id,
        ipAddress
      });
    });
  },
  getResultsByStudent: (studentId: number) => assessmentRepository.getResultsByStudent(studentId),
  getResultsByClassroom: (classroomId: number) => assessmentRepository.getResultsByClassroom(classroomId),
  getResultsByExam: (examId: number) => assessmentRepository.getResultsByExam(examId),
  getResultsByExamSubject: (examSubjectId: number) => assessmentRepository.getResultsByExamSubject(examSubjectId),

  listGradingScales: () => assessmentRepository.listGradingScales(),
  async getGradingScale(id: number) {
    const row = await assessmentRepository.getGradingScale(id);
    if (!row) throw new NotFoundError("Grading scale not found");
    return row;
  },
  async createGradingScale(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (Number(payload.minimumPercentage) > Number(payload.maximumPercentage)) {
      throw new ValidationAppError("Validation failed", [
        { field: "minimumPercentage", message: "Minimum percentage must not exceed maximum percentage" }
      ]);
    }
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO grading_scales (
          grade_name, minimum_percentage, maximum_percentage, grade_point, remarks
        )
        VALUES ($1,$2,$3,$4,$5)
        RETURNING id`,
        [payload.gradeName, payload.minimumPercentage, payload.maximumPercentage, payload.gradePoint ?? null, payload.remarks ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_GRADING_SCALE",
        tableName: "grading_scales",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getGradingScale(id);
  },
  async updateGradingScale(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getGradingScale(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE grading_scales
         SET grade_name = COALESCE($2, grade_name),
             minimum_percentage = COALESCE($3, minimum_percentage),
             maximum_percentage = COALESCE($4, maximum_percentage),
             grade_point = COALESCE($5, grade_point),
             remarks = COALESCE($6, remarks)
         WHERE id = $1`,
        [id, payload.gradeName ?? null, payload.minimumPercentage ?? null, payload.maximumPercentage ?? null, payload.gradePoint ?? null, payload.remarks ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_GRADING_SCALE",
        tableName: "grading_scales",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getGradingScale(id);
  },
  async deleteGradingScale(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM grading_scales WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_GRADING_SCALE",
        tableName: "grading_scales",
        recordId: id,
        ipAddress
      });
    });
  },

  listReportCards: () => assessmentRepository.listReportCards(),
  async getReportCard(id: number) {
    const row = await assessmentRepository.getReportCard(id);
    if (!row) throw new NotFoundError("Report card not found");
    return row;
  },
  async generateReportCard(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const resultRows = await client.query<{
        marks_obtained: string | null;
      }>(
        `SELECT er.marks_obtained
         FROM exam_results er
         JOIN exam_subjects es ON es.id = er.exam_subject_id
         JOIN exams e ON e.id = es.exam_id
         WHERE er.student_id = $1
           AND e.academic_year_id = $2
           AND e.term_id = $3
           AND es.classroom_id = $4
           AND er.is_absent = FALSE`,
        [payload.studentId, payload.academicYearId, payload.termId, payload.classroomId]
      );

      const totalMarks = resultRows.rows.reduce(
        (sum: number, row: { marks_obtained: string | null }) => sum + Number(row.marks_obtained ?? 0),
        0
      );
      const subjectCount = resultRows.rows.length;
      const averagePercentage = subjectCount === 0 ? 0 : totalMarks / subjectCount;
      const overallGrade = await normalizeGrade(client, averagePercentage);

      const existing = await client.query<{ id: number }>(
        `SELECT id FROM report_cards WHERE student_id = $1 AND academic_year_id = $2 AND term_id = $3`,
        [payload.studentId, payload.academicYearId, payload.termId]
      );

      let reportCardId: number;
      if (existing.rows[0]) {
        reportCardId = existing.rows[0].id;
        await client.query(
          `UPDATE report_cards
           SET classroom_id = $2,
               total_marks = $3,
               average_percentage = $4,
               overall_grade = $5,
               teacher_comment = COALESCE($6, teacher_comment),
               principal_comment = COALESCE($7, principal_comment)
           WHERE id = $1`,
          [
            reportCardId,
            payload.classroomId,
            totalMarks,
            averagePercentage,
            overallGrade,
            payload.teacherComment ?? null,
            payload.principalComment ?? null
          ]
        );
      } else {
        const insertResult = await client.query<{ id: number }>(
          `INSERT INTO report_cards (
            student_id, academic_year_id, term_id, classroom_id, total_marks,
            average_percentage, overall_grade, teacher_comment, principal_comment
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          RETURNING id`,
          [
            payload.studentId,
            payload.academicYearId,
            payload.termId,
            payload.classroomId,
            totalMarks,
            averagePercentage,
            overallGrade,
            payload.teacherComment ?? null,
            payload.principalComment ?? null
          ]
        );
        reportCardId = insertResult.rows[0].id;
      }

      const rankingRows = await client.query<{
        student_id: number;
        average_percentage: string;
      }>(
        `SELECT rc.student_id, rc.average_percentage
         FROM report_cards rc
         WHERE rc.academic_year_id = $1
           AND rc.term_id = $2
           AND rc.classroom_id = $3
         ORDER BY rc.average_percentage DESC, rc.student_id ASC`,
        [payload.academicYearId, payload.termId, payload.classroomId]
      );

      let currentPosition = 0;
      let previousAverage: number | null = null;
      let visibleRank = 0;
      for (const ranking of rankingRows.rows) {
        visibleRank += 1;
        const currentAverage = Number(ranking.average_percentage);
        if (previousAverage === null || currentAverage !== previousAverage) {
          currentPosition = visibleRank;
          previousAverage = currentAverage;
        }
        await client.query(`UPDATE report_cards SET class_position = $2 WHERE student_id = $1 AND academic_year_id = $3 AND term_id = $4`, [
          ranking.student_id,
          currentPosition,
          payload.academicYearId,
          payload.termId
        ]);
      }

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "GENERATE_REPORT_CARD",
        tableName: "report_cards",
        recordId: reportCardId,
        newValues: payload,
        ipAddress
      });
      return reportCardId;
    });
    return this.getReportCard(id);
  },
  async generateClassReportCards(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const students = await withTransaction(async (client) => {
      const result = await client.query<{ student_id: number }>(
        `SELECT student_id
         FROM student_enrollments
         WHERE academic_year_id = $1
           AND classroom_id = $2
           AND enrollment_status = 'ACTIVE'`,
        [payload.academicYearId, payload.classroomId]
      );
      return result.rows;
    });

    const generatedIds: number[] = [];
    for (const student of students) {
      const reportCard = await this.generateReportCard(
        actorUserId,
        {
          studentId: student.student_id,
          academicYearId: payload.academicYearId,
          termId: payload.termId,
          classroomId: payload.classroomId
        },
        ipAddress
      );
      generatedIds.push(reportCard.id);
    }

    return { generatedCount: generatedIds.length, reportCardIds: generatedIds };
  },
  async updateReportCard(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getReportCard(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE report_cards
         SET teacher_comment = COALESCE($2, teacher_comment),
             principal_comment = COALESCE($3, principal_comment),
             attendance_summary = COALESCE($4, attendance_summary)
         WHERE id = $1`,
        [id, payload.teacherComment ?? null, payload.principalComment ?? null, payload.attendanceSummary ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_REPORT_CARD",
        tableName: "report_cards",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getReportCard(id);
  },
  async publishReportCard(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE report_cards
         SET published_at = CURRENT_TIMESTAMP,
             published_by = $2
         WHERE id = $1`,
        [id, actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "PUBLISH_REPORT_CARD",
        tableName: "report_cards",
        recordId: id,
        ipAddress
      });
    });
    return this.getReportCard(id);
  },
  getReportCardsByStudent: (studentId: number) => assessmentRepository.getReportCardsByStudent(studentId),
  getReportCardsByClassroom: (classroomId: number) => assessmentRepository.getReportCardsByClassroom(classroomId)
};
