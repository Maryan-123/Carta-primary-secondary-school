import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  addStudentParent,
  createEnrollment,
  createParent,
  createStudent,
  deleteEnrollment,
  deleteParent,
  deleteStudent,
  getEnrollment,
  getParent,
  getParentChildren,
  getStudent,
  getStudentParents,
  listEnrollments,
  listParents,
  listStudents,
  removeStudentParent,
  updateEnrollment,
  updateParent,
  updateStudent
} from "./people.controller";
import { enrollmentSchema, parentSchema, studentParentSchema, studentSchema } from "./people.validator";

const router = Router();

router.use(authenticate);

router.get("/parents", authorizePermissions("students.view"), listParents);
router.get("/parents/:id", authorizePermissions("students.view"), getParent);
router.post("/parents", authorizePermissions("students.create"), validate(parentSchema), createParent);
router.patch("/parents/:id", authorizePermissions("students.update"), validate(parentSchema.partial()), updateParent);
router.delete("/parents/:id", authorizePermissions("students.update"), deleteParent);
router.get("/parents/:id/children", authorizePermissions("students.view"), getParentChildren);

router.get("/students", authorizePermissions("students.view"), listStudents);
router.get("/students/:id", authorizePermissions("students.view"), getStudent);
router.get("/students/:id/profile", authorizePermissions("students.view"), getStudent);
router.post("/students", authorizePermissions("students.create"), validate(studentSchema), createStudent);
router.patch("/students/:id", authorizePermissions("students.update"), validate(studentSchema.partial()), updateStudent);
router.patch("/students/:id/status", authorizePermissions("students.update"), validate(studentSchema.pick({ studentStatus: true })), updateStudent);
router.delete("/students/:id", authorizePermissions("students.update"), deleteStudent);
router.get("/students/:studentId/parents", authorizePermissions("students.view"), getStudentParents);
router.post("/students/:studentId/parents", authorizePermissions("students.update"), validate(studentParentSchema), addStudentParent);
router.delete("/students/:studentId/parents/:parentId", authorizePermissions("students.update"), removeStudentParent);

router.get("/enrollments", authorizePermissions("students.view"), listEnrollments);
router.get("/enrollments/:id", authorizePermissions("students.view"), getEnrollment);
router.post("/enrollments", authorizePermissions("students.create"), validate(enrollmentSchema), createEnrollment);
router.patch("/enrollments/:id", authorizePermissions("students.update"), validate(enrollmentSchema.partial()), updateEnrollment);
router.delete("/enrollments/:id", authorizePermissions("students.update"), deleteEnrollment);

export { router as peopleRoutes };
