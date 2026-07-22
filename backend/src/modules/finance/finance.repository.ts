import { query } from "../../config/database";

export const financeRepository = {
  listFeeTypes: () => query(`SELECT * FROM fee_types ORDER BY name`),
  getFeeType: async (id: number) => (await query(`SELECT * FROM fee_types WHERE id = $1`, [id]))[0] ?? null,
  listFeeStructures: () =>
    query(
      `SELECT fs.*, ft.name AS fee_type_name, c.name AS classroom_name, ay.name AS academic_year_name, t.name AS term_name
       FROM fee_structures fs
       JOIN fee_types ft ON ft.id = fs.fee_type_id
       JOIN classrooms c ON c.id = fs.classroom_id
       JOIN academic_years ay ON ay.id = fs.academic_year_id
       JOIN terms t ON t.id = fs.term_id
       ORDER BY fs.created_at DESC`
    ),
  getFeeStructure: async (id: number) => (await query(`SELECT * FROM fee_structures WHERE id = $1`, [id]))[0] ?? null,
  listInvoices: () =>
    query(
      `SELECT si.*, s.admission_number, s.first_name, s.last_name
       FROM student_invoices si
       JOIN students s ON s.id = si.student_id
       ORDER BY si.created_at DESC`
    ),
  getInvoicesByStudent: (studentId: number) =>
    query(`SELECT * FROM student_invoices WHERE student_id = $1 ORDER BY created_at DESC`, [studentId]),
  getInvoice: async (id: number) => (await query(`SELECT * FROM student_invoices WHERE id = $1`, [id]))[0] ?? null,
  getInvoiceItems: (invoiceId: number) => query(`SELECT * FROM student_invoice_items WHERE invoice_id = $1 ORDER BY id`, [invoiceId]),
  listPayments: () =>
    query(
      `SELECT fp.*, si.invoice_number
       FROM fee_payments fp
       JOIN student_invoices si ON si.id = fp.invoice_id
       ORDER BY fp.created_at DESC`
    ),
  getPayment: async (id: number) => (await query(`SELECT * FROM fee_payments WHERE id = $1`, [id]))[0] ?? null,
  getPaymentsByStudent: (studentId: number) => query(`SELECT * FROM fee_payments WHERE student_id = $1 ORDER BY payment_date DESC`, [studentId]),
  getPaymentsByInvoice: (invoiceId: number) => query(`SELECT * FROM fee_payments WHERE invoice_id = $1 ORDER BY payment_date DESC`, [invoiceId]),
  listExpenses: () => query(`SELECT * FROM expenses ORDER BY expense_date DESC, created_at DESC`),
  getExpense: async (id: number) => (await query(`SELECT * FROM expenses WHERE id = $1`, [id]))[0] ?? null,
  listIncome: () => query(`SELECT * FROM income_records ORDER BY income_date DESC, created_at DESC`),
  getIncome: async (id: number) => (await query(`SELECT * FROM income_records WHERE id = $1`, [id]))[0] ?? null
};
