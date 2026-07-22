import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { campusService } from "./campus.service";

const listResponder =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    sendSuccess(response, 200, message, await method(...args));
  });

export const listBookCategories = listResponder(() => campusService.listBookCategories(), "Book categories retrieved successfully");
export const getBookCategory = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book category retrieved successfully", await campusService.getBookCategory(Number(request.params.id))));
export const createBookCategory = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Book category created successfully", await campusService.createBookCategory(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const updateBookCategory = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book category updated successfully", await campusService.updateBookCategory(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null)));
export const deleteBookCategory = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteBookCategory(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Book category deleted successfully", {}); });

export const listBooks = listResponder(() => campusService.listBooks(), "Books retrieved successfully");
export const getBook = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book retrieved successfully", await campusService.getBook(Number(request.params.id))));
export const createBook = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Book created successfully", await campusService.createBook(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const updateBook = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book updated successfully", await campusService.updateBook(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null)));
export const deleteBook = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteBook(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Book deleted successfully", {}); });

export const listBookLoans = listResponder(() => campusService.listBookLoans(), "Book loans retrieved successfully");
export const getBookLoan = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book loan retrieved successfully", await campusService.getBookLoan(Number(request.params.id))));
export const borrowBook = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Book borrowed successfully", await campusService.borrowBook(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const returnBook = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book returned successfully", await campusService.returnBook(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null)));
export const markLoanLost = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Book loan marked as lost", await campusService.markLoanLost(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null)));
export const deleteBookLoan = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteBookLoan(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Book loan deleted successfully", {}); });
export const getOverdueBookLoans = listResponder(() => campusService.getOverdueBookLoans(), "Overdue book loans retrieved successfully");

export const listAnnouncements = listResponder(() => campusService.listAnnouncements(), "Announcements retrieved successfully");
export const getAnnouncement = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Announcement retrieved successfully", await campusService.getAnnouncement(Number(request.params.id))));
export const createAnnouncement = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Announcement created successfully", await campusService.createAnnouncement(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const updateAnnouncement = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Announcement updated successfully", await campusService.updateAnnouncement(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null)));
export const deleteAnnouncement = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteAnnouncement(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Announcement deleted successfully", {}); });

export const listNotifications = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Notifications retrieved successfully", await campusService.listNotifications(request.user!.userId)));
export const getUnreadNotificationCount = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Unread notification count retrieved successfully", await campusService.getUnreadNotificationCount(request.user!.userId)));
export const markNotificationRead = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Notification marked as read", await campusService.markNotificationRead(request.user!.userId, Number(request.params.id))));
export const markAllNotificationsRead = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "All notifications marked as read", await campusService.markAllNotificationsRead(request.user!.userId)));
export const deleteNotification = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteNotification(request.user!.userId, Number(request.params.id)); sendSuccess(response, 200, "Notification deleted successfully", {}); });

export const listEvents = listResponder(() => campusService.listEvents(), "Events retrieved successfully");
export const getEvent = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Event retrieved successfully", await campusService.getEvent(Number(request.params.id))));
export const createEvent = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Event created successfully", await campusService.createEvent(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const updateEvent = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Event updated successfully", await campusService.updateEvent(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null)));
export const deleteEvent = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteEvent(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Event deleted successfully", {}); });

export const listDiscipline = listResponder(() => campusService.listDiscipline(), "Discipline incidents retrieved successfully");
export const getDisciplineIncident = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Discipline incident retrieved successfully", await campusService.getDisciplineIncident(Number(request.params.id))));
export const createDisciplineIncident = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Discipline incident created successfully", await campusService.createDisciplineIncident(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null)));
export const updateDisciplineIncident = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Discipline incident updated successfully", await campusService.updateDisciplineIncident(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null)));
export const deleteDisciplineIncident = asyncHandler(async (request: Request, response: Response) => { await campusService.deleteDisciplineIncident(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null); sendSuccess(response, 200, "Discipline incident deleted successfully", {}); });
export const getStudentDiscipline = listResponder(campusService.getStudentDiscipline, "Student discipline records retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);

export const listAuditLogs = listResponder(() => campusService.listAuditLogs(), "Audit logs retrieved successfully");
export const getAuditLog = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Audit log retrieved successfully", await campusService.getAuditLog(Number(request.params.id))));

export const listBackups = listResponder(() => campusService.listBackups(), "Backup records retrieved successfully");
export const getBackup = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 200, "Backup record retrieved successfully", await campusService.getBackup(Number(request.params.id))));
export const createBackup = asyncHandler(async (request: Request, response: Response) => sendSuccess(response, 201, "Backup created successfully", await campusService.createBackup(request.user!.userId, request.requestMeta?.ipAddress ?? null)));
