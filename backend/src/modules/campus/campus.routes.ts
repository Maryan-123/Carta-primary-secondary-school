import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorizePermissions } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import {
  borrowBook,
  createAnnouncement,
  createBackup,
  createBook,
  createBookCategory,
  createDisciplineIncident,
  createEvent,
  deleteAnnouncement,
  deleteBook,
  deleteBookCategory,
  deleteBookLoan,
  deleteDisciplineIncident,
  deleteEvent,
  deleteNotification,
  getAnnouncement,
  getAuditLog,
  getBackup,
  getBook,
  getBookCategory,
  getBookLoan,
  getDisciplineIncident,
  getEvent,
  getOverdueBookLoans,
  getStudentDiscipline,
  getUnreadNotificationCount,
  listAnnouncements,
  listAuditLogs,
  listBackups,
  listBookCategories,
  listBookLoans,
  listBooks,
  listDiscipline,
  listEvents,
  listNotifications,
  markAllNotificationsRead,
  markLoanLost,
  markNotificationRead,
  returnBook,
  updateAnnouncement,
  updateBook,
  updateBookCategory,
  updateDisciplineIncident,
  updateEvent
} from "./campus.controller";
import {
  announcementSchema,
  bookCategorySchema,
  bookLoanSchema,
  bookSchema,
  disciplineSchema,
  eventSchema
} from "./campus.validator";

const router = Router();

router.use(authenticate);

router.get("/book-categories", authorizePermissions("library.manage"), listBookCategories);
router.get("/book-categories/:id", authorizePermissions("library.manage"), getBookCategory);
router.post("/book-categories", authorizePermissions("library.manage"), validate(bookCategorySchema), createBookCategory);
router.patch("/book-categories/:id", authorizePermissions("library.manage"), validate(bookCategorySchema.partial()), updateBookCategory);
router.delete("/book-categories/:id", authorizePermissions("library.manage"), deleteBookCategory);

router.get("/books", authorizePermissions("library.manage"), listBooks);
router.get("/books/:id", authorizePermissions("library.manage"), getBook);
router.post("/books", authorizePermissions("library.manage"), validate(bookSchema), createBook);
router.patch("/books/:id", authorizePermissions("library.manage"), validate(bookSchema.partial()), updateBook);
router.delete("/books/:id", authorizePermissions("library.manage"), deleteBook);

router.get("/book-loans", authorizePermissions("library.manage"), listBookLoans);
router.get("/book-loans/overdue", authorizePermissions("library.manage"), getOverdueBookLoans);
router.get("/book-loans/:id", authorizePermissions("library.manage"), getBookLoan);
router.post("/book-loans/borrow", authorizePermissions("library.manage"), validate(bookLoanSchema), borrowBook);
router.post("/book-loans/:id/return", authorizePermissions("library.manage"), returnBook);
router.post("/book-loans/:id/mark-lost", authorizePermissions("library.manage"), markLoanLost);
router.delete("/book-loans/:id", authorizePermissions("library.manage"), deleteBookLoan);

router.get("/announcements", listAnnouncements);
router.get("/announcements/:id", getAnnouncement);
router.post("/announcements", authorizePermissions("announcements.manage"), validate(announcementSchema), createAnnouncement);
router.patch("/announcements/:id", authorizePermissions("announcements.manage"), validate(announcementSchema.partial()), updateAnnouncement);
router.delete("/announcements/:id", authorizePermissions("announcements.manage"), deleteAnnouncement);

router.get("/notifications", listNotifications);
router.get("/notifications/unread-count", getUnreadNotificationCount);
router.patch("/notifications/:id/read", markNotificationRead);
router.patch("/notifications/read-all", markAllNotificationsRead);
router.delete("/notifications/:id", deleteNotification);

router.get("/events", listEvents);
router.get("/events/:id", getEvent);
router.post("/events", authorizePermissions("announcements.manage"), validate(eventSchema), createEvent);
router.patch("/events/:id", authorizePermissions("announcements.manage"), validate(eventSchema.partial()), updateEvent);
router.delete("/events/:id", authorizePermissions("announcements.manage"), deleteEvent);

router.get("/discipline", authorizePermissions("students.view"), listDiscipline);
router.get("/discipline/:id", authorizePermissions("students.view"), getDisciplineIncident);
router.get("/discipline/student/:studentId", authorizePermissions("students.view"), getStudentDiscipline);
router.post("/discipline", authorizePermissions("students.update"), validate(disciplineSchema), createDisciplineIncident);
router.patch("/discipline/:id", authorizePermissions("students.update"), validate(disciplineSchema.partial()), updateDisciplineIncident);
router.delete("/discipline/:id", authorizePermissions("students.update"), deleteDisciplineIncident);

router.get("/audit-logs", authorizePermissions("audit.view"), listAuditLogs);
router.get("/audit-logs/:id", authorizePermissions("audit.view"), getAuditLog);

router.get("/backups", authorizePermissions("settings.manage"), listBackups);
router.get("/backups/:id", authorizePermissions("settings.manage"), getBackup);
router.post("/backups", authorizePermissions("settings.manage"), createBackup);

export { router as campusRoutes };
