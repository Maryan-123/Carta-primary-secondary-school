import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";
import { sendError } from "../utils/api-response";

type SchemaSource = "body" | "params" | "query";

export const validate =
  (schema: ZodType, source: SchemaSource = "body") =>
  (request: Request, response: Response, next: NextFunction): void => {
    const result = schema.safeParse(request[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }));
      sendError(response, 422, "Validation failed", errors);
      return;
    }

    request[source] = result.data;
    next();
  };

export const formatZodError = (error: ZodError): Array<{ field?: string; message: string }> =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message
  }));
