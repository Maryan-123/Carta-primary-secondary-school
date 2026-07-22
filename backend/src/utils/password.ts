import bcrypt from "bcrypt";
import { z } from "zod";
import { env } from "../config/env";
import { ValidationAppError } from "./errors";

export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const temporaryPasswordSchema = z
  .string()
  .regex(/^\d{4}$/, "Temporary password must be exactly 4 digits");

export const createUserPasswordSchema = z.union([passwordSchema, temporaryPasswordSchema]);

export const assertPasswordStrength = (password: string): void => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    throw new ValidationAppError(
      "Password validation failed",
      result.error.issues.map((issue) => ({ field: "password", message: issue.message }))
    );
  }
};

export const assertCreateUserPasswordStrength = (password: string): void => {
  const result = createUserPasswordSchema.safeParse(password);
  if (!result.success) {
    throw new ValidationAppError(
      "Password validation failed",
      result.error.issues.map((issue) => ({ field: "password", message: issue.message }))
    );
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  assertPasswordStrength(password);
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

export const hashCreateUserPassword = async (password: string): Promise<string> => {
  assertCreateUserPasswordStrength(password);
  return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> =>
  bcrypt.compare(password, hash);
