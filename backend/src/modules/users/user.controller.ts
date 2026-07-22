import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { userService } from "./user.service";

export const listUsers = asyncHandler(async (_request: Request, response: Response) => {
  const data = await userService.listUsers();
  sendSuccess(response, 200, "Users retrieved successfully", data);
});

export const getUser = asyncHandler(async (request: Request, response: Response) => {
  const data = await userService.getUser(Number(request.params.id));
  sendSuccess(response, 200, "User retrieved successfully", data);
});

export const createUser = asyncHandler(async (request: Request, response: Response) => {
  const data = await userService.createUser(
    request.user!.userId,
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 201, "User created successfully", data);
});

export const updateUser = asyncHandler(async (request: Request, response: Response) => {
  const data = await userService.updateUser(
    request.user!.userId,
    Number(request.params.id),
    request.body,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "User updated successfully", data);
});

export const updateUserStatus = asyncHandler(async (request: Request, response: Response) => {
  const data = await userService.updateUserStatus(
    request.user!.userId,
    Number(request.params.id),
    request.body.isActive,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "User status updated successfully", data);
});

export const deleteUser = asyncHandler(async (request: Request, response: Response) => {
  await userService.deleteUser(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "User deactivated successfully", {});
});
