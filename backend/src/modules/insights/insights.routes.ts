import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions, authorizeRoles } from "../../middleware/authorize";
import {
  accountantDashboard,
  adminDashboard,
  librarianDashboard,
  parentDashboard,
  reportClassPerformance,
  reportDiscipline,
  reportExamPerformance,
  reportFeeCollection,
  reportIncomeExpenses,
  reportLibrary,
  reportOutstandingFees,
  reportStaffAttendance,
  reportStudentAttendance,
  reportStudentEnrollment,
  reportStudentPerformance,
  studentDashboard,
  teacherDashboard
} from "./insights.controller";

const router = Router();

router.use(authenticate);

router.get("/dashboard/admin", authorizeRoles("ADMINISTRATOR"), adminDashboard);
router.get("/dashboard/principal", authorizeRoles("PRINCIPAL", "ADMINISTRATOR"), adminDashboard);
router.get("/dashboard/teacher", authorizeRoles("TEACHER", "ADMINISTRATOR"), teacherDashboard);
router.get("/dashboard/accountant", authorizeRoles("ACCOUNTANT", "ADMINISTRATOR"), accountantDashboard);
router.get("/dashboard/librarian", authorizeRoles("LIBRARIAN", "ADMINISTRATOR"), librarianDashboard);
router.get("/dashboard/student", authorizeRoles("STUDENT", "ADMINISTRATOR"), studentDashboard);
router.get("/dashboard/parent", authorizeRoles("PARENT", "ADMINISTRATOR"), parentDashboard);

router.get("/reports/student-enrollment", authorizePermissions("reports.view"), reportStudentEnrollment);
router.get("/reports/student-attendance", authorizePermissions("reports.view"), reportStudentAttendance);
router.get("/reports/staff-attendance", authorizePermissions("reports.view"), reportStaffAttendance);
router.get("/reports/exam-performance", authorizePermissions("reports.view"), reportExamPerformance);
router.get("/reports/class-performance", authorizePermissions("reports.view"), reportClassPerformance);
router.get("/reports/student-performance", authorizePermissions("reports.view"), reportStudentPerformance);
router.get("/reports/fee-collection", authorizePermissions("reports.view"), reportFeeCollection);
router.get("/reports/outstanding-fees", authorizePermissions("reports.view"), reportOutstandingFees);
router.get("/reports/income-expenses", authorizePermissions("reports.view"), reportIncomeExpenses);
router.get("/reports/library", authorizePermissions("reports.view"), reportLibrary);
router.get("/reports/discipline", authorizePermissions("reports.view"), reportDiscipline);

export { router as insightsRoutes };
