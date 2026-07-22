import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { peopleRepository } from "../people/people.repository";
import { operationsRepository } from "./operations.repository";

const assertTimeOrder = (startTime: string, endTime: string, startField: string, endField: string): void => {
  if (endTime <= startTime) {
    throw new ValidationAppError("Validation failed", [
      { field: endField, message: `${endField} must be after ${startField}` }
    ]);
  }
};

export const operationsService = {
  listStaff: () => operationsRepository.listStaff(),
  async getStaff(id: number) {
    const row = await operationsRepository.getStaff(id);
    if (!row) throw new NotFoundError("Staff member not found");
    return row;
  },
  async createStaff(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO staff (
          user_id, employee_number, staff_type, gender, date_of_birth, phone, email,
          address, hire_date, salary, qualification, employment_status
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        RETURNING id`,
        [
          payload.userId ?? null,
          payload.employeeNumber,
          payload.staffType,
          payload.gender ?? null,
          payload.dateOfBirth ?? null,
          payload.phone ?? null,
          payload.email ?? null,
          payload.address ?? null,
          payload.hireDate,
          payload.salary ?? 0,
          payload.qualification ?? null,
          payload.employmentStatus ?? "ACTIVE"
        ]
      );

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_STAFF",
        tableName: "staff",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });

      return result.rows[0].id;
    });

    return this.getStaff(id);
  },
  async updateStaff(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getStaff(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE staff
         SET user_id = COALESCE($2, user_id),
             employee_number = COALESCE($3, employee_number),
             staff_type = COALESCE($4, staff_type),
             gender = COALESCE($5, gender),
             date_of_birth = COALESCE($6, date_of_birth),
             phone = COALESCE($7, phone),
             email = COALESCE($8, email),
             address = COALESCE($9, address),
             hire_date = COALESCE($10, hire_date),
             salary = COALESCE($11, salary),
             qualification = COALESCE($12, qualification),
             employment_status = COALESCE($13, employment_status)
         WHERE id = $1`,
        [
          id,
          payload.userId ?? null,
          payload.employeeNumber ?? null,
          payload.staffType ?? null,
          payload.gender ?? null,
          payload.dateOfBirth ?? null,
          payload.phone ?? null,
          payload.email ?? null,
          payload.address ?? null,
          payload.hireDate ?? null,
          payload.salary ?? null,
          payload.qualification ?? null,
          payload.employmentStatus ?? null
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_STAFF",
        tableName: "staff",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getStaff(id);
  },
  async deleteStaff(actorUserId: number, id: number, ipAddress: string | null) {
    return this.updateStaff(actorUserId, id, { employmentStatus: "TERMINATED" }, ipAddress);
  },

  listTeachers: () => operationsRepository.listTeachers(),
  async getTeacher(id: number) {
    const row = await operationsRepository.getTeacher(id);
    if (!row) throw new NotFoundError("Teacher not found");
    return row;
  },
  async createTeacher(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const staff = await this.getStaff(Number(payload.staffId));
    if (staff.staff_type !== "TEACHER") {
      throw new ValidationAppError("Validation failed", [
        { field: "staffId", message: "The selected staff record must have staff_type = TEACHER" }
      ]);
    }

    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO teachers (staff_id, teacher_number, specialization, qualification, years_of_experience, is_class_teacher)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [
          payload.staffId,
          payload.teacherNumber,
          payload.specialization ?? null,
          payload.qualification ?? null,
          payload.yearsOfExperience ?? 0,
          payload.isClassTeacher ?? false
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_TEACHER",
        tableName: "teachers",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });

    return this.getTeacher(id);
  },
  async updateTeacher(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getTeacher(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE teachers
         SET staff_id = COALESCE($2, staff_id),
             teacher_number = COALESCE($3, teacher_number),
             specialization = COALESCE($4, specialization),
             qualification = COALESCE($5, qualification),
             years_of_experience = COALESCE($6, years_of_experience),
             is_class_teacher = COALESCE($7, is_class_teacher)
         WHERE id = $1`,
        [
          id,
          payload.staffId ?? null,
          payload.teacherNumber ?? null,
          payload.specialization ?? null,
          payload.qualification ?? null,
          payload.yearsOfExperience ?? null,
          payload.isClassTeacher ?? null
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_TEACHER",
        tableName: "teachers",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getTeacher(id);
  },
  async deleteTeacher(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getTeacher(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM teachers WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_TEACHER",
        tableName: "teachers",
        recordId: id,
        ipAddress
      });
    });
  },

  listTeacherAssignments: () => operationsRepository.listTeacherAssignments(),
  async createTeacherAssignment(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO teacher_subject_assignments (teacher_id, classroom_id, subject_id, academic_year_id, term_id)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id`,
        [payload.teacherId, payload.classroomId, payload.subjectId, payload.academicYearId, payload.termId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_TEACHER_ASSIGNMENT",
        tableName: "teacher_subject_assignments",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return { id };
  },
  async updateTeacherAssignment(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE teacher_subject_assignments
         SET teacher_id = COALESCE($2, teacher_id),
             classroom_id = COALESCE($3, classroom_id),
             subject_id = COALESCE($4, subject_id),
             academic_year_id = COALESCE($5, academic_year_id),
             term_id = COALESCE($6, term_id)
         WHERE id = $1`,
        [id, payload.teacherId ?? null, payload.classroomId ?? null, payload.subjectId ?? null, payload.academicYearId ?? null, payload.termId ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_TEACHER_ASSIGNMENT",
        tableName: "teacher_subject_assignments",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return { id };
  },
  async deleteTeacherAssignment(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM teacher_subject_assignments WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_TEACHER_ASSIGNMENT",
        tableName: "teacher_subject_assignments",
        recordId: id,
        ipAddress
      });
    });
  },
  getTeacherAssignmentsByTeacher: (teacherId: number) => operationsRepository.getTeacherAssignmentsByTeacher(teacherId),
  getTeacherClasses: (teacherId: number) => operationsRepository.getTeacherClasses(teacherId),
  getTeacherSubjects: (teacherId: number) => operationsRepository.getTeacherSubjects(teacherId),
  getTeacherTimetable: (teacherId: number) => operationsRepository.getTeacherTimetable(teacherId),

  listPromotions: () => operationsRepository.listPromotions(),
  getStudentPromotionHistory: (studentId: number) => operationsRepository.getStudentPromotionHistory(studentId),
  async createPromotion(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await peopleRepository.getStudent(payload.studentId as number);
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO student_promotions (
          student_id, from_classroom_id, to_classroom_id, from_academic_year_id, to_academic_year_id,
          promotion_status, remarks, promoted_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [
          payload.studentId,
          payload.fromClassroomId ?? null,
          payload.toClassroomId ?? null,
          payload.fromAcademicYearId ?? null,
          payload.toAcademicYearId ?? null,
          payload.promotionStatus,
          payload.remarks ?? null,
          actorUserId
        ]
      );
      if (payload.toAcademicYearId && payload.toClassroomId) {
        await client.query(
          `UPDATE student_enrollments
           SET enrollment_status = 'COMPLETED'
           WHERE student_id = $1 AND academic_year_id = $2`,
          [payload.studentId, payload.fromAcademicYearId ?? null]
        );
        await client.query(
          `INSERT INTO student_enrollments (student_id, academic_year_id, classroom_id, enrollment_date, enrollment_status)
           VALUES ($1,$2,$3,CURRENT_DATE,'ACTIVE')
           ON CONFLICT (student_id, academic_year_id) DO NOTHING`,
          [payload.studentId, payload.toAcademicYearId, payload.toClassroomId]
        );
      }
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_PROMOTION",
        tableName: "student_promotions",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return { id };
  },
  async createBulkPromotion(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const ids = payload.studentIds as number[];
    await withTransaction(async (client) => {
      for (const studentId of ids) {
        await client.query(
          `UPDATE student_enrollments
           SET enrollment_status = 'COMPLETED'
           WHERE student_id = $1 AND academic_year_id = $2 AND classroom_id = $3`,
          [studentId, payload.fromAcademicYearId, payload.fromClassroomId]
        );
        await client.query(
          `INSERT INTO student_enrollments (student_id, academic_year_id, classroom_id, enrollment_date, enrollment_status)
           VALUES ($1,$2,$3,CURRENT_DATE,'ACTIVE')
           ON CONFLICT (student_id, academic_year_id) DO NOTHING`,
          [studentId, payload.toAcademicYearId, payload.toClassroomId]
        );
        await client.query(
          `INSERT INTO student_promotions (
            student_id, from_classroom_id, to_classroom_id, from_academic_year_id, to_academic_year_id,
            promotion_status, remarks, promoted_by
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            studentId,
            payload.fromClassroomId,
            payload.toClassroomId,
            payload.fromAcademicYearId,
            payload.toAcademicYearId,
            payload.promotionStatus,
            payload.remarks ?? null,
            actorUserId
          ]
        );
      }
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_BULK_PROMOTION",
        tableName: "student_promotions",
        newValues: payload,
        ipAddress
      });
    });
    return { promotedCount: ids.length };
  },

  listTimetablePeriods: () => operationsRepository.listTimetablePeriods(),
  async getTimetablePeriod(id: number) {
    const row = await operationsRepository.getTimetablePeriod(id);
    if (!row) throw new NotFoundError("Timetable period not found");
    return row;
  },
  async createTimetablePeriod(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    assertTimeOrder(String(payload.startTime), String(payload.endTime), "startTime", "endTime");
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO timetable_periods (name, start_time, end_time, period_order, is_break)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id`,
        [payload.name, payload.startTime, payload.endTime, payload.periodOrder, payload.isBreak ?? false]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_TIMETABLE_PERIOD",
        tableName: "timetable_periods",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getTimetablePeriod(id);
  },
  async updateTimetablePeriod(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getTimetablePeriod(id);
    if (payload.startTime && payload.endTime) {
      assertTimeOrder(String(payload.startTime), String(payload.endTime), "startTime", "endTime");
    }
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE timetable_periods
         SET name = COALESCE($2, name),
             start_time = COALESCE($3, start_time),
             end_time = COALESCE($4, end_time),
             period_order = COALESCE($5, period_order),
             is_break = COALESCE($6, is_break)
         WHERE id = $1`,
        [id, payload.name ?? null, payload.startTime ?? null, payload.endTime ?? null, payload.periodOrder ?? null, payload.isBreak ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_TIMETABLE_PERIOD",
        tableName: "timetable_periods",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getTimetablePeriod(id);
  },
  async deleteTimetablePeriod(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM timetable_periods WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_TIMETABLE_PERIOD",
        tableName: "timetable_periods",
        recordId: id,
        ipAddress
      });
    });
  },
  listTimetableEntries: () => operationsRepository.listTimetableEntries(),
  getClassroomTimetable: (classroomId: number) => operationsRepository.getClassroomTimetable(classroomId),
  async createTimetableEntry(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO timetable_entries (
          academic_year_id, term_id, classroom_id, subject_id, teacher_id, period_id, day_of_week, room_name
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id`,
        [
          payload.academicYearId,
          payload.termId,
          payload.classroomId,
          payload.subjectId ?? null,
          payload.teacherId ?? null,
          payload.periodId,
          payload.dayOfWeek,
          payload.roomName ?? null
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_TIMETABLE_ENTRY",
        tableName: "timetable_entries",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return { id };
  },
  async updateTimetableEntry(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE timetable_entries
         SET academic_year_id = COALESCE($2, academic_year_id),
             term_id = COALESCE($3, term_id),
             classroom_id = COALESCE($4, classroom_id),
             subject_id = COALESCE($5, subject_id),
             teacher_id = COALESCE($6, teacher_id),
             period_id = COALESCE($7, period_id),
             day_of_week = COALESCE($8, day_of_week),
             room_name = COALESCE($9, room_name)
         WHERE id = $1`,
        [
          id,
          payload.academicYearId ?? null,
          payload.termId ?? null,
          payload.classroomId ?? null,
          payload.subjectId ?? null,
          payload.teacherId ?? null,
          payload.periodId ?? null,
          payload.dayOfWeek ?? null,
          payload.roomName ?? null
        ]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_TIMETABLE_ENTRY",
        tableName: "timetable_entries",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return { id };
  },
  async deleteTimetableEntry(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM timetable_entries WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_TIMETABLE_ENTRY",
        tableName: "timetable_entries",
        recordId: id,
        ipAddress
      });
    });
  },

  listAttendanceSessions: () => operationsRepository.listAttendanceSessions(),
  async getAttendanceSession(id: number) {
    const row = await operationsRepository.getAttendanceSession(id);
    if (!row) throw new NotFoundError("Attendance session not found");
    return row;
  },
  async createAttendanceSession(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const sessionId = await withTransaction(async (client) => {
      const sessionResult = await client.query<{ id: number }>(
        `INSERT INTO attendance_sessions (
          academic_year_id, term_id, classroom_id, attendance_date, taken_by, remarks
        )
        VALUES ($1,$2,$3,$4,$5,$6)
        RETURNING id`,
        [
          payload.academicYearId,
          payload.termId,
          payload.classroomId,
          payload.attendanceDate,
          actorUserId,
          payload.remarks ?? null
        ]
      );

      const sessionId = sessionResult.rows[0].id;
      const records = payload.records as Array<Record<string, unknown>>;
      for (const record of records) {
        await client.query(
          `INSERT INTO attendance_records (
            attendance_session_id, student_id, status, arrival_time, absence_reason, remarks
          )
          VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            sessionId,
            record.studentId,
            record.status,
            record.arrivalTime ?? null,
            record.absenceReason ?? null,
            record.remarks ?? null
          ]
        );
      }

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_ATTENDANCE_SESSION",
        tableName: "attendance_sessions",
        recordId: sessionId,
        newValues: payload,
        ipAddress
      });
      return sessionId;
    });
    return this.getAttendanceSession(sessionId);
  },
  async updateAttendanceRecords(actorUserId: number, sessionId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getAttendanceSession(sessionId);
    await withTransaction(async (client) => {
      const records = payload.records as Array<Record<string, unknown>>;
      await client.query(`DELETE FROM attendance_records WHERE attendance_session_id = $1`, [sessionId]);
      for (const record of records) {
        await client.query(
          `INSERT INTO attendance_records (
            attendance_session_id, student_id, status, arrival_time, absence_reason, remarks
          )
          VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            sessionId,
            record.studentId,
            record.status,
            record.arrivalTime ?? null,
            record.absenceReason ?? null,
            record.remarks ?? null
          ]
        );
      }
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_ATTENDANCE_SESSION_RECORDS",
        tableName: "attendance_records",
        recordId: sessionId,
        newValues: payload,
        ipAddress
      });
    });
    return this.getAttendanceSession(sessionId);
  },
  async updateAttendanceRecord(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE attendance_records
         SET status = COALESCE($2, status),
             arrival_time = COALESCE($3, arrival_time),
             absence_reason = COALESCE($4, absence_reason),
             remarks = COALESCE($5, remarks)
         WHERE id = $1`,
        [id, payload.status ?? null, payload.arrivalTime ?? null, payload.absenceReason ?? null, payload.remarks ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_ATTENDANCE_RECORD",
        tableName: "attendance_records",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return { id };
  },
  async deleteAttendanceSession(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM attendance_sessions WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_ATTENDANCE_SESSION",
        tableName: "attendance_sessions",
        recordId: id,
        ipAddress
      });
    });
  },
  getAttendanceByClassroom: (classroomId: number) => operationsRepository.getAttendanceByClassroom(classroomId),
  getAttendanceByStudent: (studentId: number) => operationsRepository.getAttendanceByStudent(studentId),

  listStaffAttendance: () => operationsRepository.listStaffAttendance(),
  getStaffAttendanceSummary: () => operationsRepository.getStaffAttendanceSummary(),
  async createStaffAttendance(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (payload.checkInTime && payload.checkOutTime) {
      assertTimeOrder(String(payload.checkInTime), String(payload.checkOutTime), "checkInTime", "checkOutTime");
    }
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO staff_attendance (
          staff_id, attendance_date, status, check_in_time, check_out_time, remarks, recorded_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id`,
        [payload.staffId, payload.attendanceDate, payload.status, payload.checkInTime ?? null, payload.checkOutTime ?? null, payload.remarks ?? null, actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_STAFF_ATTENDANCE",
        tableName: "staff_attendance",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return { id };
  },
  async updateStaffAttendance(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE staff_attendance
         SET staff_id = COALESCE($2, staff_id),
             attendance_date = COALESCE($3, attendance_date),
             status = COALESCE($4, status),
             check_in_time = COALESCE($5, check_in_time),
             check_out_time = COALESCE($6, check_out_time),
             remarks = COALESCE($7, remarks)
         WHERE id = $1`,
        [id, payload.staffId ?? null, payload.attendanceDate ?? null, payload.status ?? null, payload.checkInTime ?? null, payload.checkOutTime ?? null, payload.remarks ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_STAFF_ATTENDANCE",
        tableName: "staff_attendance",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return { id };
  },
  async deleteStaffAttendance(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM staff_attendance WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_STAFF_ATTENDANCE",
        tableName: "staff_attendance",
        recordId: id,
        ipAddress
      });
    });
  }
};
