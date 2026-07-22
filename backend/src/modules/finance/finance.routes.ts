import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions, authorizeRolesOrPermissions } from "../../middleware/authorize";
import { authorizeStudentSelfOrLinkedParent } from "../../middleware/role-scope";
import { validate } from "../../middleware/validate";
import {
  cancelInvoice,
  createExpense,
  createFeeStructure,
  createFeeType,
  createIncome,
  createInvoice,
  createPayment,
  deleteExpense,
  deleteFeeStructure,
  deleteFeeType,
  deleteIncome,
  deleteInvoice,
  deletePayment,
  getExpense,
  getFeeStructure,
  getFeeType,
  getIncome,
  getInvoice,
  getInvoicesByStudent,
  getPayment,
  getPaymentsByInvoice,
  getPaymentsByStudent,
  listExpenses,
  listFeeStructures,
  listFeeTypes,
  listIncome,
  listInvoices,
  listPayments,
  updateExpense,
  updateFeeStructure,
  updateFeeType,
  updateIncome,
  updateInvoice,
  updatePayment
} from "./finance.controller";
import {
  expenseSchema,
  feeStructureSchema,
  feeTypeSchema,
  incomeSchema,
  invoiceSchema,
  paymentSchema
} from "./finance.validator";

const router = Router();

router.use(authenticate);

router.get("/fee-types", authorizePermissions("finance.view"), listFeeTypes);
router.get("/fee-types/:id", authorizePermissions("finance.view"), getFeeType);
router.post("/fee-types", authorizePermissions("finance.manage"), validate(feeTypeSchema), createFeeType);
router.patch("/fee-types/:id", authorizePermissions("finance.manage"), validate(feeTypeSchema.partial()), updateFeeType);
router.delete("/fee-types/:id", authorizePermissions("finance.manage"), deleteFeeType);

router.get("/fee-structures", authorizePermissions("finance.view"), listFeeStructures);
router.get("/fee-structures/:id", authorizePermissions("finance.view"), getFeeStructure);
router.post("/fee-structures", authorizePermissions("finance.manage"), validate(feeStructureSchema), createFeeStructure);
router.patch("/fee-structures/:id", authorizePermissions("finance.manage"), validate(feeStructureSchema.partial()), updateFeeStructure);
router.delete("/fee-structures/:id", authorizePermissions("finance.manage"), deleteFeeStructure);

router.get("/invoices", authorizePermissions("finance.view"), listInvoices);
router.get("/invoices/:id", authorizePermissions("finance.view"), getInvoice);
router.get("/invoices/student/:studentId", authorizeRolesOrPermissions(["STUDENT", "PARENT", "ACCOUNTANT"], ["finance.view"]), authorizeStudentSelfOrLinkedParent(), getInvoicesByStudent);
router.post("/invoices", authorizePermissions("finance.manage"), validate(invoiceSchema), createInvoice);
router.patch("/invoices/:id", authorizePermissions("finance.manage"), validate(invoiceSchema.partial().omit({ items: true, studentId: true, academicYearId: true, termId: true })), updateInvoice);
router.post("/invoices/:id/cancel", authorizePermissions("finance.manage"), cancelInvoice);
router.delete("/invoices/:id", authorizePermissions("finance.manage"), deleteInvoice);

router.get("/payments", authorizePermissions("finance.view"), listPayments);
router.get("/payments/:id", authorizePermissions("finance.view"), getPayment);
router.get("/payments/student/:studentId", authorizeRolesOrPermissions(["STUDENT", "PARENT", "ACCOUNTANT"], ["finance.view"]), authorizeStudentSelfOrLinkedParent(), getPaymentsByStudent);
router.get("/payments/invoice/:invoiceId", authorizePermissions("finance.view"), getPaymentsByInvoice);
router.post("/payments", authorizePermissions("finance.manage"), validate(paymentSchema), createPayment);
router.patch("/payments/:id", authorizePermissions("finance.manage"), validate(paymentSchema.partial().omit({ invoiceId: true, studentId: true })), updatePayment);
router.delete("/payments/:id", authorizePermissions("finance.manage"), deletePayment);

router.get("/expenses", authorizePermissions("finance.view"), listExpenses);
router.get("/expenses/:id", authorizePermissions("finance.view"), getExpense);
router.post("/expenses", authorizePermissions("finance.manage"), validate(expenseSchema), createExpense);
router.patch("/expenses/:id", authorizePermissions("finance.manage"), validate(expenseSchema.partial()), updateExpense);
router.delete("/expenses/:id", authorizePermissions("finance.manage"), deleteExpense);

router.get("/income", authorizePermissions("finance.view"), listIncome);
router.get("/income/:id", authorizePermissions("finance.view"), getIncome);
router.post("/income", authorizePermissions("finance.manage"), validate(incomeSchema), createIncome);
router.patch("/income/:id", authorizePermissions("finance.manage"), validate(incomeSchema.partial()), updateIncome);
router.delete("/income/:id", authorizePermissions("finance.manage"), deleteIncome);

export { router as financeRoutes };
