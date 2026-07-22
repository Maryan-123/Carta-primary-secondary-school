import { z } from "zod";

export const feeTypeSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional()
});

export const feeStructureSchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  feeTypeId: z.number().int().positive(),
  amount: z.number().min(0),
  dueDate: z.iso.date().optional()
});

export const invoiceSchema = z.object({
  studentId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  invoiceDate: z.iso.date(),
  dueDate: z.iso.date().optional(),
  discountAmount: z.number().min(0).optional(),
  items: z
    .array(
      z.object({
        feeTypeId: z.number().int().positive(),
        description: z.string().trim().optional(),
        amount: z.number().min(0),
        discountAmount: z.number().min(0).optional()
      })
    )
    .min(1)
});

export const paymentSchema = z.object({
  invoiceId: z.number().int().positive(),
  studentId: z.number().int().positive(),
  paymentDate: z.iso.date(),
  amount: z.number().positive(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CHEQUE"]),
  referenceNumber: z.string().trim().optional(),
  notes: z.string().trim().optional()
});

export const expenseSchema = z.object({
  expenseCategory: z.string().trim().min(1),
  description: z.string().trim().min(1),
  amount: z.number().positive(),
  expenseDate: z.iso.date(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CHEQUE"]),
  referenceNumber: z.string().trim().optional()
});

export const incomeSchema = z.object({
  incomeCategory: z.string().trim().min(1),
  description: z.string().trim().min(1),
  amount: z.number().positive(),
  incomeDate: z.iso.date(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE_MONEY", "CHEQUE"]),
  referenceNumber: z.string().trim().optional()
});
