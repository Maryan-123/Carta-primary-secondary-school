import { NextFunction, Request, Response } from "express";

export const requestContext = (request: Request, _response: Response, next: NextFunction): void => {
  request.requestMeta = {
    ipAddress: request.ip ?? null
  };
  next();
};
