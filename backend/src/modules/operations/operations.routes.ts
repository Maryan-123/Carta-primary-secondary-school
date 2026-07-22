import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions, authorizeRolesOrPermissions } from "../../middleware/authorize";
import {
  authorizeStudentSelfOrLinkedParent,
  authorizeTeacherAssignedAttendanceRecord,
  authorizeTeacherAssignedAttendanceSession,
  authorizeTeacherAssignedClassroomParam,
  authorizeTeacherOwnRecord
} from "../../middleware/role-scope";
import { validate } from "../../middleware/validate";
import {
  createAttendanceSession,
  createBulkPromotion,
  createPromotion,
  createStaff,
  createStaffAttendance,
  createTeacher,
  createTeacherAssignment,
  createTimetableEntry,
  createTimetablePeriod,
  deleteAttendanceSession,
  deleteStaff,
  deleteStaffAttendance,
  deleteTeacher,
  deleteTeacherAssignment,
  deleteTimetableEntry,
  deleteTimetablePeriod,
  getAttendanceByClassroom,
  getAttendanceByStudent,
  getAttendanceSession,
  getClassroomTimetable,
  getStaff,
  getStaffAttendanceSummary,
  getStudentPromotionHistory,
  getTeacher,
  getTeacherAssignments,
  getTeacherClasses,
  getTeacherSubjects,
  getTeacherTimetable,
  listAttendanceSessions,
  listPromotions,
  listStaff,
  listStaffAttendance,
  listTeacherAssignments,
  listTeachers,
  listTimetableEntries,
  listTimetablePeriods,
  updateAttendanceRecord,
  updateAttendanceSessionRecords,
  updateStaff,
  updateStaffAttendance,
  updateTeacher,
  updateTeacherAssignment,
  updateTimetableEntry,
  updateTimetablePeriod
} from "./operations.controller";
import {
  attendanceRecordUpdateSchema,
  attendanceSessionSchema,
  bulkPromotionSchema,
  promotionSchema,
  staffAttendanceSchema,
  staffSchema,
  teacherAssignmentSchema,
  teacherSchema,
  timetableEntrySchema,
  timetablePeriodSchema
} from "./operations.validator";

const router = Router();

router.use(authenticate);

router.get("/staff", authorizePermissions("staff.manage"), listStaff);
router.get("/staff/:id", authorizePermissions("staff.manage"), getStaff);
router.post("/staff", authorizePermissions("staff.manage"), validate(staffSchema), createStaff);
router.patch("/staff/:id", authorizePermissions("staff.manage"), validate(staffSchema.partial()), updateStaff);
router.patch("/staff/:id/status", authorizePermissions("staff.manage"), validate(staffSchema.pick({ employmentStatus: true })), updateStaff);
router.delete("/staff/:id", authorizePermissions("staff.manage"), deleteStaff);

router.get("/teachers", authorizePermissions("staff.manage"), listTeachers);
router.get("/teachers/:id", authorizePermissions("staff.manage"), getTeacher);
router.post("/teachers", authorizePermissions("staff.manage"), validate(teacherSchema), createTeacher);
router.patch("/teachers/:id", authorizePermissions("staff.manage"), validate(teacherSchema.partial()), updateTeacher);
router.delete("/teachers/:id", authorizePermissions("staff.manage"), deleteTeacher);
router.get("/teachers/:id/assignments", authorizeRolesOrPermissions(["TEACHER"], ["staff.manage"]), authorizeTeacherOwnRecord(), getTeacherAssignments);
router.get("/teachers/:id/classes", authorizeRolesOrPermissions(["TEACHER"], ["staff.manage"]), authorizeTeacherOwnRecord(), getTeacherClasses);
router.get("/teachers/:id/subjects", authorizeRolesOrPermissions(["TEACHER"], ["staff.manage"]), authorizeTeacherOwnRecord(), getTeacherSubjects);
router.get("/teachers/:id/timetable", authorizeRolesOrPermissions(["TEACHER"], ["staff.manage"]), authorizeTeacherOwnRecord(), getTeacherTimetable);

router.get("/teacher-subject-assignments", authorizePermissions("academics.manage"), listTeacherAssignments);
router.post("/teacher-subject-assignments", authorizePermissions("academics.manage"), validate(teacherAssignmentSchema), createTeacherAssignment);
router.patch("/teacher-subject-assignments/:id", authorizePermissions("academics.manage"), validate(teacherAssignmentSchema.partial()), updateTeacherAssignment);
router.delete("/teacher-subject-assignments/:id", authorizePermissions("academics.manage"), deleteTeacherAssignment);

