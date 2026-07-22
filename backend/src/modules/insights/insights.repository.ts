import { query } from "../../config/database";

export const insightsRepository = {
  adminDashboard: async () => {
    const [
      students,
      teachers,
      staff,
      parents,
      classrooms,
      currentAcademicYear,
      currentTerm,
      unpaidFees,
      monthlyCollections,
      monthlyExpenses,
      borrowedBooks,
      overdueBooks,
      studentGenderDistribution,
      recentAnnouncements,
      upcomingEvents,
      recentAuditActivity
    ] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM students WHERE student_status = 'ACTIVE'`),
      query(`SELECT COUNT(*)::int AS total FROM teachers`),
      query(`SELECT COUNT(*)::int AS total FROM staff WHERE employment_status = 'ACTIVE'`),
      query(`SELECT COUNT(*)::int AS total FROM parents WHERE is_active = TRUE`),
      query(`SELECT COUNT(*)::int AS total FROM classrooms WHERE is_active = TRUE`),
      query(`SELECT * FROM academic_years WHERE is_current = TRUE LIMIT 1`),
      query(`SELECT * FROM terms WHERE is_current = TRUE LIMIT 1`),
      query(`SELECT COALESCE(SUM(balance_amount), 0) AS total FROM student_invoices WHERE status IN ('UNPAID', 'PARTIALLY_PAID')`),
      query(`SELECT COALESCE(SUM(amount), 0) AS total FROM fee_payments WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)`),
      query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)`),
      query(`SELECT COUNT(*)::int AS total FROM book_loans WHERE status = 'BORROWED'`),
      query(`SELECT COUNT(*)::int AS total FROM book_loans WHERE status = 'BORROWED' AND due_date < CURRENT_DATE`),
      query(
        `SELECT gender, COUNT(*)::int AS total
         FROM students
         WHERE student_status = 'ACTIVE'
         GROUP BY gender
         ORDER BY gender`
      ),
      query(`SELECT * FROM announcements ORDER BY published_at DESC LIMIT 5`),
      query(`SELECT * FROM school_events WHERE start_date >= CURRENT_DATE ORDER BY start_date ASC LIMIT 5`),
      query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10`)
    ]);

    return {
      totalActiveStudents: students[0]?.total ?? 0,
      totalTeachers: teachers[0]?.total ?? 0,
      totalStaff: staff[0]?.total ?? 0,
      totalParents: parents[0]?.total ?? 0,
      totalClassrooms: classrooms[0]?.total ?? 0,
      currentAcademicYear: currentAcademicYear[0] ?? null,
      currentTerm: currentTerm[0] ?? null,
      totalUnpaidFees: unpaidFees[0]?.total ?? 0,
      totalFeesCollectedThisMonth: monthlyCollections[0]?.total ?? 0,
      totalExpensesThisMonth: monthlyExpenses[0]?.total ?? 0,
      booksCurrentlyBorrowed: borrowedBooks[0]?.total ?? 0,
      overdueBooks: overdueBooks[0]?.total ?? 0,
      studentGenderDistribution,
      recentAnnouncements,
      upcomingEvents,
      recentAuditActivity
    };
  },
  teacherDashboard: (teacherId: number) =>
    query(
      `SELECT
         (SELECT COUNT(DISTINCT classroom_id)::int FROM teacher_subject_assignments WHERE teacher_id = $1) AS assigned_classrooms,
         (SELECT COUNT(DISTINCT subject_id)::int FROM teacher_subject_assignments WHERE teacher_id = $1) AS assigned_subjects,
         (SELECT COUNT(*)::int FROM assignments WHERE teacher_id = $1 AND status = 'PUBLISHED') AS active_assignments`,
      [teacherId]
    ),
  accountantDashboard: async () => {
    const [todayCollections, monthlyCollections, unpaidInvoices, partiallyPaidInvoices, outstandingBalance, recentPayments, income, expenses] =
      await Promise.all([
        query(`SELECT COALESCE(SUM(amount), 0) AS total FROM fee_payments WHERE payment_date = CURRENT_DATE`),
        query(`SELECT COALESCE(SUM(amount), 0) AS total FROM fee_payments WHERE DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)`),
        query(`SELECT COUNT(*)::int AS total FROM student_invoices WHERE status = 'UNPAID'`),
        query(`SELECT COUNT(*)::int AS total FROM student_invoices WHERE status = 'PARTIALLY_PAID'`),
        query(`SELECT COALESCE(SUM(balance_amount), 0) AS total FROM student_invoices WHERE status IN ('UNPAID', 'PARTIALLY_PAID')`),
        query(`SELECT * FROM fee_payments ORDER BY payment_date DESC LIMIT 10`),
        query(`SELECT COALESCE(SUM(amount), 0) AS total FROM income_records WHERE DATE_TRUNC('month', income_date) = DATE_TRUNC('month', CURRENT_DATE)`),
        query(`SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)`)
      ]);

    return {
      todayCollections: todayCollections[0]?.total ?? 0,
      monthlyCollections: monthlyCollections[0]?.total ?? 0,
      unpaidInvoices: unpaidInvoices[0]?.total ?? 0,
      partiallyPaidInvoices: partiallyPaidInvoices[0]?.total ?? 0,
      totalOutstandingBalance: outstandingBalance[0]?.total ?? 0,
      recentPayments,
      income: income[0]?.total ?? 0,
      expenses: expenses[0]?.total ?? 0,
      netCashSummary: Number(income[0]?.total ?? 0) - Number(expenses[0]?.total ?? 0)
    };
  },
  libraryDashboard: async () => {
    const [borrowed, overdue, recentLoans] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM book_loans WHERE status = 'BORROWED'`),
      query(`SELECT COUNT(*)::int AS total FROM book_loans WHERE status = 'BORROWED' AND due_date < CURRENT_DATE`),
      query(`SELECT * FROM book_loans ORDER BY borrowed_date DESC LIMIT 10`)
    ]);
    return {
      booksCurrentlyBorrowed: borrowed[0]?.total ?? 0,
      overdueBooks: overdue[0]?.total ?? 0,
      recentLoans
    };
  }
};
