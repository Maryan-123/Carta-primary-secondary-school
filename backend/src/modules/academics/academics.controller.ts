import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { academicsService } from "./academics.service";

export const getSchoolSettings = asyncHandler(async (_request: Request, response: Response) => {
  const data = await academicsService.getSchoolSettings();
  sendSuccess(response, 200, "School settings retrieved successfully", data);
});

export const updateSchoolSettings = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateSchoolSettings(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "School settings updated successfully", data);
});

const sendList =
  (method: () => Promise<unknown>, message: string) => asyncHandler(async (_request: Request, response: Response) => {
    const data = await method();
    sendSuccess(response, 200, message, data);
  });

export const listAcademicYears = sendList(() => academicsService.listAcademicYears(), "Academic years retrieved successfully");
export const getCurrentAcademicYear = sendList(
  () => academicsService.getCurrentAcademicYear(),
  "Current academic year retrieved successfully"
);
export const getAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.getAcademicYear(Number(request.params.id));
  sendSuccess(response, 200, "Academic year retrieved successfully", data);
});
export const createAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createAcademicYear(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "Academic year created successfully", data);
});
export const updateAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateAcademicYear(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Academic year updated successfully", data);
});
export const setCurrentAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.setCurrentAcademicYear(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Current academic year updated successfully", data);
});
export const closeAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.closeAcademicYear(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Academic year closed successfully", data);
});
export const deleteAcademicYear = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteAcademicYear(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Academic year deleted successfully", {});
});

export const listTerms = sendList(() => academicsService.listTerms(), "Terms retrieved successfully");
export const getCurrentTerm = sendList(() => academicsService.getCurrentTerm(), "Current term retrieved successfully");
export const getTerm = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.getTerm(Number(request.params.id));
  sendSuccess(response, 200, "Term retrieved successfully", data);
});
export const createTerm = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createTerm(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 201, "Term created successfully", data);
});
export const updateTerm = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateTerm(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Term updated successfully", data);
});
export const setCurrentTerm = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.setCurrentTerm(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Current term updated successfully", data);
});
export const closeTerm = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.closeTerm(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Term closed successfully", data);
});
export const deleteTerm = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteTerm(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Term deleted successfully", {});
});

export const listGradeLevels = sendList(() => academicsService.listGradeLevels(), "Grade levels retrieved successfully");
export const getGradeLevel = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.getGradeLevel(Number(request.params.id));
  sendSuccess(response, 200, "Grade level retrieved successfully", data);
});
export const createGradeLevel = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createGradeLevel(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "Grade level created successfully", data);
});
export const updateGradeLevel = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateGradeLevel(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Grade level updated successfully", data);
});
export const deleteGradeLevel = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteGradeLevel(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Grade level deleted successfully", {});
});

export const listClassrooms = sendList(() => academicsService.listClassrooms(), "Classrooms retrieved successfully");
export const getClassroom = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.getClassroom(Number(request.params.id));
  sendSuccess(response, 200, "Classroom retrieved successfully", data);
});
export const createClassroom = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createClassroom(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "Classroom created successfully", data);
});
export const updateClassroom = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateClassroom(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Classroom updated successfully", data);
});
export const deleteClassroom = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteClassroom(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Classroom deleted successfully", {});
});

export const listSubjects = sendList(() => academicsService.listSubjects(), "Subjects retrieved successfully");
export const getSubject = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.getSubject(Number(request.params.id));
  sendSuccess(response, 200, "Subject retrieved successfully", data);
});
export const createSubject = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createSubject(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 201, "Subject created successfully", data);
});
export const updateSubject = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.updateSubject(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Subject updated successfully", data);
});
export const deleteSubject = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteSubject(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Subject deleted successfully", {});
});

export const listClassSubjects = sendList(() => academicsService.listClassSubjects(), "Class subjects retrieved successfully");
export const createClassSubject = asyncHandler(async (request: Request, response: Response) => {
  const data = await academicsService.createClassSubject(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "Class subject created successfully", data);
});
export const deleteClassSubject = asyncHandler(async (request: Request, response: Response) => {
  await academicsService.deleteClassSubject(
    request.user!.userId,
    Number(request.params.id),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Class subject deleted successfully", {});
});
