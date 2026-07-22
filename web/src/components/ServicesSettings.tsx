import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  BookOpen,
  HardDriveDownload,
  Megaphone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';

interface ApiStudent {
  id: number;
  admission_number: string;
  first_name: string;
  last_name: string;
}

interface ApiBookCategory {
  id: number;
  name: string;
}

interface ApiBook {
  id: number;
  title: string;
  author?: string | null;
  isbn?: string | null;
  total_copies?: number;
  available_copies?: number;
}

interface ApiBookLoan {
  id: number;
  book_id: number;
  student_id?: number | null;
  borrowed_date: string;
  due_date: string;
  returned_date?: string | null;
  status: string;
}

interface ApiAnnouncement {
  id: number;
  title: string;
  message: string;
  audience_type: string;
  published_at?: string;
  expiry_date?: string | null;
  is_active?: boolean;
}

interface ApiEvent {
  id: number;
  title: string;
  description?: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  location?: string | null;
}

interface ApiDiscipline {
  id: number;
  student_id: number;
  incident_date: string;
  incident_type: string;
  description: string;
  status: string;
  action_taken?: string | null;
}

interface ApiAuditLog {
  id: number;
  action: string;
  table_name?: string | null;
  record_id?: number | null;
  created_at?: string;
  ip_address?: string | null;
}

interface ApiBackup {
  id: number;
  backup_name?: string;
  backup_path?: string;
  file_size_bytes?: number | null;
  status?: string;
  created_at?: string;
}

interface ApiSchoolSettings {
  school_name?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  timezone?: string | null;
}

const today = '2026-07-22';

