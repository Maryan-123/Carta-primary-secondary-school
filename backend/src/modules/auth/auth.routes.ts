import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions, authorizeRoles } from "../../middleware/authorize";
import { loginRateLimit } from "../../middleware/rate-limit";
import { validate } from "../../middleware/validate";
import {
  changePassword,
  login,
  logout,
  me,
  refreshToken,
  resetUserPassword
} from "./auth.controller";
import { changePasswordSchema, loginSchema, refreshTokenSchema, resetPasswordSchema } from "./auth.validator";

const router = Router();

router.post("/login", loginRateLimit, validate(loginSchema), login);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, me);
router.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);
router.post(
  "/reset-user-password/:id",
  authenticate,
  authorizeRoles("ADMINISTRATOR", "PRINCIPAL"),
  authorizePermissions("users.manage"),
  validate(resetPasswordSchema),
  resetUserPassword
);

export { router as authRoutes };
