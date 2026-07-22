import { z } from "zod";

export const assignmentSchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  teacherId: z.number().int().positive(),
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  assignedDate: z.iso.date(),
  dueDate: z.iso.date(),
  maximumMarks: z.number().positive(),
  attachmentPath: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED", "CANCELLED"]).optional()
});

export const assignmentSubmissionSchema = z.object({
  studentId: z.number().int().positive().optional(),
  submissionText: z.string().trim().optional(),
  attachmentPath: z.string().trim().optional()
});

export const submissionGradeSchema = z.object({
  marksObtained: z.number().min(0).optional(),
  teacherFeedback: z.string().trim().optional(),
  submissionStatus: z.enum(["NOT_SUBMITTED", "SUBMITTED", "LATE", "GRADED", "RETURNED"]).optional()
});

export const examTypeSchema = z.object({
  name: z.string().trim().min(1),
  weightPercentage: z.number().min(0).max(100).optional(),
  description: z.string().trim().optional()
});

export const examSchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  examTypeId: z.number().int().positive(),
  name: z.string().trim().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  status: z.enum(["PLANNED", "ONGOING", "COMPLETED", "PUBLISHED", "CANCELLED"]).optional()
});

export const examSubjectSchema = z.object({
  examId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  subjectId: z.number().int().positive(),
  examDate: z.iso.date(),
  startTime: z.string().trim().optional(),
  endTime: z.string().trim().optional(),
  maximumMarks: z.number().positive(),
  passMarks: z.number().min(0)
});

export const bulkResultsSchema = z.object({
  examSubjectId: z.number().int().positive(),
  results: z
    .array(
      z.object({
        studentId: z.number().int().positive(),
        marksObtained: z.number().min(0).optional().nullable(),
        remarks: z.string().trim().optional(),
        isAbsent: z.boolean().optional()
      })
    )
    .min(1)
});

export const gradingScaleSchema = z.object({
  gradeName: z.string().trim().min(1),
  minimumPercentage: z.number().min(0).max(100),
  maximumPercentage: z.number().min(0).max(100),
  gradePoint: z.number().min(0).optional(),
  remarks: z.string().trim().optional()
});

export const reportCardGenerateSchema = z.object({
  studentId: z.number().int().positive(),
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive(),
  teacherComment: z.string().trim().optional(),
  principalComment: z.string().trim().optional()
});

export const reportCardGenerateClassSchema = z.object({
  academicYearId: z.number().int().positive(),
  termId: z.number().int().positive(),
  classroomId: z.number().int().positive()
});

export const reportCardUpdateSchema = z.object({
  teacherComment: z.string().trim().optional(),
  principalComment: z.string().trim().optional(),
  attendanceSummary: z.string().trim().optional()
});
