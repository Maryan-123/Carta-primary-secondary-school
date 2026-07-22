import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { authService } from "./auth.service";

export const login = asyncHandler(async (request: Request, response: Response) => {
  const data = await authService.login(
    request.body.username,
    request.body.password,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Login successful", data);
});

export const refreshToken = asyncHandler(async (request: Request, response: Response) => {
  const data = await authService.refreshToken(request.body.refreshToken);
  sendSuccess(response, 200, "Token refreshed successfully", data);
});

export const me = asyncHandler(async (request: Request, response: Response) => {
  const data = await authService.getMe(request.user!.userId);
  sendSuccess(response, 200, "Authenticated user retrieved successfully", data);
});

export const logout = asyncHandler(async (request: Request, response: Response) => {
  await authService.logout(request.user!.userId, request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Logout successful", {});
});

export const changePassword = asyncHandler(async (request: Request, response: Response) => {
  await authService.changePassword(
    request.user!.userId,
    request.body.currentPassword,
    request.body.newPassword,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "Password changed successfully", {});
});

export const resetUserPassword = asyncHandler(async (request: Request, response: Response) => {
  await authService.resetUserPassword(
    request.user!.userId,
    Number(request.params.id),
    request.body.newPassword,
    request.requestMeta?.ipAddress ?? null
  );
  sendSuccess(response, 200, "User password reset successfully", {});
});
