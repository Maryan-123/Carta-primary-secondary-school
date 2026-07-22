import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { insightsService } from "./insights.service";

const responder =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    sendSuccess(response, 200, message, await method(...args));
  });

export const adminDashboard = responder(() => insightsService.adminDashboard(), "Administrator dashboard retrieved successfully");
export const teacherDashboard = responder(insightsService.teacherDashboard, "Teacher dashboard retrieved successfully", (request) => [request.user!.userId] as never[]);
export const accountantDashboard = responder(() => insightsService.accountantDashboard(), "Accountant dashboard retrieved successfully");
export const librarianDashboard = responder(() => insightsService.librarianDashboard(), "Librarian dashboard retrieved successfully");
export const studentDashboard = responder(insightsService.studentDashboard, "Student dashboard retrieved successfully", (request) => [request.user!.userId] as never[]);
export const parentDashboard = responder(insightsService.parentDashboard, "Parent dashboard retrieved successfully", (request) => [request.user!.userId] as never[]);

export const reportStudentEnrollment = responder(() => insightsService.reportStudentEnrollment(), "Student enrollment report retrieved successfully");
export const reportStudentAttendance = responder(() => insightsService.reportStudentAttendance(), "Student attendance report retrieved successfully");
export const reportStaffAttendance = responder(() => insightsService.reportStaffAttendance(), "Staff attendance report retrieved successfully");
export const reportExamPerformance = responder(() => insightsService.reportExamPerformance(), "Exam performance report retrieved successfully");
export const reportClassPerformance = responder(() => insightsService.reportClassPerformance(), "Class performance report retrieved successfully");
export const reportStudentPerformance = responder(() => insightsService.reportStudentPerformance(), "Student performance report retrieved successfully");
export const reportFeeCollection = responder(() => insightsService.reportFeeCollection(), "Fee collection report retrieved successfully");
export const reportOutstandingFees = responder(() => insightsService.reportOutstandingFees(), "Outstanding fees report retrieved successfully");
export const reportIncomeExpenses = responder(() => insightsService.reportIncomeExpenses(), "Income and expenses report retrieved successfully");
export const reportLibrary = responder(() => insightsService.reportLibrary(), "Library report retrieved successfully");
export const reportDiscipline = responder(() => insightsService.reportDiscipline(), "Discipline report retrieved successfully");
