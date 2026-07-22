import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { query, withTransaction } from "../../config/database";
import { env } from "../../config/env";
import { writeAuditLog } from "../../utils/audit";
import { NotFoundError, ValidationAppError } from "../../utils/errors";
import { campusRepository } from "./campus.repository";

const execFileAsync = promisify(execFile);
const WINDOWS_POSTGRES_DIRS = [
  "C:\\Program Files\\PostgreSQL",
  "C:\\Program Files (x86)\\PostgreSQL"
];

const resolvePgDumpPath = async (): Promise<string> => {
  if (path.isAbsolute(env.PG_DUMP_PATH) && fs.existsSync(env.PG_DUMP_PATH)) {
    return env.PG_DUMP_PATH;
  }

  try {
    await execFileAsync(env.PG_DUMP_PATH, ["--version"]);
    return env.PG_DUMP_PATH;
  } catch {
    // Fall through to Windows-specific discovery below.
  }

  if (process.platform === "win32") {
    for (const baseDir of WINDOWS_POSTGRES_DIRS) {
      if (!fs.existsSync(baseDir)) continue;

      const versionDirs = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort((left, right) => right.localeCompare(left, undefined, { numeric: true }));

      for (const versionDir of versionDirs) {
        const candidate = path.join(baseDir, versionDir, "bin", "pg_dump.exe");
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  throw new NotFoundError(
    "pg_dump was not found. Set PG_DUMP_PATH in backend/.env to your PostgreSQL bin\\pg_dump executable."
  );
};

export const campusService = {
  listBookCategories: () => campusRepository.listBookCategories(),
  async getBookCategory(id: number) {
    const row = await campusRepository.getBookCategory(id);
    if (!row) throw new NotFoundError("Book category not found");
    return row;
  },
  async createBookCategory(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO book_categories (name, description) VALUES ($1,$2) RETURNING id`,
        [payload.name, payload.description ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "CREATE_BOOK_CATEGORY", tableName: "book_categories", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getBookCategory(id);
  },
  async updateBookCategory(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getBookCategory(id);
    await withTransaction(async (client) => {
      await client.query(`UPDATE book_categories SET name = COALESCE($2,name), description = COALESCE($3,description) WHERE id = $1`, [id, payload.name ?? null, payload.description ?? null]);
      await writeAuditLog(client, { userId: actorUserId, action: "UPDATE_BOOK_CATEGORY", tableName: "book_categories", recordId: id, newValues: payload, ipAddress });
    });
    return this.getBookCategory(id);
  },
  async deleteBookCategory(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM book_categories WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_BOOK_CATEGORY", tableName: "book_categories", recordId: id, ipAddress });
    });
  },

  listBooks: () => campusRepository.listBooks(),
  async getBook(id: number) {
    const row = await campusRepository.getBook(id);
    if (!row) throw new NotFoundError("Book not found");
    return row;
  },
  async createBook(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO books (
          category_id, isbn, title, author, publisher, publication_year, total_copies, available_copies, shelf_location
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [payload.categoryId ?? null, payload.isbn ?? null, payload.title, payload.author ?? null, payload.publisher ?? null, payload.publicationYear ?? null, payload.totalCopies ?? 1, payload.availableCopies ?? payload.totalCopies ?? 1, payload.shelfLocation ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "CREATE_BOOK", tableName: "books", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getBook(id);
  },
  async updateBook(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getBook(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE books
         SET category_id = COALESCE($2, category_id),
             isbn = COALESCE($3, isbn),
             title = COALESCE($4, title),
             author = COALESCE($5, author),
             publisher = COALESCE($6, publisher),
             publication_year = COALESCE($7, publication_year),
             total_copies = COALESCE($8, total_copies),
             available_copies = COALESCE($9, available_copies),
             shelf_location = COALESCE($10, shelf_location)
         WHERE id = $1`,
        [id, payload.categoryId ?? null, payload.isbn ?? null, payload.title ?? null, payload.author ?? null, payload.publisher ?? null, payload.publicationYear ?? null, payload.totalCopies ?? null, payload.availableCopies ?? null, payload.shelfLocation ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "UPDATE_BOOK", tableName: "books", recordId: id, newValues: payload, ipAddress });
    });
    return this.getBook(id);
  },
  async deleteBook(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM books WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_BOOK", tableName: "books", recordId: id, ipAddress });
    });
  },

  listBookLoans: () => campusRepository.listBookLoans(),
  async getBookLoan(id: number) {
    const row = await campusRepository.getBookLoan(id);
    if (!row) throw new NotFoundError("Book loan not found");
    return row;
  },
  async borrowBook(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (!payload.studentId && !payload.staffId) {
      throw new ValidationAppError("Validation failed", [{ field: "studentId", message: "A student or staff borrower is required" }]);
    }
    if (payload.studentId && payload.staffId) {
      throw new ValidationAppError("Validation failed", [{ field: "studentId", message: "A loan can belong to either a student or a staff member, not both" }]);
    }
    const id = await withTransaction(async (client) => {
      const bookRows = await client.query<{ available_copies: number }>(`SELECT available_copies FROM books WHERE id = $1 FOR UPDATE`, [payload.bookId]);
      const book = bookRows.rows[0];
      if (!book) throw new NotFoundError("Book not found");
      if (book.available_copies <= 0) {
        throw new ValidationAppError("Validation failed", [{ field: "bookId", message: "This book has no available copies" }]);
      }
      const result = await client.query<{ id: number }>(
        `INSERT INTO book_loans (book_id, student_id, staff_id, borrowed_date, due_date, status, issued_by)
         VALUES ($1,$2,$3,$4,$5,'BORROWED',$6)
         RETURNING id`,
        [payload.bookId, payload.studentId ?? null, payload.staffId ?? null, payload.borrowedDate, payload.dueDate, actorUserId]
      );
      await client.query(`UPDATE books SET available_copies = available_copies - 1 WHERE id = $1`, [payload.bookId]);
      await writeAuditLog(client, { userId: actorUserId, action: "BORROW_BOOK", tableName: "book_loans", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getBookLoan(id);
  },
  async returnBook(actorUserId: number, id: number, ipAddress: string | null) {
    const loan = await this.getBookLoan(id);
    if (loan.status === "RETURNED") {
      throw new ValidationAppError("Validation failed", [{ field: "id", message: "This loan was already returned" }]);
    }
    await withTransaction(async (client) => {
      await client.query(`UPDATE book_loans SET returned_date = CURRENT_DATE, status = 'RETURNED', received_by = $2 WHERE id = $1`, [id, actorUserId]);
      if (loan.status !== "LOST") {
        await client.query(`UPDATE books SET available_copies = available_copies + 1 WHERE id = $1`, [loan.book_id]);
      }
      await writeAuditLog(client, { userId: actorUserId, action: "RETURN_BOOK", tableName: "book_loans", recordId: id, ipAddress });
    });
    return this.getBookLoan(id);
  },
  async markLoanLost(actorUserId: number, id: number, ipAddress: string | null) {
    await this.getBookLoan(id);
    await withTransaction(async (client) => {
      await client.query(`UPDATE book_loans SET status = 'LOST' WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "MARK_BOOK_LOST", tableName: "book_loans", recordId: id, ipAddress });
    });
    return this.getBookLoan(id);
  },
  async deleteBookLoan(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM book_loans WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_BOOK_LOAN", tableName: "book_loans", recordId: id, ipAddress });
    });
  },
  getOverdueBookLoans: () => query(`SELECT * FROM book_loans WHERE status = 'BORROWED' AND due_date < CURRENT_DATE ORDER BY due_date ASC`),

  listAnnouncements: () => campusRepository.listAnnouncements(),
  async getAnnouncement(id: number) {
    const row = await campusRepository.getAnnouncement(id);
    if (!row) throw new NotFoundError("Announcement not found");
    return row;
  },
  async createAnnouncement(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    if (payload.audienceType === "SPECIFIC_CLASS" && !payload.classroomId) {
      throw new ValidationAppError("Validation failed", [{ field: "classroomId", message: "classroomId is required for SPECIFIC_CLASS announcements" }]);
    }
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO announcements (title, message, audience_type, classroom_id, published_by, expiry_date, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         RETURNING id`,
        [payload.title, payload.message, payload.audienceType, payload.classroomId ?? null, actorUserId, payload.expiryDate ?? null, payload.isActive ?? true]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "CREATE_ANNOUNCEMENT", tableName: "announcements", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getAnnouncement(id);
  },
  async updateAnnouncement(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getAnnouncement(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE announcements
         SET title = COALESCE($2, title),
             message = COALESCE($3, message),
             audience_type = COALESCE($4, audience_type),
             classroom_id = COALESCE($5, classroom_id),
             expiry_date = COALESCE($6, expiry_date),
             is_active = COALESCE($7, is_active)
         WHERE id = $1`,
        [id, payload.title ?? null, payload.message ?? null, payload.audienceType ?? null, payload.classroomId ?? null, payload.expiryDate ?? null, payload.isActive ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "UPDATE_ANNOUNCEMENT", tableName: "announcements", recordId: id, newValues: payload, ipAddress });
    });
    return this.getAnnouncement(id);
  },
  async deleteAnnouncement(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM announcements WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_ANNOUNCEMENT", tableName: "announcements", recordId: id, ipAddress });
    });
  },

  listNotifications: (userId: number) => campusRepository.listNotifications(userId),
  getUnreadNotificationCount: async (userId: number) => campusRepository.getUnreadNotificationCount(userId),
  async markNotificationRead(userId: number, id: number) {
    await withTransaction(async (client) => {
      await client.query(`UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2`, [id, userId]);
    });
    return { id };
  },
  async markAllNotificationsRead(userId: number) {
    await withTransaction(async (client) => {
      await client.query(`UPDATE notifications SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND is_read = FALSE`, [userId]);
    });
    return {};
  },
  async deleteNotification(userId: number, id: number) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, [id, userId]);
    });
  },

  listEvents: () => campusRepository.listEvents(),
  async getEvent(id: number) {
    const row = await campusRepository.getEvent(id);
    if (!row) throw new NotFoundError("Event not found");
    return row;
  },
  async createEvent(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO school_events (
          title, description, event_type, start_date, end_date, start_time, end_time, location, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [payload.title, payload.description ?? null, payload.eventType, payload.startDate, payload.endDate, payload.startTime ?? null, payload.endTime ?? null, payload.location ?? null, actorUserId]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "CREATE_EVENT", tableName: "school_events", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getEvent(id);
  },
  async updateEvent(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getEvent(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE school_events
         SET title = COALESCE($2, title),
             description = COALESCE($3, description),
             event_type = COALESCE($4, event_type),
             start_date = COALESCE($5, start_date),
             end_date = COALESCE($6, end_date),
             start_time = COALESCE($7, start_time),
             end_time = COALESCE($8, end_time),
             location = COALESCE($9, location)
         WHERE id = $1`,
        [id, payload.title ?? null, payload.description ?? null, payload.eventType ?? null, payload.startDate ?? null, payload.endDate ?? null, payload.startTime ?? null, payload.endTime ?? null, payload.location ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "UPDATE_EVENT", tableName: "school_events", recordId: id, newValues: payload, ipAddress });
    });
    return this.getEvent(id);
  },
  async deleteEvent(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM school_events WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_EVENT", tableName: "school_events", recordId: id, ipAddress });
    });
  },

  listDiscipline: () => campusRepository.listDiscipline(),
  async getDisciplineIncident(id: number) {
    const row = await campusRepository.getDisciplineIncident(id);
    if (!row) throw new NotFoundError("Discipline incident not found");
    return row;
  },
  getStudentDiscipline: (studentId: number) => campusRepository.getStudentDiscipline(studentId),
  async createDisciplineIncident(actorUserId: number, payload: Record<string, unknown>, ipAddress: string | null) {
    const id = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO discipline_incidents (
          student_id, incident_date, incident_type, description, action_taken, reported_by, handled_by, status
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
        [payload.studentId, payload.incidentDate, payload.incidentType, payload.description, payload.actionTaken ?? null, actorUserId, payload.handledBy ?? null, payload.status ?? "OPEN"]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "CREATE_DISCIPLINE_INCIDENT", tableName: "discipline_incidents", recordId: result.rows[0].id, newValues: payload, ipAddress });
      return result.rows[0].id;
    });
    return this.getDisciplineIncident(id);
  },
  async updateDisciplineIncident(actorUserId: number, id: number, payload: Record<string, unknown>, ipAddress: string | null) {
    await this.getDisciplineIncident(id);
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE discipline_incidents
         SET student_id = COALESCE($2, student_id),
             incident_date = COALESCE($3, incident_date),
             incident_type = COALESCE($4, incident_type),
             description = COALESCE($5, description),
             action_taken = COALESCE($6, action_taken),
             handled_by = COALESCE($7, handled_by),
             status = COALESCE($8, status)
         WHERE id = $1`,
        [id, payload.studentId ?? null, payload.incidentDate ?? null, payload.incidentType ?? null, payload.description ?? null, payload.actionTaken ?? null, payload.handledBy ?? null, payload.status ?? null]
      );
      await writeAuditLog(client, { userId: actorUserId, action: "UPDATE_DISCIPLINE_INCIDENT", tableName: "discipline_incidents", recordId: id, newValues: payload, ipAddress });
    });
    return this.getDisciplineIncident(id);
  },
  async deleteDisciplineIncident(actorUserId: number, id: number, ipAddress: string | null) {
    await withTransaction(async (client) => {
      await client.query(`DELETE FROM discipline_incidents WHERE id = $1`, [id]);
      await writeAuditLog(client, { userId: actorUserId, action: "DELETE_DISCIPLINE_INCIDENT", tableName: "discipline_incidents", recordId: id, ipAddress });
    });
  },

  listAuditLogs: () => campusRepository.listAuditLogs(),
  async getAuditLog(id: number) {
    const row = await campusRepository.getAuditLog(id);
    if (!row) throw new NotFoundError("Audit log not found");
    return row;
  },

  listBackups: () => campusRepository.listBackups(),
  async getBackup(id: number) {
    const row = await campusRepository.getBackup(id);
    if (!row) throw new NotFoundError("Backup record not found");
    return row;
  },
  async createBackup(actorUserId: number, ipAddress: string | null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupName = `school-management-backup-${timestamp}.sql`;
    const backupDir = path.resolve(process.cwd(), env.BACKUP_DIR);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const filePath = path.join(backupDir, backupName);
    const pgDumpPath = await resolvePgDumpPath();

    const backupId = await withTransaction(async (client) => {
      const result = await client.query<{ id: number }>(
        `INSERT INTO database_backups (backup_name, file_path, backup_type, created_by, status)
         VALUES ($1,$2,'MANUAL',$3,'STARTED')
         RETURNING id`,
        [backupName, filePath, actorUserId]
      );
      return result.rows[0].id;
    });

    try {
      await execFileAsync(pgDumpPath, [
        "-h",
        env.DB_HOST,
        "-p",
        String(env.DB_PORT),
        "-U",
        env.DB_USER,
        "-d",
        env.DB_NAME,
        "-f",
        filePath
      ], {
        env: {
          ...process.env,
          PGPASSWORD: env.DB_PASSWORD
        }
      });

      const size = fs.statSync(filePath).size;
      await withTransaction(async (client) => {
        await client.query(`UPDATE database_backups SET backup_size = $2, status = 'COMPLETED' WHERE id = $1`, [backupId, size]);
        await writeAuditLog(client, { userId: actorUserId, action: "CREATE_BACKUP", tableName: "database_backups", recordId: backupId, ipAddress });
      });
    } catch (error) {
      await withTransaction(async (client) => {
        await client.query(`UPDATE database_backups SET status = 'FAILED' WHERE id = $1`, [backupId]);
      });
      throw error;
    }

    return this.getBackup(backupId);
  }
};
