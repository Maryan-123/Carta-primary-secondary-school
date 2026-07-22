import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { peopleRepository } from "./people.repository";

export const peopleService = {
  listParents: () => peopleRepository.listParents(),
  async getParent(id: number) {
    const row = await peopleRepository.getParent(id);
    if (!row) {
      throw new NotFoundError("Parent not found");
    }
    return row;
  },
  async createParent(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO parents (
          user_id, parent_number, first_name, middle_name, last_name, gender,
          phone, alternative_phone, email, occupation, address, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id`,
        [
          payload.userId ?? null,
          payload.parentNumber,
          payload.firstName,
          payload.middleName ?? null,
          payload.lastName,
          payload.gender ?? null,
          payload.phone,
          payload.alternativePhone ?? null,
          payload.email ?? null,
          payload.occupation ?? null,
          payload.address ?? null,
          payload.isActive ?? true
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_PARENT",
        tableName: "parents",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getParent(id);
  },
  async updateParent(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getParent(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE parents
         SET user_id = COALESCE($2, user_id),
             parent_number = COALESCE($3, parent_number),
             first_name = COALESCE($4, first_name),
             middle_name = COALESCE($5, middle_name),
             last_name = COALESCE($6, last_name),
             gender = COALESCE($7, gender),
             phone = COALESCE($8, phone),
             alternative_phone = COALESCE($9, alternative_phone),
             email = COALESCE($10, email),
             occupation = COALESCE($11, occupation),
             address = COALESCE($12, address),
             is_active = COALESCE($13, is_active)
         WHERE id = $1`,
        [id, payload.userId ?? null, payload.parentNumber ?? null, payload.firstName ?? null, payload.middleName ?? null, payload.lastName ?? null, payload.gender ?? null, payload.phone ?? null, payload.alternativePhone ?? null, payload.email ?? null, payload.occupation ?? null, payload.address ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_PARENT",
        tableName: "parents",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getParent(id);
  },
  async deleteParent(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getParent(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM parents WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_PARENT",
        tableName: "parents",
        recordId: id,
        ipAddress
      });
    });
  },
  getParentChildren: (parentId: number) => peopleRepository.getParentChildren(parentId),

  listStudents: () => peopleRepository.listStudents(),
  async getStudent(id: number) {
    const row = await peopleRepository.getStudent(id);
    if (!row) {
      throw new NotFoundError("Student not found");
    }
    return row;
  },
  async createStudent(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (new Date(String(payload.dateOfBirth)) >= new Date(String(payload.admissionDate))) {
      throw new ValidationAppError("Validation failed", [
        { field: "dateOfBirth", message: "Date of birth must be before admission date" }
      ]);
    }

    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO students (
          user_id, admission_number, first_name, middle_name, last_name, gender,
          date_of_birth, place_of_birth, phone, address, admission_date, previous_school,
          blood_group, medical_notes, profile_photo, student_status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id`,
        [
          payload.userId ?? null,
          payload.admissionNumber,
          payload.firstName,
          payload.middleName ?? null,
          payload.lastName,
          payload.gender,
          payload.dateOfBirth,
          payload.placeOfBirth ?? null,
          payload.phone ?? null,
          payload.address ?? null,
          payload.admissionDate,
          payload.previousSchool ?? null,
          payload.bloodGroup ?? null,
          payload.medicalNotes ?? null,
          payload.profilePhoto ?? null,
          payload.studentStatus ?? "ACTIVE"
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_STUDENT",
        tableName: "students",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getStudent(id);
  },
  async updateStudent(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getStudent(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE students
         SET user_id = COALESCE($2, user_id),
             admission_number = COALESCE($3, admission_number),
             first_name = COALESCE($4, first_name),
             middle_name = COALESCE($5, middle_name),
             last_name = COALESCE($6, last_name),
             gender = COALESCE($7, gender),
             date_of_birth = COALESCE($8, date_of_birth),
             place_of_birth = COALESCE($9, place_of_birth),
             phone = COALESCE($10, phone),
             address = COALESCE($11, address),
             admission_date = COALESCE($12, admission_date),
             previous_school = COALESCE($13, previous_school),
             blood_group = COALESCE($14, blood_group),
             medical_notes = COALESCE($15, medical_notes),
             profile_photo = COALESCE($16, profile_photo),
             student_status = COALESCE($17, student_status)
         WHERE id = $1`,
        [id, payload.userId ?? null, payload.admissionNumber ?? null, payload.firstName ?? null, payload.middleName ?? null, payload.lastName ?? null, payload.gender ?? null, payload.dateOfBirth ?? null, payload.placeOfBirth ?? null, payload.phone ?? null, payload.address ?? null, payload.admissionDate ?? null, payload.previousSchool ?? null, payload.bloodGroup ?? null, payload.medicalNotes ?? null, payload.profilePhoto ?? null, payload.studentStatus ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_STUDENT",
        tableName: "students",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getStudent(id);
  },
  async deleteStudent(actorUserId: number, id: number, ipAddress: string | null) {
    return this.updateStudent(actorUserId, id, { studentStatus: "WITHDRAWN" }, ipAddress);
  },
  getStudentParents: (studentId: number) => peopleRepository.getStudentParents(studentId),
  async addStudentParent(actorUserId: number, studentId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getStudent(studentId);
    await this.getParent(Number(payload.parentId));
    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO student_parents (
          student_id, parent_id, relationship, is_primary_contact, can_pick_student, lives_with_student
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (student_id, parent_id) DO UPDATE
        SET relationship = EXCLUDED.relationship,
            is_primary_contact = EXCLUDED.is_primary_contact,
            can_pick_student = EXCLUDED.can_pick_student,
            lives_with_student = EXCLUDED.lives_with_student`,
        [studentId, payload.parentId, payload.relationship, payload.isPrimaryContact ?? false, payload.canPickStudent ?? true, payload.livesWithStudent ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "LINK_STUDENT_PARENT",
        tableName: "student_parents",
        recordId: studentId,
        newValues: payload,
        ipAddress
      });
    });
    return this.getStudentParents(studentId);
  },
  async removeStudentParent(actorUserId: number, studentId: number, parentId: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM student_parents WHERE student_id = $1 AND parent_id = $2`, [studentId, parentId]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UNLINK_STUDENT_PARENT",
        tableName: "student_parents",
        recordId: studentId,
        ipAddress
      });
    });
  },

  listEnrollments: () => peopleRepository.listEnrollments(),
  async getEnrollment(id: number) {
    const row = await peopleRepository.getEnrollment(id);
    if (!row) {
      throw new NotFoundError("Enrollment not found");
    }
    return row;
  },
  async createEnrollment(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getStudent(Number(payload.studentId));
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO student_enrollments (
          student_id, academic_year_id, classroom_id, roll_number, enrollment_date, enrollment_status
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id`,
        [payload.studentId, payload.academicYearId, payload.classroomId, payload.rollNumber ?? null, payload.enrollmentDate, payload.enrollmentStatus ?? "ACTIVE"]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_ENROLLMENT",
        tableName: "student_enrollments",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getEnrollment(id);
  },
  async updateEnrollment(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getEnrollment(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE student_enrollments
         SET student_id = COALESCE($2, student_id),
             academic_year_id = COALESCE($3, academic_year_id),
             classroom_id = COALESCE($4, classroom_id),
             roll_number = COALESCE($5, roll_number),
             enrollment_date = COALESCE($6, enrollment_date),
             enrollment_status = COALESCE($7, enrollment_status)
         WHERE id = $1`,
        [id, payload.studentId ?? null, payload.academicYearId ?? null, payload.classroomId ?? null, payload.rollNumber ?? null, payload.enrollmentDate ?? null, payload.enrollmentStatus ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_ENROLLMENT",
        tableName: "student_enrollments",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getEnrollment(id);
  },
  async deleteEnrollment(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getEnrollment(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM student_enrollments WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_ENROLLMENT",
        tableName: "student_enrollments",
        recordId: id,
        ipAddress
      });
    });
  }
};
