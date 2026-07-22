import { z } from "zod";
import { createUserPasswordSchema, passwordSchema } from "../../utils/password";

const optionalTrimmed = z.string().trim().min(1).optional();

export const createUserSchema = z.object({
  roleId: z.number().int().positive(),
  username: z.string().trim().min(3).max(50),
  password: createUserPasswordSchema,
  firstName: z.string().trim().min(1),
  middleName: z.string().trim().optional(),
  lastName: z.string().trim().min(1),
  phone: optionalTrimmed,
  email: z.email().optional(),
  profilePhoto: optionalTrimmed,
  isActive: z.boolean().optional(),
  mustChangePassword: z.boolean().optional()
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export const updateUserStatusSchema = z.object({
  isActive: z.boolean()
});

export const resetUserPasswordSchema = z.object({
  newPassword: passwordSchema
});
