import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { peopleService } from "./people.service";

const sendList =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    const data = await method(...args);
    sendSuccess(response, 200, message, data);
  });

export const listParents = sendList(() => peopleService.listParents(), "Parents retrieved successfully");
export const getParent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.getParent(Number(request.params.id));
  sendSuccess(response, 200, "Parent retrieved successfully", data);
});
export const createParent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.createParent(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 201, "Parent created successfully", data);
});
export const updateParent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.updateParent(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Parent updated successfully", data);
});
export const deleteParent = asyncHandler(async (request: Request, response: Response) => {
  await peopleService.deleteParent(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Parent deleted successfully", {});
});
export const getParentChildren = sendList(
  peopleService.getParentChildren,
  "Parent children retrieved successfully",
  (request) => [Number(request.params.id)] as never[]
);

export const listStudents = sendList(() => peopleService.listStudents(), "Students retrieved successfully");
export const getStudent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.getStudent(Number(request.params.id));
  sendSuccess(response, 200, "Student retrieved successfully", data);
});
export const createStudent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.createStudent(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 201, "Student created successfully", data);
});
export const updateStudent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.updateStudent(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Student updated successfully", data);
});
export const deleteStudent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.deleteStudent(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Student status updated successfully", data);
});
export const getStudentParents = sendList(
  peopleService.getStudentParents,
  "Student parents retrieved successfully",
  (request) => [Number(request.params.studentId ?? request.params.id)] as never[]
);
export const addStudentParent = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.addStudentParent(
    request.user!.userId,
    Number(request.params.studentId),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Student parent linked successfully", data);
});
export const removeStudentParent = asyncHandler(async (request: Request, response: Response) => {
  await peopleService.removeStudentParent(
    request.user!.userId,
    Number(request.params.studentId),
    Number(request.params.parentId),
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Student parent link removed successfully", {});
});

export const listEnrollments = sendList(() => peopleService.listEnrollments(), "Enrollments retrieved successfully");
export const getEnrollment = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.getEnrollment(Number(request.params.id));
  sendSuccess(response, 200, "Enrollment retrieved successfully", data);
});
export const createEnrollment = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.createEnrollment(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "Enrollment created successfully", data);
});
export const updateEnrollment = asyncHandler(async (request: Request, response: Response) => {
  const data = await peopleService.updateEnrollment(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Enrollment updated successfully", data);
});
export const deleteEnrollment = asyncHandler(async (request: Request, response: Response) => {
  await peopleService.deleteEnrollment(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Enrollment deleted successfully", {});
});
