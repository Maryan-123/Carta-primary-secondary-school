import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  closeAcademicYear,
  closeTerm,
  createAcademicYear,
  createClassroom,
  createClassSubject,
  createGradeLevel,
  createSubject,
  createTerm,
  deleteAcademicYear,
  deleteClassroom,
  deleteClassSubject,
  deleteGradeLevel,
  deleteSubject,
  deleteTerm,
  getAcademicYear,
  getClassroom,
  getCurrentAcademicYear,
  getCurrentTerm,
  getGradeLevel,
  getSchoolSettings,
  getSubject,
  getTerm,
  listAcademicYears,
  listClassrooms,
  listClassSubjects,
  listGradeLevels,
  listSubjects,
  listTerms,
  setCurrentAcademicYear,
  setCurrentTerm,
  updateAcademicYear,
  updateClassroom,
  updateGradeLevel,
  updateSchoolSettings,
  updateSubject,
  updateTerm
} from "./academics.controller";
import {
  academicYearSchema,
  classSubjectSchema,
  classroomSchema,
  gradeLevelSchema,
  schoolSettingsUpdateSchema,
  subjectSchema,
  termSchema
} from "./academics.validator";

const router = Router();

router.get("/school-settings", authenticate, getSchoolSettings);
router.patch("/school-settings", authenticate, authorizePermissions("settings.manage"), validate(schoolSettingsUpdateSchema), updateSchoolSettings);

router.get("/academic-years", authenticate, listAcademicYears);
router.get("/academic-years/current", authenticate, getCurrentAcademicYear);
router.get("/academic-years/:id", authenticate, getAcademicYear);
router.post("/academic-years", authenticate, authorizePermissions("academics.manage"), validate(academicYearSchema), createAcademicYear);
router.patch("/academic-years/:id", authenticate, authorizePermissions("academics.manage"), validate(academicYearSchema.partial()), updateAcademicYear);
router.patch("/academic-years/:id/set-current", authenticate, authorizePermissions("academics.manage"), setCurrentAcademicYear);
router.patch("/academic-years/:id/close", authenticate, authorizePermissions("academics.manage"), closeAcademicYear);
router.delete("/academic-years/:id", authenticate, authorizePermissions("academics.manage"), deleteAcademicYear);

router.get("/terms", authenticate, listTerms);
router.get("/terms/current", authenticate, getCurrentTerm);
router.get("/terms/:id", authenticate, getTerm);
router.post("/terms", authenticate, authorizePermissions("academics.manage"), validate(termSchema), createTerm);
router.patch("/terms/:id", authenticate, authorizePermissions("academics.manage"), validate(termSchema.partial()), updateTerm);
router.patch("/terms/:id/set-current", authenticate, authorizePermissions("academics.manage"), setCurrentTerm);
router.patch("/terms/:id/close", authenticate, authorizePermissions("academics.manage"), closeTerm);
router.delete("/terms/:id", authenticate, authorizePermissions("academics.manage"), deleteTerm);

router.get("/grade-levels", authenticate, listGradeLevels);
router.get("/grade-levels/:id", authenticate, getGradeLevel);
router.post("/grade-levels", authenticate, authorizePermissions("academics.manage"), validate(gradeLevelSchema), createGradeLevel);
router.patch("/grade-levels/:id", authenticate, authorizePermissions("academics.manage"), validate(gradeLevelSchema.partial()), updateGradeLevel);
router.delete("/grade-levels/:id", authenticate, authorizePermissions("academics.manage"), deleteGradeLevel);

router.get("/classrooms", authenticate, listClassrooms);
router.get("/classrooms/:id", authenticate, getClassroom);
router.post("/classrooms", authenticate, authorizePermissions("academics.manage"), validate(classroomSchema), createClassroom);
router.patch("/classrooms/:id", authenticate, authorizePermissions("academics.manage"), validate(classroomSchema.partial()), updateClassroom);
router.delete("/classrooms/:id", authenticate, authorizePermissions("academics.manage"), deleteClassroom);

router.get("/subjects", authenticate, listSubjects);
router.get("/subjects/:id", authenticate, getSubject);
router.post("/subjects", authenticate, authorizePermissions("academics.manage"), validate(subjectSchema), createSubject);
router.patch("/subjects/:id", authenticate, authorizePermissions("academics.manage"), validate(subjectSchema.partial()), updateSubject);
router.delete("/subjects/:id", authenticate, authorizePermissions("academics.manage"), deleteSubject);

router.get("/class-subjects", authenticate, listClassSubjects);
router.post("/class-subjects", authenticate, authorizePermissions("academics.manage"), validate(classSubjectSchema), createClassSubject);
router.delete("/class-subjects/:id", authenticate, authorizePermissions("academics.manage"), deleteClassSubject);

export { router as academicsRoutes };
