import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { assessmentService } from "./assessment.service";

const listResponder =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    sendSuccess(response, 200, message, await method(...args));
  });

export const listAssignments = listResponder(() => assessmentService.listAssignments(), "Assignments retrieved successfully");
export const getAssignment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Assignment retrieved successfully", await assessmentService.getAssignment(Number(request.params.id)));
});
export const createAssignment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Assignment created successfully", await assessmentService.createAssignment(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateAssignment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Assignment updated successfully", await assessmentService.updateAssignment(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteAssignment = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteAssignment(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Assignment deleted successfully", {});
});
export const getAssignmentSubmissions = listResponder(assessmentService.getAssignmentSubmissions, "Assignment submissions retrieved successfully", (request) => [Number(request.params.id)] as never[]);
export const createAssignmentSubmission = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Assignment submission recorded successfully", await assessmentService.createAssignmentSubmission(request.user!.userId, Number(request.params.id), Number(request.body.studentId ?? request.user!.userId), request.body, request.requestMeta?.ipAddress ?? null));
});
export const gradeAssignmentSubmission = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Assignment submission graded successfully", await assessmentService.gradeAssignmentSubmission(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});

export const listExamTypes = listResponder(() => assessmentService.listExamTypes(), "Exam types retrieved successfully");
export const createExamType = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Exam type created successfully", await assessmentService.createExamType(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateExamType = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Exam type updated successfully", await assessmentService.updateExamType(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteExamType = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteExamType(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Exam type deleted successfully", {});
});

export const listExams = listResponder(() => assessmentService.listExams(), "Exams retrieved successfully");
export const getExam = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Exam retrieved successfully", await assessmentService.getExam(Number(request.params.id)));
});
export const createExam = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Exam created successfully", await assessmentService.createExam(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateExam = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Exam updated successfully", await assessmentService.updateExam(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateExamStatus = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Exam status updated successfully", await assessmentService.updateExamStatus(request.user!.userId, Number(request.params.id), request.body.status, request.requestMeta?.ipAddress ?? null));
});
export const deleteExam = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteExam(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Exam deleted successfully", {});
});

export const listExamSubjects = listResponder(() => assessmentService.listExamSubjects(), "Exam subjects retrieved successfully");
export const createExamSubject = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Exam subject created successfully", await assessmentService.createExamSubject(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateExamSubject = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Exam subject updated successfully", await assessmentService.updateExamSubject(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteExamSubject = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteExamSubject(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Exam subject deleted successfully", {});
});

export const listResults = listResponder(() => assessmentService.listResults(), "Results retrieved successfully");
export const createBulkResults = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Results recorded successfully", await assessmentService.createBulkResults(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateResult = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Result updated successfully", await assessmentService.updateResult(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteResult = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteResult(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Result deleted successfully", {});
});
export const getResultsByStudent = listResponder(assessmentService.getResultsByStudent, "Student results retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);
export const getResultsByClassroom = listResponder(assessmentService.getResultsByClassroom, "Classroom results retrieved successfully", (request) => [Number(request.params.classroomId)] as never[]);
export const getResultsByExam = listResponder(assessmentService.getResultsByExam, "Exam results retrieved successfully", (request) => [Number(request.params.examId)] as never[]);
export const getResultsByExamSubject = listResponder(assessmentService.getResultsByExamSubject, "Exam subject results retrieved successfully", (request) => [Number(request.params.examSubjectId)] as never[]);

export const listGradingScales = listResponder(() => assessmentService.listGradingScales(), "Grading scales retrieved successfully");
export const createGradingScale = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Grading scale created successfully", await assessmentService.createGradingScale(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateGradingScale = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Grading scale updated successfully", await assessmentService.updateGradingScale(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteGradingScale = asyncHandler(async (request: Request, response: Response) => {
  await assessmentService.deleteGradingScale(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Grading scale deleted successfully", {});
});

export const listReportCards = listResponder(() => assessmentService.listReportCards(), "Report cards retrieved successfully");
export const getReportCard = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Report card retrieved successfully", await assessmentService.getReportCard(Number(request.params.id)));
});
export const generateReportCard = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Report card generated successfully", await assessmentService.generateReportCard(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const generateClassReportCards = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Class report cards generated successfully", await assessmentService.generateClassReportCards(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateReportCard = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Report card updated successfully", await assessmentService.updateReportCard(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const publishReportCard = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Report card published successfully", await assessmentService.publishReportCard(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null));
});
export const getReportCardsByStudent = listResponder(assessmentService.getReportCardsByStudent, "Student report cards retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);
export const getReportCardsByClassroom = listResponder(assessmentService.getReportCardsByClassroom, "Classroom report cards retrieved successfully", (request) => [Number(request.params.classroomId)] as never[]);
