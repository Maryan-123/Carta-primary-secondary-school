import { z } from "zod";
import { passwordSchema } from "../../utils/password";

export const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema
});

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema
});