const formatDate = (value?: string | null) => (value ? String(value).slice(0, 10) : 'N/A');
const formatBytes = (value?: number | null) => {
  const size = Number(value ?? 0);
  if (!size) return 'N/A';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export default function ServicesSettings() {
  const { activeTab, openConfirm } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [bookCategories, setBookCategories] = useState<ApiBookCategory[]>([]);
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [bookLoans, setBookLoans] = useState<ApiBookLoan[]>([]);
  const [announcements, setAnnouncements] = useState<ApiAnnouncement[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [discipline, setDiscipline] = useState<ApiDiscipline[]>([]);
  const [auditLogs, setAuditLogs] = useState<ApiAuditLog[]>([]);
  const [backups, setBackups] = useState<ApiBackup[]>([]);
  const [schoolSettings, setSchoolSettings] = useState<ApiSchoolSettings>({});

  const [showBookForm, setShowBookForm] = useState(false);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);

  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookCategoryId, setBookCategoryId] = useState('');
  const [bookCopies, setBookCopies] = useState('1');

  const [loanBookId, setLoanBookId] = useState('');
  const [loanStudentId, setLoanStudentId] = useState('');
  const [loanBorrowedDate, setLoanBorrowedDate] = useState(today);
  const [loanDueDate, setLoanDueDate] = useState(today);

  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementAudience, setAnnouncementAudience] = useState<'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'STAFF'>('ALL');

  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<'SCHOOL_EVENT' | 'MEETING' | 'HOLIDAY' | 'EXAMINATION' | 'PARENT_MEETING' | 'OTHER'>('SCHOOL_EVENT');
  const [eventStartDate, setEventStartDate] = useState(today);
  const [eventEndDate, setEventEndDate] = useState(today);
  const [eventLocation, setEventLocation] = useState('');

  const [disciplineStudentId, setDisciplineStudentId] = useState('');
  const [disciplineDate, setDisciplineDate] = useState(today);
  const [disciplineType, setDisciplineType] = useState('');
  const [disciplineDescription, setDisciplineDescription] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolPhone, setSchoolPhone] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolTimezone, setSchoolTimezone] = useState('');
  const [libraryFilter, setLibraryFilter] = useState('');
  const [loanFilter, setLoanFilter] = useState('');
  const [announcementFilter, setAnnouncementFilter] = useState('');
  const [eventFilter, setEventFilter] = useState('');
  const [disciplineFilter, setDisciplineFilter] = useState('');
  const [auditFilter, setAuditFilter] = useState('');

  const studentNameById = new Map(students.map((item) => [item.id, `${item.first_name} ${item.last_name}`]));
  const bookTitleById = new Map(books.map((item) => [item.id, item.title]));
  const filteredBooks = books.filter((item) => `${item.title} ${item.author || ''} ${item.isbn || ''}`.toLowerCase().includes(libraryFilter.toLowerCase()));
  const filteredBookLoans = bookLoans.filter((item) => `${bookTitleById.get(item.book_id) || ''} ${item.student_id ? studentNameById.get(item.student_id) || '' : ''} ${item.status}`.toLowerCase().includes(loanFilter.toLowerCase()));
  const filteredAnnouncements = announcements.filter((item) => `${item.title} ${item.message} ${item.audience_type}`.toLowerCase().includes(announcementFilter.toLowerCase()));
  const filteredEvents = events.filter((item) => `${item.title} ${item.event_type} ${item.location || ''}`.toLowerCase().includes(eventFilter.toLowerCase()));
  const filteredDiscipline = discipline.filter((item) => `${studentNameById.get(item.student_id) || ''} ${item.incident_type} ${item.description} ${item.status}`.toLowerCase().includes(disciplineFilter.toLowerCase()));
  const filteredAuditLogs = auditLogs.filter((item) => `${item.action} ${item.table_name || ''} ${item.record_id || ''} ${item.ip_address || ''}`.toLowerCase().includes(auditFilter.toLowerCase()));

  const loadSectionData = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (activeTab === 'library') {
        const [categoriesResponse, booksResponse, loansResponse, studentsResponse] = await Promise.all([
          axiosClient.get('/book-categories'),
          axiosClient.get('/books'),
          axiosClient.get('/book-loans'),
          axiosClient.get('/students'),
        ]);
        setBookCategories(categoriesResponse.data?.data || []);
        setBooks(booksResponse.data?.data || []);
        setBookLoans(loansResponse.data?.data || []);
        setStudents(studentsResponse.data?.data || []);
      } else if (activeTab === 'announcements') {
        const [announcementsResponse, eventsResponse] = await Promise.all([
          axiosClient.get('/announcements'),
          axiosClient.get('/events'),
        ]);
        setAnnouncements(announcementsResponse.data?.data || []);
        setEvents(eventsResponse.data?.data || []);
      } else if (activeTab === 'discipline') {
        const [disciplineResponse, studentsResponse] = await Promise.all([
          axiosClient.get('/discipline'),
          axiosClient.get('/students'),
        ]);
        setDiscipline(disciplineResponse.data?.data || []);
        setStudents(studentsResponse.data?.data || []);
      } else if (activeTab === 'settings') {
        const [settingsResponse, backupsResponse] = await Promise.all([
          axiosClient.get('/school-settings'),
          axiosClient.get('/backups'),
        ]);
        const nextSettings = settingsResponse.data?.data || {};
        setSchoolSettings(nextSettings);
        setSchoolName(nextSettings.school_name || '');
        setSchoolAddress(nextSettings.address || '');
        setSchoolPhone(nextSettings.phone || '');
        setSchoolEmail(nextSettings.email || '');
        setSchoolTimezone(nextSettings.timezone || '');
        setBackups(backupsResponse.data?.data || []);
      } else if (activeTab === 'audit') {
        const response = await axiosClient.get('/audit-logs');
        setAuditLogs(response.data?.data || []);
      }
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Unable to load real backend records for this module.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSectionData();
  }, [activeTab]);

  const handleCreateBook = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/books', {
        categoryId: bookCategoryId ? Number(bookCategoryId) : undefined,
        title: bookTitle,
        author: bookAuthor || undefined,
        isbn: bookIsbn || undefined,
        totalCopies: Number(bookCopies),
      });
      toast.success('Book created successfully.');
      setBookTitle('');
      setBookAuthor('');
      setBookIsbn('');
      setBookCategoryId('');
      setBookCopies('1');
      setShowBookForm(false);
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create book.');
    }
  };

  const handleBorrowBook = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/book-loans/borrow', {
        bookId: Number(loanBookId),
        studentId: Number(loanStudentId),
        borrowedDate: loanBorrowedDate,
        dueDate: loanDueDate,
      });
      toast.success('Book loan created successfully.');
      setLoanBookId('');
      setLoanStudentId('');
      setLoanBorrowedDate(today);
      setLoanDueDate(today);
      setShowLoanForm(false);
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create book loan.');
    }
  };

  const handleReturnBook = async (loanId: number) => {
    const confirmed = await openConfirm({
      title: 'Return book?',
      message: 'Are you sure you want to mark this book loan as returned?',
      confirmLabel: 'Return Book',
      tone: 'primary',
    });
    if (!confirmed) return;

    try {
      await axiosClient.post(`/book-loans/${loanId}/return`);
      toast.success('Book returned successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to return book.');
    }
  };

  const handleCreateAnnouncement = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/announcements', {
        title: announcementTitle,
        message: announcementMessage,
        audienceType: announcementAudience,
        isActive: true,
      });
      toast.success('Announcement created successfully.');
      setAnnouncementTitle('');
      setAnnouncementMessage('');
      setAnnouncementAudience('ALL');
      setShowAnnouncementForm(false);
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create announcement.');
    }
  };

  const handleCreateEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/events', {
        title: eventTitle,
        description: eventDescription || undefined,
        eventType,
        startDate: eventStartDate,
        endDate: eventEndDate,
        location: eventLocation || undefined,
      });
      toast.success('Event created successfully.');
      setEventTitle('');
      setEventDescription('');
      setEventType('SCHOOL_EVENT');
      setEventStartDate(today);
      setEventEndDate(today);
      setEventLocation('');
      setShowEventForm(false);
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create event.');
    }
  };

  const handleCreateDiscipline = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.post('/discipline', {
        studentId: Number(disciplineStudentId),
        incidentDate: disciplineDate,
        incidentType: disciplineType,
        description: disciplineDescription,
        status: 'OPEN',
      });
      toast.success('Discipline incident created successfully.');
      setDisciplineStudentId('');
      setDisciplineDate(today);
      setDisciplineType('');
      setDisciplineDescription('');
      setShowDisciplineForm(false);
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create discipline incident.');
    }
  };

  const handleSaveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axiosClient.patch('/school-settings', {
        schoolName,
        address: schoolAddress || undefined,
        phone: schoolPhone || undefined,
        email: schoolEmail || undefined,
        timezone: schoolTimezone || undefined,
      });
      toast.success('School settings updated successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to update school settings.');
    }
  };

  const handleCreateBackup = async () => {
    try {
      await axiosClient.post('/backups');
      toast.success('Backup created successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to create backup.');
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Delete announcement?',
      message: 'Are you sure you want to delete this announcement?',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/announcements/${id}`);
      toast.success('Announcement deleted successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete announcement.');
    }
  };

  const handleDeleteEvent = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Delete event?',
      message: 'Are you sure you want to delete this event?',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/events/${id}`);
      toast.success('Event deleted successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete event.');
    }
  };

  const handleDeleteDiscipline = async (id: number) => {
    const confirmed = await openConfirm({
      title: 'Delete incident?',
      message: 'Are you sure you want to delete this discipline incident?',
      confirmLabel: 'Delete',
    });
    if (!confirmed) return;

    try {
      await axiosClient.delete(`/discipline/${id}`);
      toast.success('Discipline incident deleted successfully.');
      await loadSectionData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Unable to delete discipline incident.');
    }
  };

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading module data...</div>;
  }

  return (
    <div id="services-settings-view" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <h1 className="text-base font-black text-slate-800">
          {activeTab === 'library' && 'Library Management'}
          {activeTab === 'announcements' && 'Announcements & Events'}
          {activeTab === 'discipline' && 'Discipline Management'}
          {activeTab === 'settings' && 'School Settings & Backups'}
          {activeTab === 'audit' && 'Audit Logs'}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">This screen now reads and writes real backend data only.</p>
      </div>

      <div className="space-y-6 p-6">
        {errorMessage ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{errorMessage}</div> : null}

        {activeTab === 'library' ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowBookForm((value) => !value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                <Plus className="mr-1 inline h-4 w-4" />
                Add Book
              </button>
              <button onClick={() => setShowLoanForm((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                <BookOpen className="mr-1 inline h-4 w-4" />
                Issue Loan
              </button>
            </div>

            {showBookForm ? (
              <form onSubmit={handleCreateBook} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5">
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Book title" value={bookTitle} onChange={(event) => setBookTitle(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Author" value={bookAuthor} onChange={(event) => setBookAuthor(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="ISBN" value={bookIsbn} onChange={(event) => setBookIsbn(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={bookCategoryId} onChange={(event) => setBookCategoryId(event.target.value)}>
                  <option value="">Category</option>
                  {bookCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
                <input type="number" min="1" className="rounded border bg-white px-3 py-2 text-xs" placeholder="Copies" value={bookCopies} onChange={(event) => setBookCopies(event.target.value)} />
                <div className="md:col-span-5 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowBookForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Save Book</button>
                </div>
              </form>
            ) : null}

            {showLoanForm ? (
              <form onSubmit={handleBorrowBook} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-4">
                <select className="rounded border bg-white px-3 py-2 text-xs" value={loanBookId} onChange={(event) => setLoanBookId(event.target.value)}>
                  <option value="">Book</option>
                  {books.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
                <select className="rounded border bg-white px-3 py-2 text-xs" value={loanStudentId} onChange={(event) => setLoanStudentId(event.target.value)}>
                  <option value="">Student</option>
                  {students.map((item) => <option key={item.id} value={item.id}>{item.admission_number} - {item.first_name} {item.last_name}</option>)}
                </select>
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={loanBorrowedDate} onChange={(event) => setLoanBorrowedDate(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={loanDueDate} onChange={(event) => setLoanDueDate(event.target.value)} />
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowLoanForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Issue Loan</button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Books</div>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    placeholder="Filter books by title, author, or ISBN"
                    value={libraryFilter}
                    onChange={(event) => setLibraryFilter(event.target.value)}
                  />
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">ISBN</th>
                      <th className="px-4 py-3">Copies</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBooks.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900">{item.title}</div>
                          <div className="text-slate-500">{item.author || 'No author'}</div>
                        </td>
                        <td className="px-4 py-3">{item.isbn || 'N/A'}</td>
                        <td className="px-4 py-3">{item.available_copies ?? 0} / {item.total_copies ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Book Loans</div>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    placeholder="Filter loans by book, student, or status"
                    value={loanFilter}
                    onChange={(event) => setLoanFilter(event.target.value)}
                  />
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Book</th>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredBookLoans.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{bookTitleById.get(item.book_id) || `Book #${item.book_id}`}</td>
                        <td className="px-4 py-3">{item.student_id ? studentNameById.get(item.student_id) || `Student #${item.student_id}` : 'N/A'}</td>
                        <td className="px-4 py-3">{item.status}</td>
                        <td className="px-4 py-3 text-right">
                          {String(item.status).toUpperCase() !== 'RETURNED' ? (
                            <button onClick={() => void handleReturnBook(item.id)} className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
                              Return
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'announcements' ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowAnnouncementForm((value) => !value)} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                <Megaphone className="mr-1 inline h-4 w-4" />
                New Announcement
              </button>
              <button onClick={() => setShowEventForm((value) => !value)} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700">
                <Plus className="mr-1 inline h-4 w-4" />
                New Event
              </button>
            </div>

            {showAnnouncementForm ? (
              <form onSubmit={handleCreateAnnouncement} className="grid grid-cols-1 gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 md:grid-cols-3">
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Announcement title" value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={announcementAudience} onChange={(event) => setAnnouncementAudience(event.target.value as 'ALL' | 'TEACHERS' | 'STUDENTS' | 'PARENTS' | 'STAFF')}>
                  <option value="ALL">All</option>
                  <option value="TEACHERS">Teachers</option>
                  <option value="STUDENTS">Students</option>
                  <option value="PARENTS">Parents</option>
                  <option value="STAFF">Staff</option>
                </select>
                <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-3" rows={3} placeholder="Message" value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} />
                <div className="md:col-span-3 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAnnouncementForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Publish</button>
                </div>
              </form>
            ) : null}

            {showEventForm ? (
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4">
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Event title" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} />
                <select className="rounded border bg-white px-3 py-2 text-xs" value={eventType} onChange={(event) => setEventType(event.target.value as 'SCHOOL_EVENT' | 'MEETING' | 'HOLIDAY' | 'EXAMINATION' | 'PARENT_MEETING' | 'OTHER')}>
                  <option value="SCHOOL_EVENT">School Event</option>
                  <option value="MEETING">Meeting</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="EXAMINATION">Examination</option>
                  <option value="PARENT_MEETING">Parent Meeting</option>
                  <option value="OTHER">Other</option>
                </select>
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={eventStartDate} onChange={(event) => setEventStartDate(event.target.value)} />
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={eventEndDate} onChange={(event) => setEventEndDate(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs md:col-span-2" placeholder="Location" value={eventLocation} onChange={(event) => setEventLocation(event.target.value)} />
                <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-4" rows={3} placeholder="Description" value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} />
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowEventForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">Create Event</button>
                </div>
              </form>
            ) : null}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Announcements</div>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    placeholder="Filter announcements by title, audience, or message"
                    value={announcementFilter}
                    onChange={(event) => setAnnouncementFilter(event.target.value)}
                  />
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredAnnouncements.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-slate-500">{item.message}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{item.audience_type} | {formatDate(item.published_at)}</p>
                      </div>
                      <button onClick={() => void handleDeleteAnnouncement(item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-black text-slate-800">Events</div>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <input
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                    placeholder="Filter events by title, type, or location"
                    value={eventFilter}
                    onChange={(event) => setEventFilter(event.target.value)}
                  />
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredEvents.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3 text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-slate-500">{item.event_type} | {formatDate(item.start_date)} to {formatDate(item.end_date)}</p>
                        <p className="mt-1 text-slate-400">{item.location || 'No location'}</p>
                      </div>
                      <button onClick={() => void handleDeleteEvent(item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : null}

        {activeTab === 'discipline' ? (
          <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setShowDisciplineForm((value) => !value)} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white">
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                New Incident
              </button>
            </div>

            {showDisciplineForm ? (
              <form onSubmit={handleCreateDiscipline} className="grid grid-cols-1 gap-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 md:grid-cols-4">
                <select className="rounded border bg-white px-3 py-2 text-xs" value={disciplineStudentId} onChange={(event) => setDisciplineStudentId(event.target.value)}>
                  <option value="">Student</option>
                  {students.map((item) => <option key={item.id} value={item.id}>{item.admission_number} - {item.first_name} {item.last_name}</option>)}
                </select>
                <input type="date" className="rounded border bg-white px-3 py-2 text-xs" value={disciplineDate} onChange={(event) => setDisciplineDate(event.target.value)} />
                <input className="rounded border bg-white px-3 py-2 text-xs" placeholder="Incident type" value={disciplineType} onChange={(event) => setDisciplineType(event.target.value)} />
                <textarea className="rounded border bg-white px-3 py-2 text-xs md:col-span-4" rows={3} placeholder="Description" value={disciplineDescription} onChange={(event) => setDisciplineDescription(event.target.value)} />
                <div className="md:col-span-4 flex justify-end gap-2">
                  <button type="button" onClick={() => setShowDisciplineForm(false)} className="rounded border bg-white px-3 py-2 text-xs font-bold text-slate-600">Cancel</button>
                  <button type="submit" className="rounded bg-rose-600 px-4 py-2 text-xs font-bold text-white">Create Incident</button>
                </div>
              </form>
            ) : null}

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  placeholder="Filter incidents by student, type, or status"
                  value={disciplineFilter}
                  onChange={(event) => setDisciplineFilter(event.target.value)}
                />
              </div>
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action Taken</th>
                    <th className="px-4 py-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDiscipline.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">{studentNameById.get(item.student_id) || `Student #${item.student_id}`}</td>
                      <td className="px-4 py-3">{formatDate(item.incident_date)}</td>
                      <td className="px-4 py-3">{item.incident_type}</td>
                      <td className="px-4 py-3">{item.status}</td>
                      <td className="px-4 py-3">{item.action_taken || 'Pending'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => void handleDeleteDiscipline(item.id)} className="rounded border border-rose-200 bg-rose-50 p-2 text-rose-700">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {activeTab === 'settings' ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <form onSubmit={handleSaveSettings} className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">School Settings</h3>
              <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="School name" value={schoolName} onChange={(event) => setSchoolName(event.target.value)} />
              <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Address" value={schoolAddress} onChange={(event) => setSchoolAddress(event.target.value)} />
              <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Phone" value={schoolPhone} onChange={(event) => setSchoolPhone(event.target.value)} />
              <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Email" value={schoolEmail} onChange={(event) => setSchoolEmail(event.target.value)} />
              <input className="w-full rounded border bg-white px-3 py-2 text-xs" placeholder="Timezone" value={schoolTimezone} onChange={(event) => setSchoolTimezone(event.target.value)} />
              <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-xs font-bold text-white">
                <Save className="mr-1 inline h-4 w-4" />
                Save Settings
              </button>
            </form>

            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">Database Backups</h3>
                <button onClick={() => void handleCreateBackup()} className="rounded bg-emerald-600 px-4 py-2 text-xs font-bold text-white">
                  <HardDriveDownload className="mr-1 inline h-4 w-4" />
                  Create Backup
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {backups.map((item) => (
                  <div key={item.id} className="py-3 text-xs">
                    <p className="font-bold text-slate-900">{item.backup_name || item.backup_path || `Backup #${item.id}`}</p>
                    <p className="mt-1 text-slate-500">{item.status || 'UNKNOWN'} | {formatBytes(item.file_size_bytes)} | {formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {activeTab === 'audit' ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-200">
            <div className="mb-3 flex items-center gap-2 text-blue-300">
              <ShieldCheck className="h-4 w-4" />
              Live audit records from the backend
            </div>
            <div className="mb-4">
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500"
                placeholder="Filter audit logs by action, table, record, or IP"
                value={auditFilter}
                onChange={(event) => setAuditFilter(event.target.value)}
              />
            </div>
            <div className="max-h-[28rem] space-y-2 overflow-y-auto">
              {filteredAuditLogs.map((item) => (
                <div key={item.id} className="border-b border-slate-800 pb-2 last:border-b-0">
                  <span className="text-emerald-300">{formatDate(item.created_at)}</span>{' '}
                  <span className="text-sky-300">{item.action}</span>{' '}
                  <span className="text-slate-400">{item.table_name || 'system'}</span>{' '}
                  <span className="text-slate-500">{item.record_id ? `#${item.record_id}` : ''}</span>
                  {item.ip_address ? <span className="ml-2 text-slate-500">{item.ip_address}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
