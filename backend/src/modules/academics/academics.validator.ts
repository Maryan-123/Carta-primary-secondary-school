import { z } from "zod";

export const schoolSettingsUpdateSchema = z.object({
  schoolName: z.string().trim().min(1).optional(),
  schoolCode: z.string().trim().optional(),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.email().optional(),
  logoPath: z.string().trim().optional(),
  principalName: z.string().trim().optional(),
  currency: z.string().trim().min(1).optional(),
  timezone: z.string().trim().min(1).optional(),
  academicYearStartMonth: z.number().int().min(1).max(12).optional()
});

export const academicYearSchema = z.object({
  name: z.string().trim().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  isCurrent: z.boolean().optional(),
  status: z.enum(["ACTIVE", "CLOSED", "PLANNED"]).optional()
});

export const termSchema = z.object({
  academicYearId: z.number().int().positive(),
  name: z.string().trim().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  isCurrent: z.boolean().optional(),
  status: z.enum(["ACTIVE", "CLOSED", "PLANNED"]).optional()
});

export const gradeLevelSchema = z.object({
  name: z.string().trim().min(1),
  levelOrder: z.number().int().positive(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional()
});

export const classroomSchema = z.object({
  gradeLevelId: z.number().int().positive(),
  name: z.string().trim().min(1),
  sectionName: z.string().trim().optional(),
  capacity: z.number().int().positive(),
  roomName: z.string().trim().optional(),
  classTeacherId: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
});

export const subjectSchema = z.object({
  code: z.string().trim().min(1),
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  maximumMarks: z.number().positive(),
  passMarks: z.number().min(0),
  isActive: z.boolean().optional()
});

export const classSubjectSchema = z.object({
  classroomId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  isCompulsory: z.boolean().optional()
});
