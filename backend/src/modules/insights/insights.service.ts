import { query } from "../../config/database";
import { insightsRepository } from "./insights.repository";

const safeQuery = async (sql: string, params: unknown[] = []) => {
  try {
    return await query(sql, params);
  } catch (_error) {
    return [];
  }
};

const attachInvoiceItems = async <T extends Record<string, unknown> & { id: number | string }>(invoices: T[]) => {
  if (!invoices.length) {
    return invoices.map((invoice) => ({ ...invoice, items: [] as Array<Record<string, unknown>> }));
  }

  const invoiceIds = invoices
    .map((invoice) => Number(invoice.id))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (!invoiceIds.length) {
    return invoices.map((invoice) => ({ ...invoice, items: [] as Array<Record<string, unknown>> }));
  }

  const placeholders = invoiceIds.map((_, index) => `$${index + 1}`).join(", ");
  const items = await safeQuery(
    `SELECT sii.*, ft.name AS fee_type_name
     FROM student_invoice_items sii
     LEFT JOIN fee_types ft ON ft.id = sii.fee_type_id
     WHERE sii.invoice_id IN (${placeholders})
     ORDER BY sii.invoice_id, sii.id`,
    invoiceIds
  );

  const groupedItems = items.reduce<Record<string, typeof items>>((accumulator, item) => {
    const key = String(item.invoice_id);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});

  return invoices.map((invoice) => ({
    ...invoice,
    items: groupedItems[String(invoice.id)] || []
  }));
};

const buildFeeBalanceFromInvoices = (
  invoices: Array<Record<string, unknown>>,
  feeBalanceRow?: Record<string, unknown> | null
) => {
  const totalBalanceFromInvoices = invoices.reduce((sum, invoice) => {
    const status = String(invoice.status || "").toUpperCase();
    if (status === "CANCELLED" || status === "PAID") {
      return sum;
    }
    return sum + Number(invoice.balance_amount ?? invoice.final_amount ?? invoice.total_amount ?? 0);
  }, 0);

  const totalInvoiced = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.final_amount ?? invoice.total_amount ?? 0),
    0
  );

  const totalPaid = invoices.reduce((sum, invoice) => sum + Number(invoice.paid_amount ?? 0), 0);

  if (feeBalanceRow) {
    return {
      ...feeBalanceRow,
      total_balance:
        totalBalanceFromInvoices > 0 ? totalBalanceFromInvoices : Number(feeBalanceRow.total_balance ?? feeBalanceRow.balance_amount ?? 0),
      total_invoiced:
        totalInvoiced > 0 ? totalInvoiced : Number(feeBalanceRow.total_invoiced ?? feeBalanceRow.final_amount ?? 0),
      total_paid:
        totalPaid > 0 ? totalPaid : Number(feeBalanceRow.total_paid ?? feeBalanceRow.paid_amount ?? 0),
    };
  }

  return {
    total_balance: totalBalanceFromInvoices,
    total_invoiced: totalInvoiced,
    total_paid: totalPaid,
  };
};

