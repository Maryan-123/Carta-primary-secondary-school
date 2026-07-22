import { Request, Response } from "express";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { financeService } from "./finance.service";

const listResponder =
  (method: (...args: never[]) => Promise<unknown>, message: string, argSelector?: (request: Request) => never[]) =>
  asyncHandler(async (request: Request, response: Response) => {
    const args = argSelector ? argSelector(request) : [];
    sendSuccess(response, 200, message, await method(...args));
  });

export const listFeeTypes = listResponder(() => financeService.listFeeTypes(), "Fee types retrieved successfully");
export const getFeeType = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Fee type retrieved successfully", await financeService.getFeeType(Number(request.params.id)));
});
export const createFeeType = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Fee type created successfully", await financeService.createFeeType(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateFeeType = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Fee type updated successfully", await financeService.updateFeeType(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteFeeType = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deleteFeeType(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Fee type deleted successfully", {});
});

export const listFeeStructures = listResponder(() => financeService.listFeeStructures(), "Fee structures retrieved successfully");
export const getFeeStructure = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Fee structure retrieved successfully", await financeService.getFeeStructure(Number(request.params.id)));
});
export const createFeeStructure = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Fee structure created successfully", await financeService.createFeeStructure(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateFeeStructure = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Fee structure updated successfully", await financeService.updateFeeStructure(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteFeeStructure = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deleteFeeStructure(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Fee structure deleted successfully", {});
});

export const listInvoices = listResponder(() => financeService.listInvoices(), "Invoices retrieved successfully");
export const getInvoicesByStudent = listResponder(financeService.getInvoicesByStudent, "Student invoices retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);
export const getInvoice = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Invoice retrieved successfully", await financeService.getInvoice(Number(request.params.id)));
});
export const createInvoice = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Invoice created successfully", await financeService.createInvoice(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateInvoice = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Invoice updated successfully", await financeService.updateInvoice(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const cancelInvoice = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Invoice cancelled successfully", await financeService.cancelInvoice(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null));
});
export const deleteInvoice = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deleteInvoice(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Invoice deleted successfully", {});
});

export const listPayments = listResponder(() => financeService.listPayments(), "Payments retrieved successfully");
export const getPayment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Payment retrieved successfully", await financeService.getPayment(Number(request.params.id)));
});
export const createPayment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Payment created successfully", await financeService.createPayment(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updatePayment = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Payment updated successfully", await financeService.updatePayment(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deletePayment = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deletePayment(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Payment deleted successfully", {});
});
export const getPaymentsByStudent = listResponder(financeService.getPaymentsByStudent, "Student payments retrieved successfully", (request) => [Number(request.params.studentId)] as never[]);
export const getPaymentsByInvoice = listResponder(financeService.getPaymentsByInvoice, "Invoice payments retrieved successfully", (request) => [Number(request.params.invoiceId)] as never[]);

export const listExpenses = listResponder(() => financeService.listExpenses(), "Expenses retrieved successfully");
export const getExpense = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Expense retrieved successfully", await financeService.getExpense(Number(request.params.id)));
});
export const createExpense = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Expense created successfully", await financeService.createExpense(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateExpense = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Expense updated successfully", await financeService.updateExpense(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteExpense = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deleteExpense(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Expense deleted successfully", {});
});

export const listIncome = listResponder(() => financeService.listIncome(), "Income records retrieved successfully");
export const getIncome = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Income record retrieved successfully", await financeService.getIncome(Number(request.params.id)));
});
export const createIncome = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 201, "Income record created successfully", await financeService.createIncome(request.user!.userId, request.body, request.requestMeta?.ipAddress ?? null));
});
export const updateIncome = asyncHandler(async (request: Request, response: Response) => {
  sendSuccess(response, 200, "Income record updated successfully", await financeService.updateIncome(request.user!.userId, Number(request.params.id), request.body, request.requestMeta?.ipAddress ?? null));
});
export const deleteIncome = asyncHandler(async (request: Request, response: Response) => {
  await financeService.deleteIncome(request.user!.userId, Number(request.params.id), request.requestMeta?.ipAddress ?? null);
  sendSuccess(response, 200, "Income record deleted successfully", {});
});
