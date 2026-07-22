import { z } from "zod";

export const staffSchema = z.object({
  userId: z.number().int().positive().optional(),
  employeeNumber: z.string().trim().min(1),
  staffType: z.enum([
    "PRINCIPAL",
    "TEACHER",
    "ACCOUNTANT",
    "LIBRARIAN",
    "ADMINISTRATOR",
    "RECEPTIONIST",
    "SUPPORT_STAFF"
  ]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  dateOfBirth: z.iso.date().optional(),
  phone: z.string().trim().optional(),
  email: z.email().optional(),
  address: z.string().trim().optional(),
  hireDate: z.iso.date(),
  salary: z.number().min(0).optional(),
  qualification: z.string().trim().optional(),
  employmentStatus: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "TERMINATED"]).optional()
});

export const teacherSchema = z.object({
  staffId: z.number().int().positive(),
  teacherNumber: z.string().trim().min(1),
  specialization: z.string().trim().optional(),
  qualification: z.string().trim().optional(),
  yearsOfExperience: z.number().int().min(0).optional(),
  isClassTeacher: z.boolean().optional()
});

export const teacherAssignmentSchema = z.object({
  teacherId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive()
});

export const promotionSchema = z.object({
  studentId: z.number().int().positive(),
  fromClassroomId: z.number().int().positive().optional(),
  toClassroomId: z.number().int().positive().optional(),
  fromAcademicYearId: z.number().int().positive().optional(),
  toAcademicYearId: z.number().int().positive().optional(),
  promotionStatus: z.enum(["PROMOTED", "REPEATED", "GRADUATED", "TRANSFERRED"]),
  remarks: z.string().trim().optional()
});

export const bulkPromotionSchema = z.object({
  studentIds: z.array(z.number().int().positive()).min(1),
  fromClassroomId: z.number().int().positive(),
  toClassroomId: z.number().int().positive(),
  fromAcademicYearId: z.number().int().positive(),
  toAcademicYearId: z.number().int().positive(),
  promotionStatus: z.enum(["PROMOTED", "REPEATED", "GRADUATED", "TRANSFERRED"]),
  remarks: z.string().trim().optional()
});

export const timetablePeriodSchema = z.object({
  name: z.string().trim().min(1),
  startTime: z.string().trim().min(1),
  endTime: z.string().trim().min(1),
  periodOrder: z.number().int().positive(),
  isBreak: z.boolean().optional()
});

export const timetableEntrySchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  subjectId: z.number().int().positive().optional(),
  teacherId: z.number().int().positive().optional(),
  periodId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(1).max(7),
  roomName: z.string().trim().optional()
});

export const attendanceSessionSchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  attendanceDate: z.iso.date(),
  remarks: z.string().trim().optional(),
  records: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "SICK"]),
        arrivalTime: z.string().trim().optional(),
        absenceReason: z.string().trim().optional(),
        remarks: z.string().trim().optional()
      })
    )
    .min(1)
});

export const attendanceRecordUpdateSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "SICK"]).optional(),
  arrivalTime: z.string().trim().optional(),
  absenceReason: z.string().trim().optional(),
  remarks: z.string().trim().optional()
});

export const staffAttendanceSchema = z.object({
  staffId: z.number().int().positive(),
  attendanceDate: z.iso.date(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "ON_LEAVE", "SICK"]),
  checkInTime: z.string().trim().optional(),
  checkOutTime: z.string().trim().optional(),
  remarks: z.string().trim().optional()
});
