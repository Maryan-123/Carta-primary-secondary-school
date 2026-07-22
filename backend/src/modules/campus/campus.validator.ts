import { z } from "zod";

export const bookCategorySchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional()
});

export const bookSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  isbn: z.string().trim().optional(),
  title: z.string().trim().min(1),
  author: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  publicationYear: z.number().int().min(1000).max(3000).optional(),
  totalCopies: z.number().int().min(0).optional(),
  availableCopies: z.number().int().min(0).optional(),
  shelfLocation: z.string().trim().optional()
});

export const bookLoanSchema = z.object({
  bookId: z.number().int().positive(),
  studentId: z.number().int().positive().optional(),
  staffId: z.number().int().positive().optional(),
  borrowedDate: z.iso.date(),
  dueDate: z.iso.date()
});

export const announcementSchema = z.object({
  title: z.string().trim().min(1),
  message: z.string().trim().min(1),
  audienceType: z.enum(["ALL", "TEACHERS", "STUDENTS", "PARENTS", "STAFF", "SPECIFIC_CLASS"]),
  classroomId: z.number().int().positive().optional(),
  expiryDate: z.iso.date().optional(),
  isActive: z.boolean().optional()
});

export const notificationReadSchema = z.object({
  isRead: z.boolean().optional()
});

export const eventSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  eventType: z.enum(["HOLIDAY", "MEETING", "EXAMINATION", "PARENT_MEETING", "SCHOOL_EVENT", "OTHER"]),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  startTime: z.string().trim().optional(),
  endTime: z.string().trim().optional(),
  location: z.string().trim().optional()
});

export const disciplineSchema = z.object({
  studentId: z.number().int().positive(),
  incidentDate: z.iso.date(),
  incidentType: z.string().trim().min(1),
  description: z.string().trim().min(1),
  actionTaken: z.string().trim().optional(),
  handledBy: z.number().int().positive().optional(),
  status: z.enum(["OPEN", "UNDER_REVIEW", "RESOLVED", "CLOSED"]).optional()
});
