import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { operationsService } from "./operations.service";

const listResponder =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    const data = await method(...args);
    sendSuccess(response, 200, message, data);
  });

export const listStaff = listResponder(() => operationsService.listStaff(), "Staff retrieved successfully");
export const getStaff = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Staff member retrieved successfully", await operationsService.getStaff(Number(request.params.id)));
});
export const createStaff = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Staff member created successfully", await operationsService.createStaff(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateStaff = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Staff member updated successfully", await operationsService.updateStaff(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteStaff = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Staff member status updated successfully", await operationsService.deleteStaff(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null));
});

export const listTeachers = listResponder(() => operationsService.listTeachers(), "Teachers retrieved successfully");
export const getTeacher = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Teacher retrieved successfully", await operationsService.getTeacher(Number(request.params.id)));
});
export const createTeacher = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Teacher created successfully", await operationsService.createTeacher(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateTeacher = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Teacher updated successfully", await operationsService.updateTeacher(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteTeacher = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteTeacher(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Teacher deleted successfully", {});
});
export const getTeacherAssignments = listResponder(operationsService.getTeacherAssignmentsByTeacher, "Teacher assignments retrieved successfully", (request) => [Number(request.params.id)] as never[]);
export const getTeacherClasses = listResponder(operationsService.getTeacherClasses, "Teacher classes retrieved successfully", (request) => [Number(request.params.id)] as never[]);
export const getTeacherSubjects = listResponder(operationsService.getTeacherSubjects, "Teacher subjects retrieved successfully", (request) => [Number(request.params.id)] as never[]);
export const getTeacherTimetable = listResponder(operationsService.getTeacherTimetable, "Teacher timetable retrieved successfully", (request) => [Number(request.params.id)] as never[]);

export const listTeacherAssignments = listResponder(() => operationsService.listTeacherAssignments(), "Teacher subject assignments retrieved successfully");
export const createTeacherAssignment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Teacher subject assignment created successfully", await operationsService.createTeacherAssignment(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateTeacherAssignment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Teacher subject assignment updated successfully", await operationsService.updateTeacherAssignment(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteTeacherAssignment = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteTeacherAssignment(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Teacher subject assignment deleted successfully", {});
});

export const listPromotions = listResponder(() => operationsService.listPromotions(), "Promotions retrieved successfully");
export const getStudentPromotionHistory = listResponder(operationsService.getStudentPromotionHistory, "Promotion history retrieved successfully", (request) => [Number(request.params.id)] as never[]);
export const createPromotion = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Student promotion created successfully", await operationsService.createPromotion(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const createBulkPromotion = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Bulk promotion completed successfully", await operationsService.createBulkPromotion(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});

export const listTimetablePeriods = listResponder(() => operationsService.listTimetablePeriods(), "Timetable periods retrieved successfully");
export const createTimetablePeriod = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Timetable period created successfully", await operationsService.createTimetablePeriod(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateTimetablePeriod = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Timetable period updated successfully", await operationsService.updateTimetablePeriod(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteTimetablePeriod = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteTimetablePeriod(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Timetable period deleted successfully", {});
});
export const listTimetableEntries = listResponder(() => operationsService.listTimetableEntries(), "Timetable entries retrieved successfully");
export const createTimetableEntry = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Timetable entry created successfully", await operationsService.createTimetableEntry(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateTimetableEntry = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Timetable entry updated successfully", await operationsService.updateTimetableEntry(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteTimetableEntry = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteTimetableEntry(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Timetable entry deleted successfully", {});
});
export const getClassroomTimetable = listResponder(operationsService.getClassroomTimetable, "Classroom timetable retrieved successfully", (request) => [Number(request.params.classroomId)] as never[]);

export const listAttendanceSessions = listResponder(() => operationsService.listAttendanceSessions(), "Attendance sessions retrieved successfully");
export const getAttendanceSession = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Attendance session retrieved successfully", await operationsService.getAttendanceSession(Number(request.params.id)));
});
export const createAttendanceSession = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Attendance session created successfully", await operationsService.createAttendanceSession(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateAttendanceSessionRecords = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Attendance session records updated successfully", await operationsService.updateAttendanceRecords(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateAttendanceRecord = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Attendance record updated successfully", await operationsService.updateAttendanceRecord(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteAttendanceSession = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteAttendanceSession(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Attendance session deleted successfully", {});
});
export const getAttendanceByClassroom = listResponder(operationsService.getAttendanceByClassroom, "Classroom attendance retrieved successfully", (request) => [Number(request.params.classroomId)] as never[]);
export const getAttendanceByStudent = listResponder(operationsService.getAttendanceByStudent, "Student attendance retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);

export const listStaffAttendance = listResponder(() => operationsService.listStaffAttendance(), "Staff attendance retrieved successfully");
export const createStaffAttendance = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Staff attendance created successfully", await operationsService.createStaffAttendance(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateStaffAttendance = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Staff attendance updated successfully", await operationsService.updateStaffAttendance(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteStaffAttendance = asyncHandler(async (request: Request, response: Response) => {
  await operationsService.deleteStaffAttendance(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Staff attendance deleted successfully", {});
});
export const getStaffAttendanceSummary = listResponder(() => operationsService.getStaffAttendanceSummary(), "Staff attendance summary retrieved successfully");
