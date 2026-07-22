import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  getRole,
  getRolePermissions,
  listPermissions,
  listPermissionsGrouped,
  listRoles,
  replaceRolePermissions
} from "./access.controller";
import { replaceRolePermissionsSchema } from "./access.validator";

const router = Router();

router.use(authenticate);
router.get("/roles", authorizePermissions("users.manage"), listRoles);
router.get("/roles/:id", authorizePermissions("users.manage"), getRole);
router.get("/roles/:id/permissions", authorizePermissions("users.manage"), getRolePermissions);
router.post("/roles/:id/permissions", authorizePermissions("users.manage"), validate(replaceRolePermissionsSchema), replaceRolePermissions);
router.get("/permissions", authorizePermissions("users.manage"), listPermissions);
router.get("/permissions/grouped", authorizePermissions("users.manage"), listPermissionsGrouped);

export { router as accessRoutes };
