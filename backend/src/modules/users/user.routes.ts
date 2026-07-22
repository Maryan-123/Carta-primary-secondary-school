import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { createUser, deleteUser, getUser, listUsers, updateUser, updateUserStatus } from "./user.controller";
import { createUserSchema, updateUserSchema, updateUserStatusSchema } from "./user.validator";

const router = Router();

router.use(authenticate, authorizePermissions("users.manage"));
router.get("/", listUsers);
router.get("/:id", getUser);
router.post("/", validate(createUserSchema), createUser);
router.patch("/:id", validate(updateUserSchema), updateUser);
router.patch("/:id/status", validate(updateUserStatusSchema), updateUserStatus);
router.delete("/:id", deleteUser);

export { router as userRoutes };