export const insightsService = {
  adminDashboard: () => insightsRepository.adminDashboard(),
  async teacherDashboard(userId: number) {
    const teacherRows = await query(
      `SELECT t.id
       FROM teachers t
       JOIN staff s ON s.id = t.staff_id
       WHERE s.user_id = $1
       LIMIT 1`,
      [userId]
    );
    const teacherId = teacherRows[0]?.id;
    if (!teacherId) {
      return {
        assigned_classrooms: 0,
        assigned_subjects: 0,
        active_assignments: 0
      };
    }
    const rows = await insightsRepository.teacherDashboard(Number(teacherId));
    const [assignedClasses, assignedSubjects, assignmentLinks, assignedStudents, timetable, assignments, submissions, upcomingExams, reportCards, announcements, upcomingEvents] = await Promise.all([
      safeQuery(
        `SELECT DISTINCT c.id, c.name, c.section_name
         FROM teacher_subject_assignments tsa
         JOIN classrooms c ON c.id = tsa.classroom_id
         WHERE tsa.teacher_id = $1
         ORDER BY c.name`,
        [teacherId]
      ),
      safeQuery(
        `SELECT DISTINCT s.id, s.name, s.code
         FROM teacher_subject_assignments tsa
         JOIN subjects s ON s.id = tsa.subject_id
         WHERE tsa.teacher_id = $1
         ORDER BY s.name`,
        [teacherId]
      ),
      safeQuery(
        `SELECT
           tsa.id,
           tsa.classroom_id,
           tsa.subject_id,
           tsa.academic_year_id,
           tsa.term_id,
           c.name AS classroom_name,
           c.section_name,
           s.name AS subject_name,
           s.code AS subject_code
         FROM teacher_subject_assignments tsa
         JOIN classrooms c ON c.id = tsa.classroom_id
         JOIN subjects s ON s.id = tsa.subject_id
         WHERE tsa.teacher_id = $1
         ORDER BY c.name, s.name`,
        [teacherId]
      ),
      safeQuery(
        `SELECT DISTINCT ON (se.student_id, se.classroom_id, se.academic_year_id)
           se.id,
           se.student_id,
           se.classroom_id,
           se.academic_year_id,
           se.enrollment_status,
           s.admission_number,
           s.first_name,
           s.last_name
         FROM teacher_subject_assignments tsa
         JOIN student_enrollments se
           ON se.classroom_id = tsa.classroom_id
          AND se.academic_year_id = tsa.academic_year_id
         JOIN students s ON s.id = se.student_id
         WHERE tsa.teacher_id = $1
         ORDER BY se.student_id, se.classroom_id, se.academic_year_id, se.created_at DESC`,
        [teacherId]
      ),
      safeQuery(
        `SELECT te.*, tp.name AS period_name, tp.start_time, tp.end_time, c.name AS classroom_name, s.name AS subject_name
         FROM timetable_entries te
         JOIN timetable_periods tp ON tp.id = te.period_id
         LEFT JOIN classrooms c ON c.id = te.classroom_id
         LEFT JOIN subjects s ON s.id = te.subject_id
         WHERE te.teacher_id = $1
         ORDER BY te.day_of_week, tp.period_order`,
        [teacherId]
      ),
      safeQuery(
        `SELECT *
         FROM assignments
         WHERE teacher_id = $1
         ORDER BY due_date DESC NULLS LAST, created_at DESC
         LIMIT 10`,
        [teacherId]
      ),
      safeQuery(
        `SELECT sub.*, a.title AS assignment_title
         FROM assignment_submissions sub
         JOIN assignments a ON a.id = sub.assignment_id
         WHERE a.teacher_id = $1
         ORDER BY sub.submitted_at DESC NULLS LAST, sub.id DESC
         LIMIT 20`,
        [teacherId]
      ),
      safeQuery(
        `SELECT DISTINCT
           e.*,
           es.id AS exam_subject_id,
           es.exam_date,
           es.start_time AS subject_start_time,
           es.end_time AS subject_end_time,
           es.classroom_id,
           es.subject_id,
           c.name AS classroom_name,
           c.section_name,
           s.name AS subject_name,
           s.code AS subject_code
         FROM exams e
         JOIN exam_subjects es ON es.exam_id = e.id
         JOIN teacher_subject_assignments tsa
           ON tsa.classroom_id = es.classroom_id
          AND tsa.subject_id = es.subject_id
          AND tsa.academic_year_id = e.academic_year_id
          AND tsa.term_id = e.term_id
         LEFT JOIN classrooms c ON c.id = es.classroom_id
         LEFT JOIN subjects s ON s.id = es.subject_id
         WHERE tsa.teacher_id = $1
         ORDER BY e.start_date DESC, es.exam_date DESC, e.id DESC
         LIMIT 20`,
        [teacherId]
      ),
      safeQuery(
        `SELECT DISTINCT
           rc.*,
           st.admission_number,
           st.first_name,
           st.last_name,
           c.name AS classroom_name,
           c.section_name
         FROM report_cards rc
         JOIN students st ON st.id = rc.student_id
         JOIN classrooms c ON c.id = rc.classroom_id
         JOIN teacher_subject_assignments tsa
           ON tsa.classroom_id = rc.classroom_id
          AND tsa.academic_year_id = rc.academic_year_id
          AND tsa.term_id = rc.term_id
         WHERE tsa.teacher_id = $1
         ORDER BY rc.id DESC
         LIMIT 20`,
        [teacherId]
      ),
      safeQuery(`SELECT * FROM announcements WHERE is_active = TRUE ORDER BY published_at DESC LIMIT 5`),
      safeQuery(`SELECT * FROM school_events WHERE start_date >= CURRENT_DATE ORDER BY start_date ASC LIMIT 10`)
    ]);

    return {
      ...(rows[0] ?? {
        assigned_classrooms: 0,
        assigned_subjects: 0,
        active_assignments: 0
      }),
      teacherId,
      assignedClasses,
      assignedSubjects,
      assignmentLinks,
      assignedStudents,
      timetable,
      assignments,
      submissions,
      upcomingExams,
      reportCards,
      announcements,
      upcomingEvents
    };
  },
  accountantDashboard: () => insightsRepository.accountantDashboard(),
  librarianDashboard: () => insightsRepository.libraryDashboard(),
  studentDashboard: async (userId: number) => {
    const studentRows = await query(`SELECT id FROM students WHERE user_id = $1 LIMIT 1`, [userId]);
    const studentId = studentRows[0]?.id;
    if (!studentId) {
      return {
        currentClassroom: null,
        recentAssignments: [],
        attendancePercentage: 0,
        recentResults: [],
        feeBalance: null,
        libraryLoans: [],
        announcements: [],
        upcomingEvents: []
      };
    }
    const [classroom, assignments, attendance, attendanceRecords, results, reportCards, feeBalance, invoices, payments, libraryLoans, announcements, events, timetable] = await Promise.all([
      query(
        `SELECT * FROM student_current_enrollment_view WHERE student_id = $1 LIMIT 1`,
        [studentId]
      ),
      query(
        `SELECT a.*
         FROM assignments a
         WHERE a.classroom_id = (
           SELECT classroom_id
           FROM student_enrollments
           WHERE student_id = $1
           ORDER BY id DESC
           LIMIT 1
         )
         ORDER BY a.due_date DESC
         LIMIT 10`,
        [studentId]
      ),
      query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'PRESENT')::int AS present_count,
           COUNT(*) FILTER (WHERE status = 'ABSENT')::int AS absent_count,
           COUNT(*) FILTER (WHERE status = 'LATE')::int AS late_count,
           COUNT(*) FILTER (WHERE status = 'EXCUSED')::int AS excused_count,
           COUNT(*) FILTER (WHERE status = 'SICK')::int AS sick_count,
           COUNT(*)::int AS total_count
         FROM attendance_records
         WHERE student_id = $1`,
        [studentId]
      ),
      query(
        `SELECT ats.attendance_date, ar.status
         FROM attendance_records ar
         JOIN attendance_sessions ats ON ats.id = ar.attendance_session_id
         WHERE ar.student_id = $1
         ORDER BY ats.attendance_date DESC, ar.id DESC`,
        [studentId]
      ),
      query(`SELECT * FROM exam_results WHERE student_id = $1 ORDER BY created_at DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM report_cards WHERE student_id = $1 AND published_at IS NOT NULL ORDER BY id DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM student_fee_balance_view WHERE student_id = $1 LIMIT 1`, [studentId]),
      query(`SELECT * FROM student_invoices WHERE student_id = $1 ORDER BY created_at DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM fee_payments WHERE student_id = $1 ORDER BY payment_date DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM book_loans WHERE student_id = $1 ORDER BY borrowed_date DESC LIMIT 10`, [studentId]),
      query(`SELECT * FROM announcements WHERE is_active = TRUE ORDER BY published_at DESC LIMIT 10`),
      query(`SELECT * FROM school_events WHERE start_date >= CURRENT_DATE ORDER BY start_date ASC LIMIT 10`),
      query(
        `SELECT
           te.*,
           tp.name AS period_name,
           tp.start_time,
           tp.end_time,
           c.name AS classroom_name,
           s.name AS subject_name,
           CONCAT_WS(' ', u.first_name, u.last_name) AS teacher_name
         FROM timetable_entries te
         JOIN timetable_periods tp ON tp.id = te.period_id
         LEFT JOIN classrooms c ON c.id = te.classroom_id
         LEFT JOIN subjects s ON s.id = te.subject_id
         LEFT JOIN teachers tch ON tch.id = te.teacher_id
         LEFT JOIN staff stf ON stf.id = tch.staff_id
         LEFT JOIN users u ON u.id = stf.user_id
         WHERE te.classroom_id = (
           SELECT classroom_id
           FROM student_enrollments
           WHERE student_id = $1
           ORDER BY id DESC
           LIMIT 1
         )
         ORDER BY te.day_of_week, tp.period_order`,
        [studentId]
      )
    ]);

    const presentCount = Number(attendance[0]?.present_count ?? 0);
    const totalCount = Number(attendance[0]?.total_count ?? 0);
    const invoicesWithItems = await attachInvoiceItems(invoices as Array<Record<string, unknown> & { id: number | string }>);
    const normalizedFeeBalance = buildFeeBalanceFromInvoices(
      invoicesWithItems as Array<Record<string, unknown>>,
      (feeBalance[0] as Record<string, unknown> | undefined) ?? null
    );

    return {
      currentClassroom: classroom[0] ?? null,
      recentAssignments: assignments,
      attendancePercentage: totalCount === 0 ? 0 : (presentCount / totalCount) * 100,
      attendanceSummary: attendance[0] ?? null,
      attendanceRecords,
      recentResults: results,
      reportCards,
      feeBalance: normalizedFeeBalance,
      invoices: invoicesWithItems,
      payments,
      libraryLoans,
      announcements,
      upcomingEvents: events,
      timetable
    };
  },
  parentDashboard: async (userId: number) => {
    const parentRows = await query(`SELECT id FROM parents WHERE user_id = $1 LIMIT 1`, [userId]);
    const parentId = parentRows[0]?.id;
    if (!parentId) {
      return { children: [] };
    }
    const children = await query(
      `SELECT s.id, s.admission_number, s.first_name, s.last_name
       FROM student_parents sp
       JOIN students s ON s.id = sp.student_id
       WHERE sp.parent_id = $1`,
      [parentId]
    );
    const childrenWithDetails = await Promise.all(
      children.map(async (child) => {
        const [classroom, attendance, assignments, results, reportCards, feeBalance, invoices, payments, libraryLoans] = await Promise.all([
          query(`SELECT * FROM student_current_enrollment_view WHERE student_id = $1 LIMIT 1`, [child.id]),
          query(
            `SELECT COUNT(*) FILTER (WHERE status = 'PRESENT')::int AS present_count,
                    COUNT(*)::int AS total_count
             FROM attendance_records
             WHERE student_id = $1`,
            [child.id]
          ),
          query(
            `SELECT a.*
             FROM assignments a
             WHERE a.classroom_id = (
               SELECT classroom_id
               FROM student_enrollments
               WHERE student_id = $1
               ORDER BY id DESC
               LIMIT 1
             )
             ORDER BY a.due_date DESC
             LIMIT 10`,
            [child.id]
          ),
          query(`SELECT * FROM exam_results WHERE student_id = $1 ORDER BY created_at DESC LIMIT 10`, [child.id]),
          query(`SELECT * FROM report_cards WHERE student_id = $1 AND published_at IS NOT NULL ORDER BY id DESC LIMIT 10`, [child.id]),
          query(`SELECT * FROM student_fee_balance_view WHERE student_id = $1 LIMIT 1`, [child.id]),
          query(`SELECT * FROM student_invoices WHERE student_id = $1 ORDER BY created_at DESC LIMIT 10`, [child.id]),
          query(`SELECT * FROM fee_payments WHERE student_id = $1 ORDER BY payment_date DESC LIMIT 10`, [child.id]),
          query(`SELECT * FROM book_loans WHERE student_id = $1 ORDER BY borrowed_date DESC LIMIT 10`, [child.id])
        ]);

        const presentCount = Number(attendance[0]?.present_count ?? 0);
        const totalCount = Number(attendance[0]?.total_count ?? 0);
        const invoicesWithItems = await attachInvoiceItems(invoices as Array<Record<string, unknown> & { id: number | string }>);
        const normalizedFeeBalance = buildFeeBalanceFromInvoices(
          invoicesWithItems as Array<Record<string, unknown>>,
          (feeBalance[0] as Record<string, unknown> | undefined) ?? null
        );

        return {
          ...child,
          currentClassroom: classroom[0] ?? null,
          attendancePercentage: totalCount === 0 ? 0 : (presentCount / totalCount) * 100,
          assignments,
          results,
          reportCards,
          feeBalance: normalizedFeeBalance,
          invoices: invoicesWithItems,
          payments,
          libraryLoans
        };
      })
    );

    const [announcements, upcomingEvents] = await Promise.all([
      query(`SELECT * FROM announcements WHERE is_active = TRUE ORDER BY published_at DESC LIMIT 10`),
      query(`SELECT * FROM school_events WHERE start_date >= CURRENT_DATE ORDER BY start_date ASC LIMIT 10`)
    ]);

    return { children: childrenWithDetails, announcements, upcomingEvents };
  },
  reportStudentEnrollment: () =>
    query(
      `SELECT * FROM student_current_enrollment_view ORDER BY academic_year, grade_level, classroom_name, student_name`
    ),
  reportStudentAttendance: () =>
    query(
      `SELECT ats.classroom_id, ats.attendance_date, ar.student_id, ar.status
       FROM attendance_sessions ats
       JOIN attendance_records ar ON ar.attendance_session_id = ats.id
       ORDER BY ats.attendance_date DESC`
    ),
  reportStaffAttendance: () => query(`SELECT * FROM staff_attendance ORDER BY attendance_date DESC`),
  reportExamPerformance: () =>
    query(
      `SELECT es.exam_id, es.classroom_id, es.subject_id, AVG(er.marks_obtained) AS average_marks
       FROM exam_results er
       JOIN exam_subjects es ON es.id = er.exam_subject_id
       WHERE er.is_absent = FALSE
       GROUP BY es.exam_id, es.classroom_id, es.subject_id`
    ),
  reportClassPerformance: () =>
    query(
      `SELECT classroom_id, AVG(average_percentage) AS average_percentage
       FROM report_cards
       GROUP BY classroom_id`
    ),
  reportStudentPerformance: () =>
    query(
      `SELECT student_id, AVG(average_percentage) AS average_percentage
       FROM report_cards
       GROUP BY student_id`
    ),
  reportFeeCollection: () => query(`SELECT * FROM fee_payments ORDER BY payment_date DESC`),
  reportOutstandingFees: () =>
    query(`SELECT * FROM student_invoices WHERE status IN ('UNPAID', 'PARTIALLY_PAID') ORDER BY due_date ASC NULLS LAST`),
  reportIncomeExpenses: async () => {
    const [income, expenses] = await Promise.all([
      query(`SELECT income_date AS date, amount, income_category AS category FROM income_records ORDER BY income_date DESC`),
      query(`SELECT expense_date AS date, amount, expense_category AS category FROM expenses ORDER BY expense_date DESC`)
    ]);
    return { income, expenses };
  },
  reportLibrary: () => query(`SELECT * FROM book_loans ORDER BY borrowed_date DESC`),
  reportDiscipline: () => query(`SELECT * FROM discipline_incidents ORDER BY incident_date DESC`)
};
