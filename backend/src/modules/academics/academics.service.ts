import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { academicsRepository } from "./academics.repository";

const assertDateRange = (startDate: string, endDate: string, startField: string, endField: string): void => {
  if (new Date(endDate) <= new Date(startDate)) {
    throw new ValidationAppError("Validation failed", [
      { field: endField, message: `${endField} must be after ${startField}` }
    ]);
  }
};

export const academicsService = {
  getSchoolSettings: () => academicsRepository.getSchoolSettings(),

  async updateSchoolSettings(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await withTransaction(async (client) => {
      const id = await academicsRepository.upsertSchoolSettings(client, payload);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_SCHOOL_SETTINGS",
        tableName: "school_settings",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });

    return academicsRepository.getSchoolSettings();
  },

  listAcademicYears: () => academicsRepository.listAcademicYears(),
  getCurrentAcademicYear: async () => academicsRepository.getCurrentAcademicYear(),
  async getAcademicYear(id: number) {
    const row = await academicsRepository.getAcademicYear(id);
    if (!row) {
      throw new NotFoundError("Academic year not found");
    }
    return row;
  },

  async createAcademicYear(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    assertDateRange(String(payload.startDate), String(payload.endDate), "startDate", "endDate");
    const id = await withTransaction(async (client) => {
      if (payload.isCurrent === true) {
        await client.query(`UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE`);
      }

      const result = await client.query<{ id: number }>(
        `INSERT INTO academic_years (name, start_date, end_date, is_current, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          payload.name,
          payload.startDate,
          payload.endDate,
          payload.isCurrent ?? false,
          payload.status ?? "ACTIVE"
        ]
      );

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_ACADEMIC_YEAR",
        tableName: "academic_years",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });

      return result.rows[0].id;
    });
    return this.getAcademicYear(id);
  },

  async updateAcademicYear(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getAcademicYear(id);
    if (payload.startDate && payload.endDate) {
      assertDateRange(String(payload.startDate), String(payload.endDate), "startDate", "endDate");
    }

    await withTransaction(async (client) => {
      if (payload.isCurrent === true) {
        await client.query(`UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE`);
      }

      await client.query(
        `UPDATE academic_years
         SET name = COALESCE($2, name),
             start_date = COALESCE($3, start_date),
             end_date = COALESCE($4, end_date),
             is_current = COALESCE($5, is_current),
             status = COALESCE($6, status)
         WHERE id = $1`,
        [id, payload.name ?? null, payload.startDate ?? null, payload.endDate ?? null, payload.isCurrent ?? null, payload.status ?? null]
      );

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_ACADEMIC_YEAR",
        tableName: "academic_years",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });

    return this.getAcademicYear(id);
  },

  async setCurrentAcademicYear(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getAcademicYear(id);
    await withTransaction(async (client) => {
      await client.query(`UPDATE academic_years SET is_current = FALSE WHERE is_current = TRUE`);
      await client.query(`UPDATE academic_years SET is_current = TRUE WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "SET_CURRENT_ACADEMIC_YEAR",
        tableName: "academic_years",
        recordId: id,
        ipAddress
      });
    });
    return this.getAcademicYear(id);
  },

  async closeAcademicYear(actorUserId: number, id: number, ipAddress: string | null) {
    return this.updateAcademicYear(actorUserId, id, { status: "CLOSED" }, ipAddress);
  },

  async deleteAcademicYear(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getAcademicYear(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM academic_years WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_ACADEMIC_YEAR",
        tableName: "academic_years",
        recordId: id,
        ipAddress
      });
    });
  },

  listTerms: () => academicsRepository.listTerms(),
  getCurrentTerm: () => academicsRepository.getCurrentTerm(),
  async getTerm(id: number) {
    const term = await academicsRepository.getTerm(id);
    if (!term) {
      throw new NotFoundError("Term not found");
    }
    return term;
  },

  async createTerm(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const academicYear = await this.getAcademicYear(Number(payload.academicYearId));
    assertDateRange(String(payload.startDate), String(payload.endDate), "startDate", "endDate");
    if (new Date(String(payload.startDate)) < new Date(String(academicYear.start_date)) || new Date(String(payload.endDate)) > new Date(String(academicYear.end_date))) {
      throw new ValidationAppError("Validation failed", [
        { field: "startDate", message: "Term dates must fall inside the selected academic year" }
      ]);
    }

    const id = await withTransaction(async (client) => {
      if (payload.isCurrent === true) {
        await client.query(`UPDATE terms SET is_current = FALSE WHERE academic_year_id = $1`, [payload.academicYearId]);
      }
      const result = await client.query<{ id: number }>(
        `INSERT INTO terms (academic_year_id, name, start_date, end_date, is_current, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [payload.academicYearId, payload.name, payload.startDate, payload.endDate, payload.isCurrent ?? false, payload.status ?? "ACTIVE"]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_TERM",
        tableName: "terms",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getTerm(id);
  },

  async updateTerm(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getTerm(id);
    await withTransaction(async (client) => {
      if (payload.isCurrent === true && payload.academicYearId) {
        await client.query(`UPDATE terms SET is_current = FALSE WHERE academic_year_id = $1`, [payload.academicYearId]);
      }
      await client.query(
        `UPDATE terms
         SET academic_year_id = COALESCE($2, academic_year_id),
             name = COALESCE($3, name),
             start_date = COALESCE($4, start_date),
             end_date = COALESCE($5, end_date),
             is_current = COALESCE($6, is_current),
             status = COALESCE($7, status)
         WHERE id = $1`,
        [id, payload.academicYearId ?? null, payload.name ?? null, payload.startDate ?? null, payload.endDate ?? null, payload.isCurrent ?? null, payload.status ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_TERM",
        tableName: "terms",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getTerm(id);
  },

  setCurrentTerm(actorUserId: number, id: number, ipAddress: string | null) {
    return this.updateTerm(actorUserId, id, { isCurrent: true }, ipAddress);
  },
  closeTerm(actorUserId: number, id: number, ipAddress: string | null) {
    return this.updateTerm(actorUserId, id, { status: "CLOSED" }, ipAddress);
  },
  async deleteTerm(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getTerm(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM terms WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_TERM",
        tableName: "terms",
        recordId: id,
        ipAddress
      });
    });
  },

  listGradeLevels: () => academicsRepository.listGradeLevels(),
  async getGradeLevel(id: number) {
    const row = await academicsRepository.getGradeLevel(id);
    if (!row) {
      throw new NotFoundError("Grade level not found");
    }
    return row;
  },
  async createGradeLevel(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO grade_levels (name, level_order, description, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [payload.name, payload.levelOrder, payload.description ?? null, payload.isActive ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_GRADE_LEVEL",
        tableName: "grade_levels",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getGradeLevel(id);
  },
  async updateGradeLevel(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getGradeLevel(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE grade_levels
         SET name = COALESCE($2, name),
             level_order = COALESCE($3, level_order),
             description = COALESCE($4, description),
             is_active = COALESCE($5, is_active)
         WHERE id = $1`,
        [id, payload.name ?? null, payload.levelOrder ?? null, payload.description ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_GRADE_LEVEL",
        tableName: "grade_levels",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getGradeLevel(id);
  },
  async deleteGradeLevel(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getGradeLevel(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM grade_levels WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_GRADE_LEVEL",
        tableName: "grade_levels",
        recordId: id,
        ipAddress
      });
    });
  },

  listClassrooms: () => academicsRepository.listClassrooms(),
  async getClassroom(id: number) {
    const row = await academicsRepository.getClassroom(id);
    if (!row) {
      throw new NotFoundError("Classroom not found");
    }
    return row;
  },
  async createClassroom(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getGradeLevel(Number(payload.gradeLevelId));
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO classrooms (grade_level_id, name, section_name, capacity, room_name, class_teacher_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [payload.gradeLevelId, payload.name, payload.sectionName ?? null, payload.capacity, payload.roomName ?? null, payload.classTeacherId ?? null, payload.isActive ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_CLASSROOM",
        tableName: "classrooms",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getClassroom(id);
  },
  async updateClassroom(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getClassroom(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE classrooms
         SET grade_level_id = COALESCE($2, grade_level_id),
             name = COALESCE($3, name),
             section_name = COALESCE($4, section_name),
             capacity = COALESCE($5, capacity),
             room_name = COALESCE($6, room_name),
             class_teacher_id = COALESCE($7, class_teacher_id),
             is_active = COALESCE($8, is_active)
         WHERE id = $1`,
        [id, payload.gradeLevelId ?? null, payload.name ?? null, payload.sectionName ?? null, payload.capacity ?? null, payload.roomName ?? null, payload.classTeacherId ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_CLASSROOM",
        tableName: "classrooms",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getClassroom(id);
  },
  async deleteClassroom(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getClassroom(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM classrooms WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_CLASSROOM",
        tableName: "classrooms",
        recordId: id,
        ipAddress
      });
    });
  },

  listSubjects: () => academicsRepository.listSubjects(),
  async getSubject(id: number) {
    const row = await academicsRepository.getSubject(id);
    if (!row) {
      throw new NotFoundError("Subject not found");
    }
    return row;
  },
  async createSubject(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (Number(payload.passMarks) > Number(payload.maximumMarks)) {
      throw new ValidationAppError("Validation failed", [{ field: "passMarks", message: "Pass marks cannot exceed maximum marks" }]);
    }
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO subjects (code, name, description, maximum_marks, pass_marks, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [payload.code, payload.name, payload.description ?? null, payload.maximumMarks, payload.passMarks, payload.isActive ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_SUBJECT",
        tableName: "subjects",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getSubject(id);
  },
  async updateSubject(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getSubject(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE subjects
         SET code = COALESCE($2, code),
             name = COALESCE($3, name),
             description = COALESCE($4, description),
             maximum_marks = COALESCE($5, maximum_marks),
             pass_marks = COALESCE($6, pass_marks),
             is_active = COALESCE($7, is_active)
         WHERE id = $1`,
        [id, payload.code ?? null, payload.name ?? null, payload.description ?? null, payload.maximumMarks ?? null, payload.passMarks ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_SUBJECT",
        tableName: "subjects",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getSubject(id);
  },
  async deleteSubject(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getSubject(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM subjects WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_SUBJECT",
        tableName: "subjects",
        recordId: id,
        ipAddress
      });
    });
  },

  listClassSubjects: () => academicsRepository.listClassSubjects(),
  async createClassSubject(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getClassroom(Number(payload.classroomId));
    await this.getSubject(Number(payload.subjectId));
    await this.getAcademicYear(Number(payload.academicYearId));
    return withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO class_subjects (classroom_id, subject_id, academic_year_id, is_compulsory)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [payload.classroomId, payload.subjectId, payload.academicYearId, payload.isCompulsory ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_CLASS_SUBJECT",
        tableName: "class_subjects",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0];
    });
  },
  async deleteClassSubject(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM class_subjects WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_CLASS_SUBJECT",
        tableName: "class_subjects",
        recordId: id,
        ipAddress
      });
    });
  }
};
