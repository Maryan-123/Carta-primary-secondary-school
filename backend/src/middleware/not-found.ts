import { Request, Response } from "express";
import { sendError } from "../utils/api-response";

export const notFoundHandler = (_request: Request, response: Response): void => {
  sendError(response, 404, "Route not found");
};
