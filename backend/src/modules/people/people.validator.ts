import { z } from "zod";

export const parentSchema = z.object({
  userId: z.number().int().positive().optional(),
  parentNumber: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  phone: z.string().trim().min(1),
  alternativePhone: z.string().trim().optional(),
  email: z.email().optional(),
  occupation: z.string().trim().optional(),
  address: z.string().trim().optional(),
  isActive: z.boolean().optional()
});

export const studentSchema = z.object({
  userId: z.number().int().positive().optional(),
  admissionNumber: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.iso.date(),
  placeOfBirth: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  admissionDate: z.iso.date(),
  previousSchool: z.string().trim().optional(),
  bloodGroup: z.string().trim().optional(),
  medicalNotes: z.string().trim().optional(),
  profilePhoto: z.string().trim().optional(),
  studentStatus: z.enum(["ACTIVE", "GRADUATED", "TRANSFERRED", "SUSPENDED", "WITHDRAWN"]).optional()
});

export const studentParentSchema = z.object({
  parentId: z.number().int().positive(),
  relationship: z.enum(["FATHER", "MOTHER", "BROTHER", "SISTER", "UNCLE", "AUNT", "GRANDFATHER", "GRANDMOTHER", "GUARDIAN", "OTHER"]),
  isPrimaryContact: z.boolean().optional(),
  canPickStudent: z.boolean().optional(),
  livesWithStudent: z.boolean().optional()
});

export const enrollmentSchema = z.object({
  studentId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  rollNumber: z.string().trim().optional(),
  enrollmentDate: z.iso.date(),
  enrollmentStatus: z.enum(["ACTIVE", "COMPLETED", "TRANSFERRED", "WITHDRAWN"]).optional()
});