router.get("/promotions", authorizePermissions("students.view"), listPromotions);
router.post("/promotions/single", authorizePermissions("students.update"), validate(promotionSchema), createPromotion);
router.post("/promotions/bulk", authorizePermissions("students.update"), validate(bulkPromotionSchema), createBulkPromotion);
router.get("/students/:id/promotion-history", authorizePermissions("students.view"), getStudentPromotionHistory);

router.get("/timetable-periods", authorizePermissions("academics.manage"), listTimetablePeriods);
router.post("/timetable-periods", authorizePermissions("academics.manage"), validate(timetablePeriodSchema), createTimetablePeriod);
router.patch("/timetable-periods/:id", authorizePermissions("academics.manage"), validate(timetablePeriodSchema.partial()), updateTimetablePeriod);
router.delete("/timetable-periods/:id", authorizePermissions("academics.manage"), deleteTimetablePeriod);

router.get("/timetable", authorizePermissions("academics.manage"), listTimetableEntries);
router.post("/timetable", authorizePermissions("academics.manage"), validate(timetableEntrySchema), createTimetableEntry);
router.patch("/timetable/:id", authorizePermissions("academics.manage"), validate(timetableEntrySchema.partial()), updateTimetableEntry);
router.delete("/timetable/:id", authorizePermissions("academics.manage"), deleteTimetableEntry);
router.get("/timetable/classroom/:classroomId", authorizeRolesOrPermissions(["TEACHER"], ["academics.manage"]), authorizeTeacherAssignedClassroomParam(), getClassroomTimetable);
router.get("/timetable/teacher/:id", authorizeRolesOrPermissions(["TEACHER"], ["academics.manage"]), authorizeTeacherOwnRecord(), getTeacherTimetable);

router.get("/attendance/sessions", authorizeRolesOrPermissions(["TEACHER"], ["attendance.view"]), listAttendanceSessions);
router.get("/attendance/sessions/:id", authorizeRolesOrPermissions(["TEACHER"], ["attendance.view"]), authorizeTeacherAssignedAttendanceSession(), getAttendanceSession);
router.post("/attendance/sessions", authorizeRolesOrPermissions(["TEACHER"], ["attendance.record"]), authorizeTeacherAssignedClassroomParam(), validate(attendanceSessionSchema), createAttendanceSession);
router.put("/attendance/sessions/:id/records", authorizeRolesOrPermissions(["TEACHER"], ["attendance.record"]), authorizeTeacherAssignedAttendanceSession(), validate(attendanceSessionSchema.pick({ records: true })), updateAttendanceSessionRecords);
router.patch("/attendance/records/:id", authorizeRolesOrPermissions(["TEACHER"], ["attendance.record"]), authorizeTeacherAssignedAttendanceRecord(), validate(attendanceRecordUpdateSchema), updateAttendanceRecord);
router.delete("/attendance/sessions/:id", authorizeRolesOrPermissions(["TEACHER"], ["attendance.record"]), authorizeTeacherAssignedAttendanceSession(), deleteAttendanceSession);
router.get("/attendance/classroom/:classroomId", authorizeRolesOrPermissions(["TEACHER"], ["attendance.view"]), authorizeTeacherAssignedClassroomParam(), getAttendanceByClassroom);
router.get("/attendance/student/:studentId", authorizeRolesOrPermissions(["STUDENT", "PARENT", "TEACHER"], ["attendance.view"]), authorizeStudentSelfOrLinkedParent(), getAttendanceByStudent);

router.get("/staff-attendance", authorizePermissions("attendance.view"), listStaffAttendance);
router.post("/staff-attendance", authorizePermissions("attendance.record"), validate(staffAttendanceSchema), createStaffAttendance);
router.patch("/staff-attendance/:id", authorizePermissions("attendance.record"), validate(staffAttendanceSchema.partial()), updateStaffAttendance);
router.delete("/staff-attendance/:id", authorizePermissions("attendance.record"), deleteStaffAttendance);
router.get("/staff-attendance/summary", authorizePermissions("attendance.view"), getStaffAttendanceSummary);

export { router as operationsRoutes };
