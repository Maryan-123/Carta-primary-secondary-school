import { Response } from "express";

export const sendSuccess = <T>(
  response: Response,
  statusCode: number,
  message: string,
  data: T,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): void => {
  response.status(statusCode).json({
    success: true,
    message,
    data,
    ...(pagination ? { pagination } : {})
  });
};

export const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  errors: Array<{ field?: string; message: string }> = []
): void => {
  response.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
