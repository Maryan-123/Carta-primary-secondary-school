import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions, authorizeRolesOrPermissions } from "../../middleware/authorize";
import {
  authorizeStudentSelfOrLinkedParent,
  authorizeTeacherAssignedAssignment,
  authorizeTeacherAssignedClassroomParam,
  authorizeTeacherAssignedExamSubject
} from "../../middleware/role-scope";
import { validate } from "../../middleware/validate";
import {
  createAssignment,
  createAssignmentSubmission,
  createBulkResults,
  createExam,
  createExamSubject,
  createExamType,
  createGradingScale,
  deleteAssignment,
  deleteExam,
  deleteExamSubject,
  deleteExamType,
  deleteGradingScale,
  deleteResult,
  generateClassReportCards,
  generateReportCard,
  getAssignment,
  getAssignmentSubmissions,
  getExam,
  getReportCard,
  getReportCardsByClassroom,
  getReportCardsByStudent,
  getResultsByClassroom,
  getResultsByExam,
  getResultsByExamSubject,
  getResultsByStudent,
  gradeAssignmentSubmission,
  listAssignments,
  listExamSubjects,
  listExamTypes,
  listExams,
  listGradingScales,
  listReportCards,
  listResults,
  publishReportCard,
  updateAssignment,
  updateExam,
  updateExamStatus,
  updateExamSubject,
  updateExamType,
  updateGradingScale,
  updateReportCard,
  updateResult
} from "./assessment.controller";
import {
  assignmentSchema,
  assignmentSubmissionSchema,
  bulkResultsSchema,
  examSchema,
  examSubjectSchema,
  examTypeSchema,
  gradingScaleSchema,
  reportCardGenerateClassSchema,
  reportCardGenerateSchema,
  reportCardUpdateSchema,
  submissionGradeSchema
} from "./assessment.validator";

const router = Router();

router.use(authenticate);

router.get("/assignments", authorizeRolesOrPermissions(["TEACHER", "STUDENT"], ["assignments.manage"]), listAssignments);
router.get("/assignments/:id", authorizeRolesOrPermissions(["TEACHER", "STUDENT"], ["assignments.manage"]), getAssignment);
router.post("/assignments", authorizeRolesOrPermissions(["TEACHER"], ["assignments.manage"]), validate(assignmentSchema), createAssignment);
router.patch("/assignments/:id", authorizePermissions("assignments.manage"), validate(assignmentSchema.partial()), updateAssignment);
router.delete("/assignments/:id", authorizePermissions("assignments.manage"), deleteAssignment);
router.get("/assignments/:id/submissions", authorizeRolesOrPermissions(["TEACHER"], ["assignments.manage"]), authorizeTeacherAssignedAssignment(), getAssignmentSubmissions);
router.post("/assignments/:id/submissions", authorizeRolesOrPermissions(["STUDENT"], ["students.view"]), validate(assignmentSubmissionSchema), createAssignmentSubmission);
router.patch("/assignment-submissions/:id/grade", authorizeRolesOrPermissions(["TEACHER"], ["assignments.manage"]), validate(submissionGradeSchema), gradeAssignmentSubmission);

router.get("/exam-types", authorizePermissions("exams.manage"), listExamTypes);
router.post("/exam-types", authorizePermissions("exams.manage"), validate(examTypeSchema), createExamType);
router.patch("/exam-types/:id", authorizePermissions("exams.manage"), validate(examTypeSchema.partial()), updateExamType);
router.delete("/exam-types/:id", authorizePermissions("exams.manage"), deleteExamType);

router.get("/exams", authorizePermissions("exams.manage"), listExams);
router.get("/exams/:id", authorizePermissions("exams.manage"), getExam);
router.post("/exams", authorizePermissions("exams.manage"), validate(examSchema), createExam);
router.patch("/exams/:id", authorizePermissions("exams.manage"), validate(examSchema.partial()), updateExam);
router.patch("/exams/:id/status", authorizePermissions("exams.manage"), validate(examSchema.pick({ status: true })), updateExamStatus);
router.delete("/exams/:id", authorizePermissions("exams.manage"), deleteExam);

router.get("/exam-subjects", authorizePermissions("exams.manage"), listExamSubjects);
router.post("/exam-subjects", authorizePermissions("exams.manage"), validate(examSubjectSchema), createExamSubject);
router.patch("/exam-subjects/:id", authorizePermissions("exams.manage"), validate(examSubjectSchema.partial()), updateExamSubject);
router.delete("/exam-subjects/:id", authorizePermissions("exams.manage"), deleteExamSubject);

router.get("/results", authorizePermissions("results.enter"), listResults);
router.post(
  "/results/bulk",
  authorizeRolesOrPermissions(["TEACHER"], ["results.enter"]),
  authorizeTeacherAssignedExamSubject(),
  validate(bulkResultsSchema),
  createBulkResults
);
router.patch("/results/:id", authorizePermissions("results.enter"), updateResult);
router.delete("/results/:id", authorizePermissions("results.enter"), deleteResult);
router.get("/results/student/:studentId", authorizeRolesOrPermissions(["TEACHER", "STUDENT", "PARENT"], ["results.enter"]), authorizeStudentSelfOrLinkedParent(), getResultsByStudent);
router.get("/results/classroom/:classroomId", authorizeRolesOrPermissions(["TEACHER"], ["results.enter"]), authorizeTeacherAssignedClassroomParam(), getResultsByClassroom);
router.get("/results/exam/:examId", authorizePermissions("results.enter"), getResultsByExam);
router.get("/results/exam-subject/:examSubjectId", authorizeRolesOrPermissions(["TEACHER"], ["results.enter"]), authorizeTeacherAssignedExamSubject(), getResultsByExamSubject);

router.get("/grading-scales", authorizePermissions("results.publish"), listGradingScales);
router.post("/grading-scales", authorizePermissions("results.publish"), validate(gradingScaleSchema), createGradingScale);
router.patch("/grading-scales/:id", authorizePermissions("results.publish"), validate(gradingScaleSchema.partial()), updateGradingScale);
router.delete("/grading-scales/:id", authorizePermissions("results.publish"), deleteGradingScale);

router.get("/report-cards", authorizePermissions("results.publish"), listReportCards);
router.get("/report-cards/:id", authorizePermissions("results.publish"), getReportCard);
router.post("/report-cards/generate", authorizePermissions("results.publish"), validate(reportCardGenerateSchema), generateReportCard);
router.post("/report-cards/generate-class", authorizePermissions("results.publish"), validate(reportCardGenerateClassSchema), generateClassReportCards);
router.patch("/report-cards/:id", authorizePermissions("results.publish"), validate(reportCardUpdateSchema), updateReportCard);
router.post("/report-cards/:id/publish", authorizePermissions("results.publish"), publishReportCard);
router.get("/report-cards/student/:studentId", authorizeRolesOrPermissions(["TEACHER", "STUDENT", "PARENT"], ["results.publish"]), authorizeStudentSelfOrLinkedParent(), getReportCardsByStudent);
router.get("/report-cards/classroom/:classroomId", authorizeRolesOrPermissions(["TEACHER"], ["results.publish"]), authorizeTeacherAssignedClassroomParam(), getReportCardsByClassroom);

export { router as assessmentRoutes };
