import { NextFunction, Request, Response } from "express";
import { AuthorizationError } from "../utils/errors";

export const authorizeRoles =
  (...roles: string[]) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new AuthorizationError("Authentication required"));
      return;
    }

    if (request.user.role === "ADMINISTRATOR" || roles.includes(request.user.role)) {
      next();
      return;
    }

    next(new AuthorizationError("Role does not have access to this resource"));
  };

export const authorizePermissions =
  (...permissions: string[]) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new AuthorizationError("Authentication required"));
      return;
    }

    if (request.user.role === "ADMINISTRATOR") {
      next();
      return;
    }

    const hasAll = permissions.every((permission) => request.user?.permissions.includes(permission));
    if (!hasAll) {
      next(new AuthorizationError("Permission denied"));
      return;
    }

    next();
  };

export const authorizeRolesOrPermissions =
  (roles: string[], permissions: string[]) =>
  (request: Request, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new AuthorizationError("Authentication required"));
      return;
    }

    if (request.user.role === "ADMINISTRATOR") {
      next();
      return;
    }

    if (roles.includes(request.user.role)) {
      next();
      return;
    }

    const hasAll = permissions.every((permission) => request.user?.permissions.includes(permission));
    if (!hasAll) {
      next(new AuthorizationError("Permission denied"));
      return;
    }

    next();
  };
