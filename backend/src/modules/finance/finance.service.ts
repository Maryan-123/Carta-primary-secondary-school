import { withTransaction } from "../../config/database";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { financeRepository } from "./finance.repository";

const buildInvoiceNumber = (): string => `INV-${new Date().getFullYear()}-${Date.now()}`;
const buildReceiptNumber = (): string => `RCP-${new Date().getFullYear()}-${Date.now()}`;

const computeInvoiceStatus = (totalAmount: number, discountAmount: number, paidAmount: number): string => {
  const finalAmount = Math.max(totalAmount - discountAmount, 0);
  if (paidAmount <= 0) return "UNPAID";
  if (paidAmount >= finalAmount) return "PAID";
  return "PARTIALLY_PAID";
};

export const financeService = {
  listFeeTypes: () => financeRepository.listFeeTypes(),
  async getFeeType(id: number) {
    const row = await financeRepository.getFeeType(id);
    if (!row) throw new NotFoundError("Fee type not found");
    return row;
  },
  async createFeeType(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO fee_types (name, description, is_active)
         VALUES ($1,$2,$3)
         RETURNING id`,
        [payload.name, payload.description ?? null, payload.isActive ?? true]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_FEE_TYPE",
        tableName: "fee_types",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getFeeType(id);
  },
  async updateFeeType(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getFeeType(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE fee_types
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             is_active = COALESCE($4, is_active)
         WHERE id = $1`,
        [id, payload.name ?? null, payload.description ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_FEE_TYPE",
        tableName: "fee_types",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getFeeType(id);
  },
  async deleteFeeType(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM fee_types WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_FEE_TYPE",
        tableName: "fee_types",
        recordId: id,
        ipAddress
      });
    });
  },

  listFeeStructures: () => financeRepository.listFeeStructures(),
  async getFeeStructure(id: number) {
    const row = await financeRepository.getFeeStructure(id);
    if (!row) throw new NotFoundError("Fee structure not found");
    return row;
  },
  async createFeeStructure(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO fee_structures (academic_year_id, term_id, classroom_id, fee_type_id, amount, due_date)
         VALUES ($1,$2,$3,$4,$5,$6)
         RETURNING id`,
        [payload.academicYearId, payload.termId, payload.classroomId, payload.feeTypeId, payload.amount, payload.dueDate ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_FEE_STRUCTURE",
        tableName: "fee_structures",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getFeeStructure(id);
  },
  async updateFeeStructure(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getFeeStructure(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE fee_structures
         SET academic_year_id = COALESCE($2, academic_year_id),
             term_id = COALESCE($3, term_id),
             classroom_id = COALESCE($4, classroom_id),
             fee_type_id = COALESCE($5, fee_type_id),
             amount = COALESCE($6, amount),
             due_date = COALESCE($7, due_date)
         WHERE id = $1`,
        [id, payload.academicYearId ?? null, payload.termId ?? null, payload.classroomId ?? null, payload.feeTypeId ?? null, payload.amount ?? null, payload.dueDate ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_FEE_STRUCTURE",
        tableName: "fee_structures",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getFeeStructure(id);
  },
  async deleteFeeStructure(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM fee_structures WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_FEE_STRUCTURE",
        tableName: "fee_structures",
        recordId: id,
        ipAddress
      });
    });
  },

  listInvoices: () => financeRepository.listInvoices(),
  getInvoicesByStudent: (studentId: number) => financeRepository.getInvoicesByStudent(studentId),
  async getInvoice(id: number) {
    const invoice = await financeRepository.getInvoice(id);
    if (!invoice) throw new NotFoundError("Invoice not found");
    const items = await financeRepository.getInvoiceItems(id);
    return { ...invoice, items };
  },
  async createInvoice(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const items = payload.items as Array<Record<string, unknown>>;
    const totalAmount = items.reduce((sum, item) => sum + Number(item.amount), 0);
    const discountAmount = Number(payload.discountAmount ?? 0);
    if (discountAmount > totalAmount) {
      throw new ValidationAppError("Validation failed", [
        { field: "discountAmount", message: "Discount cannot exceed invoice total amount" }
      ]);
    }

    const invoiceId = await withTransaction(async (client) => {
      const invoiceNumber = buildInvoiceNumber();
      const invoiceResult = await client.query<{ id: number }>(
        `INSERT INTO student_invoices (
          invoice_number, student_id, academic_year_id, term_id, invoice_date, due_date,
          total_amount, discount_amount, paid_amount, status, created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10)
        RETURNING id`,
        [
          invoiceNumber,
          payload.studentId,
          payload.academicYearId,
          payload.termId,
          payload.invoiceDate,
          payload.dueDate ?? null,
          totalAmount,
          discountAmount,
          computeInvoiceStatus(totalAmount, discountAmount, 0),
          actorUserId
        ]
      );
      const invoiceId = invoiceResult.rows[0].id;

      for (const item of items) {
        await client.query(
          `INSERT INTO student_invoice_items (invoice_id, fee_type_id, description, amount, discount_amount)
           VALUES ($1,$2,$3,$4,$5)`,
          [invoiceId, item.feeTypeId, item.description ?? null, item.amount, item.discountAmount ?? 0]
        );
      }

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_INVOICE",
        tableName: "student_invoices",
        recordId: invoiceId,
        newValues: payload,
        ipAddress
      });
      return invoiceId;
    });

    return this.getInvoice(invoiceId);
  },
  async updateInvoice(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getInvoice(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE student_invoices
         SET invoice_date = COALESCE($2, invoice_date),
             due_date = COALESCE($3, due_date),
             discount_amount = COALESCE($4, discount_amount)
         WHERE id = $1`,
        [id, payload.invoiceDate ?? null, payload.dueDate ?? null, payload.discountAmount ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_INVOICE",
        tableName: "student_invoices",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getInvoice(id);
  },
  async cancelInvoice(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`UPDATE student_invoices SET status = 'CANCELLED' WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CANCEL_INVOICE",
        tableName: "student_invoices",
        recordId: id,
        ipAddress
      });
    });
    return this.getInvoice(id);
  },
  async deleteInvoice(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM student_invoices WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_INVOICE",
        tableName: "student_invoices",
        recordId: id,
        ipAddress
      });
    });
  },

  listPayments: () => financeRepository.listPayments(),
  async getPayment(id: number) {
    const row = await financeRepository.getPayment(id);
    if (!row) throw new NotFoundError("Payment not found");
    return row;
  },
  getPaymentsByStudent: (studentId: number) => financeRepository.getPaymentsByStudent(studentId),
  getPaymentsByInvoice: (invoiceId: number) => financeRepository.getPaymentsByInvoice(invoiceId),
  async createPayment(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const paymentId = await withTransaction(async (client) => {
      const invoiceResult = await client.query<{
        id: number;
        total_amount: string;
        discount_amount: string;
        paid_amount: string;
        status: string;
      }>(`SELECT * FROM student_invoices WHERE id = $1 FOR UPDATE`, [payload.invoiceId]);

      const invoice = invoiceResult.rows[0];
      if (!invoice) {
        throw new NotFoundError("Invoice not found");
      }
      if (invoice.status === "CANCELLED") {
        throw new ValidationAppError("Validation failed", [
          { field: "invoiceId", message: "Cannot record a payment against a cancelled invoice" }
        ]);
      }

      const totalAmount = Number(invoice.total_amount);
      const discountAmount = Number(invoice.discount_amount);
      const currentPaidAmount = Number(invoice.paid_amount);
      const remainingBalance = Math.max(totalAmount - discountAmount - currentPaidAmount, 0);
      const paymentAmount = Number(payload.amount);

      if (paymentAmount > remainingBalance) {
        throw new ValidationAppError("Validation failed", [
          { field: "amount", message: "Payment cannot exceed remaining invoice balance" }
        ]);
      }

      const paymentResult = await client.query<{ id: number }>(
        `INSERT INTO fee_payments (
          receipt_number, invoice_id, student_id, payment_date, amount, payment_method,
          reference_number, received_by, notes
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id`,
        [
          buildReceiptNumber(),
          payload.invoiceId,
          payload.studentId,
          payload.paymentDate,
          paymentAmount,
          payload.paymentMethod,
          payload.referenceNumber ?? null,
          actorUserId,
          payload.notes ?? null
        ]
      );

      const newPaidAmount = currentPaidAmount + paymentAmount;
      const newStatus = computeInvoiceStatus(totalAmount, discountAmount, newPaidAmount);
      await client.query(`UPDATE student_invoices SET paid_amount = $2, status = $3 WHERE id = $1`, [
        payload.invoiceId,
        newPaidAmount,
        newStatus
      ]);

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_PAYMENT",
        tableName: "fee_payments",
        recordId: paymentResult.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return paymentResult.rows[0].id;
    });

    return this.getPayment(paymentId);
  },
  async updatePayment(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const existing = await this.getPayment(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE fee_payments
         SET payment_date = COALESCE($2, payment_date),
             amount = COALESCE($3, amount),
             payment_method = COALESCE($4, payment_method),
             reference_number = COALESCE($5, reference_number),
             notes = COALESCE($6, notes)
         WHERE id = $1`,
        [id, payload.paymentDate ?? null, payload.amount ?? null, payload.paymentMethod ?? null, payload.referenceNumber ?? null, payload.notes ?? null]
      );

      const totals = await client.query<{ total_paid: string }>(
        `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM fee_payments WHERE invoice_id = $1`,
        [existing.invoice_id]
      );
      const invoiceRows = await client.query<{
        total_amount: string;
        discount_amount: string;
      }>(`SELECT total_amount, discount_amount FROM student_invoices WHERE id = $1`, [existing.invoice_id]);
      const invoice = invoiceRows.rows[0];
      const totalPaid = Number(totals.rows[0].total_paid);
      const totalAmount = Number(invoice.total_amount);
      const discountAmount = Number(invoice.discount_amount);
      await client.query(`UPDATE student_invoices SET paid_amount = $2, status = $3 WHERE id = $1`, [
        existing.invoice_id,
        totalPaid,
        computeInvoiceStatus(totalAmount, discountAmount, totalPaid)
      ]);

      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_PAYMENT",
        tableName: "fee_payments",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getPayment(id);
  },
  async deletePayment(actorUserId: number, id: number, ipAddress: string | null) {
    const payment = await this.getPayment(id);
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM fee_payments WHERE id = $1`, [id]);
      const totals = await client.query<{ total_paid: string }>(
        `SELECT COALESCE(SUM(amount), 0) AS total_paid FROM fee_payments WHERE invoice_id = $1`,
        [payment.invoice_id]
      );
      const invoiceRows = await client.query<{
        total_amount: string;
        discount_amount: string;
      }>(`SELECT total_amount, discount_amount FROM student_invoices WHERE id = $1`, [payment.invoice_id]);
      const invoice = invoiceRows.rows[0];
      const totalPaid = Number(totals.rows[0].total_paid);
      const totalAmount = Number(invoice.total_amount);
      const discountAmount = Number(invoice.discount_amount);
      await client.query(`UPDATE student_invoices SET paid_amount = $2, status = $3 WHERE id = $1`, [
        payment.invoice_id,
        totalPaid,
        computeInvoiceStatus(totalAmount, discountAmount, totalPaid)
      ]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_PAYMENT",
        tableName: "fee_payments",
        recordId: id,
        ipAddress
      });
    });
  },

  listExpenses: () => financeRepository.listExpenses(),
  async getExpense(id: number) {
    const row = await financeRepository.getExpense(id);
    if (!row) throw new NotFoundError("Expense not found");
    return row;
  },
  async createExpense(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO expenses (
          expense_category, description, amount, expense_date, payment_method, reference_number, recorded_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id`,
        [payload.expenseCategory, payload.description, payload.amount, payload.expenseDate, payload.paymentMethod, payload.referenceNumber ?? null, actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_EXPENSE",
        tableName: "expenses",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getExpense(id);
  },
  async updateExpense(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getExpense(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE expenses
         SET expense_category = COALESCE($2, expense_category),
             description = COALESCE($3, description),
             amount = COALESCE($4, amount),
             expense_date = COALESCE($5, expense_date),
             payment_method = COALESCE($6, payment_method),
             reference_number = COALESCE($7, reference_number)
         WHERE id = $1`,
        [id, payload.expenseCategory ?? null, payload.description ?? null, payload.amount ?? null, payload.expenseDate ?? null, payload.paymentMethod ?? null, payload.referenceNumber ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_EXPENSE",
        tableName: "expenses",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getExpense(id);
  },
  async deleteExpense(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM expenses WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_EXPENSE",
        tableName: "expenses",
        recordId: id,
        ipAddress
      });
    });
  },

  listIncome: () => financeRepository.listIncome(),
  async getIncome(id: number) {
    const row = await financeRepository.getIncome(id);
    if (!row) throw new NotFoundError("Income record not found");
    return row;
  },
  async createIncome(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO income_records (
          income_category, description, amount, income_date, payment_method, reference_number, recorded_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING id`,
        [payload.incomeCategory, payload.description, payload.amount, payload.incomeDate, payload.paymentMethod, payload.referenceNumber ?? null, actorUserId]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "CREATE_INCOME",
        tableName: "income_records",
        recordId: result.rows[0].id,
        newValues: payload,
        ipAddress
      });
      return result.rows[0].id;
    });
    return this.getIncome(id);
  },
  async updateIncome(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getIncome(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE income_records
         SET income_category = COALESCE($2, income_category),
             description = COALESCE($3, description),
             amount = COALESCE($4, amount),
             income_date = COALESCE($5, income_date),
             payment_method = COALESCE($6, payment_method),
             reference_number = COALESCE($7, reference_number)
         WHERE id = $1`,
        [id, payload.incomeCategory ?? null, payload.description ?? null, payload.amount ?? null, payload.incomeDate ?? null, payload.paymentMethod ?? null, payload.referenceNumber ?? null]
      );
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "UPDATE_INCOME",
        tableName: "income_records",
        recordId: id,
        newValues: payload,
        ipAddress
      });
    });
    return this.getIncome(id);
  },
  async deleteIncome(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM income_records WHERE id = $1`, [id]);
      await writeAuditLog(client, {
        userId: actorUserId,
        action: "DELETE_INCOME",
        tableName: "income_records",
        recordId: id,
        ipAddress
      });
    });
  }
};
