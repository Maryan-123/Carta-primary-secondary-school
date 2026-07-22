import { NextFunction, Request, Response } from "express";
import { DatabaseError } from "pg";
import { ZodError } from "zod";
import { env } from "../config/env";
import { sendError } from "../utils/api-response";
import { AppError, ValidationAppError } from "../utils/errors";
import { formatZodError } from "./validate";

const uniqueConstraintFieldMap: Record<string, { field: string; message: string }> = {
  staff_employee_number_key: {
    field: "employeeNumber",
    message: "Employee number already exists"
  },
  teachers_teacher_number_key: {
    field: "teacherNumber",
    message: "Teacher number already exists"
  },
  students_admission_number_key: {
    field: "admissionNumber",
    message: "Admission number already exists"
  },
  parents_parent_number_key: {
    field: "parentNumber",
    message: "Parent number already exists"
  },
  users_username_key: {
    field: "username",
    message: "Username already exists"
  }
};

export const errorHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction
): void => {
  void _next;

  if (error instanceof DatabaseError) {
    const dbError = error;
    if (dbError.code === "23505") {
      const constraintMatch = dbError.constraint ? uniqueConstraintFieldMap[dbError.constraint] : undefined;
      sendError(
        response,
        409,
        constraintMatch?.message ?? "A record with the same unique value already exists",
        constraintMatch ? [{ field: constraintMatch.field, message: constraintMatch.message }] : []
      );
      return;
    }

    if (dbError.code === "23503") {
      sendError(response, 409, "This record is linked to other records");
      return;
    }

    if (dbError.code === "23514") {
      sendError(response, 400, "Database check constraint failed");
      return;
    }

    console.error("Database error", { message: dbError.message, code: dbError.code });
    sendError(response, 500, "Database operation failed");
    return;
  }

  if (error instanceof AppError) {
    sendError(response, error.statusCode, error.message, error.errors);
    return;
  }

  if (error instanceof ZodError) {
    sendError(response, 422, "Validation failed", formatZodError(error));
    return;
  }

  if (error instanceof Error) {
    console.error("Unhandled application error", error);
    sendError(response, 500, env.NODE_ENV === "production" ? "Unexpected server error" : error.message);
    return;
  }

  const fallback = new ValidationAppError("Unexpected server error");
  sendError(response, fallback.statusCode, fallback.message, fallback.errors);
};
