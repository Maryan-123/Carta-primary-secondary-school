import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { accessService } from "./access.service";

export const listRoles = asyncHandler(async (_request: Request, response: Response) => {
  const data = await accessService.listRoles();
  sendSuccess(response, 200, "Roles retrieved successfully", data);
});

export const getRole = asyncHandler(async (request: Request, response: Response) => {
  const data = await accessService.getRole(Number(request.params.id));
  sendSuccess(response, 200, "Role retrieved successfully", data);
});

export const listPermissions = asyncHandler(async (_request: Request, response: Response) => {
  const data = await accessService.listPermissions();
  sendSuccess(response, 200, "Permissions retrieved successfully", data);
});

export const listPermissionsGrouped = asyncHandler(async (_request: Request, response: Response) => {
  const data = await accessService.listPermissionsGrouped();
  sendSuccess(response, 200, "Grouped permissions retrieved successfully", data);
});

export const getRolePermissions = asyncHandler(async (request: Request, response: Response) => {
  const data = await accessService.getRolePermissions(Number(request.params.id));
  sendSuccess(response, 200, "Role permissions retrieved successfully", data);
});

export const replaceRolePermissions = asyncHandler(async (request: Request, response: Response) => {
  const data = await accessService.replaceRolePermissions(
    request.user!.userId,
    Number(request.params.id),
    request.body.permissionIds,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Role permissions updated successfully", data);
});
