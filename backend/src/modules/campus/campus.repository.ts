import { query } from "../../config/database";

export const campusRepository = {
  listBookCategories: () => query(`SELECT * FROM book_categories ORDER BY name`),
  getBookCategory: async (id: number) => (await query(`SELECT * FROM book_categories WHERE id = $1`, [id]))[0] ?? null,
  listBooks: () => query(`SELECT * FROM books ORDER BY title`),
  getBook: async (id: number) => (await query(`SELECT * FROM books WHERE id = $1`, [id]))[0] ?? null,
  listBookLoans: () => query(`SELECT * FROM book_loans ORDER BY borrowed_date DESC, id DESC`),
  getBookLoan: async (id: number) => (await query(`SELECT * FROM book_loans WHERE id = $1`, [id]))[0] ?? null,
  listAnnouncements: () => query(`SELECT * FROM announcements ORDER BY published_at DESC`),
  getAnnouncement: async (id: number) => (await query(`SELECT * FROM announcements WHERE id = $1`, [id]))[0] ?? null,
  listNotifications: (userId: number) => query(`SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, [userId]),
  getUnreadNotificationCount: async (userId: number) =>
    (await query(`SELECT COUNT(*)::int AS unread_count FROM notifications WHERE user_id = $1 AND is_read = FALSE`, [userId]))[0],
  listEvents: () => query(`SELECT * FROM school_events ORDER BY start_date DESC, created_at DESC`),
  getEvent: async (id: number) => (await query(`SELECT * FROM school_events WHERE id = $1`, [id]))[0] ?? null,
  listDiscipline: () => query(`SELECT * FROM discipline_incidents ORDER BY incident_date DESC, created_at DESC`),
  getDisciplineIncident: async (id: number) => (await query(`SELECT * FROM discipline_incidents WHERE id = $1`, [id]))[0] ?? null,
  getStudentDiscipline: (studentId: number) => query(`SELECT * FROM discipline_incidents WHERE student_id = $1 ORDER BY incident_date DESC`, [studentId]),
  listAuditLogs: () => query(`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500`),
  getAuditLog: async (id: number) => (await query(`SELECT * FROM audit_logs WHERE id = $1`, [id]))[0] ?? null,
  listBackups: () => query(`SELECT * FROM database_backups ORDER BY created_at DESC`),
  getBackup: async (id: number) => (await query(`SELECT * FROM database_backups WHERE id = $1`, [id]))[0] ?? null
};
