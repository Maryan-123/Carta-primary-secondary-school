import React, { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';
import { BookText, CalendarDays, CreditCard, Eye, GraduationCap, Library, Megaphone, School, UserRound } from 'lucide-react';
import InvoicePreviewModal from './InvoicePreviewModal';
import {
  Cell as ReCell,
  Legend as ReLegend,
  Pie as RePie,
  PieChart as RePieChart,
  ResponsiveContainer as ReResponsiveContainer,
  Tooltip as ReTooltip,
} from 'recharts';

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-[#c7d7ff] bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_52%,#eef8f2_100%)] p-5 shadow-[0_18px_50px_rgba(18,59,138,0.09)]">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-[linear-gradient(135deg,#dce8ff_0%,#dcf5e8_100%)] p-2.5 text-[#123B8A] shadow-sm">{icon}</div>
        <h2 className="text-sm font-black uppercase tracking-[0.24em] text-[#123B8A]">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-2xl border border-dashed border-[#c7d7ff] bg-[linear-gradient(135deg,#eef4ff_0%,#ecf8f1_100%)] px-4 py-6 text-sm text-[#4b648b]">{message}</p>;
}

function ListBlock({
  items,
  emptyMessage,
  renderItem,
}: {
  items: any[];
  emptyMessage: string;
  renderItem: (item: any, index: number) => React.ReactNode;
}) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return <div className="space-y-3">{items.map((item, index) => <React.Fragment key={item.id ?? index}>{renderItem(item, index)}</React.Fragment>)}</div>;
}

export default function StudentPortal() {
  const { currentUser, activeTab } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [selectedAttendanceSubject, setSelectedAttendanceSubject] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!currentUser) return;

      setLoading(true);
      setError('');
      try {
        const response = await axiosClient.get('/dashboard/student');
        setData(response.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load student portal data.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [currentUser]);

  const attendanceSubjectOptions = useMemo(() => {
    const seen = new Set<string>();
    return (data?.timetable || []).filter((item: any) => {
      const key = String(item.subject_name || '');
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [data?.timetable]);

  useEffect(() => {
    if (!attendanceSubjectOptions.length) {
      setSelectedAttendanceSubject('');
      return;
    }
    const validSubjects = new Set(attendanceSubjectOptions.map((item: any) => String(item.subject_name || '')));
    setSelectedAttendanceSubject((prev) => (prev && validSubjects.has(prev) ? prev : String(attendanceSubjectOptions[0]?.subject_name || '')));
  }, [attendanceSubjectOptions]);

  const mapDateToSchoolDay = (value: string) => {
    const jsDay = new Date(`${value}T00:00:00`).getDay();
    const schoolMap: Record<number, number> = { 6: 1, 0: 2, 1: 3, 2: 4, 3: 5, 4: 6, 5: 7 };
    return schoolMap[jsDay] || 0;
  };

  const overallAttendanceSummary = useMemo(() => {
    const summary = data?.attendanceSummary || {};
    const presentLike =
      Number(summary.present_count ?? 0) +
      Number(summary.late_count ?? 0) +
      Number(summary.excused_count ?? 0) +
      Number(summary.sick_count ?? 0);
    const absent = Number(summary.absent_count ?? 0);
    const total = Number(summary.total_count ?? presentLike + absent);
    return { presentLike, absent, total };
  }, [data?.attendanceSummary]);

  const selectedSubjectAttendanceSummary = useMemo(() => {
    if (!selectedAttendanceSubject) {
      return overallAttendanceSummary;
    }

    const subjectDays = new Set(
      (data?.timetable || [])
        .filter((item: any) => String(item.subject_name || '') === selectedAttendanceSubject)
        .map((item: any) => Number(item.day_of_week || 0)),
    );

    const relatedRecords = (data?.attendanceRecords || []).filter((record: any) => {
      const schoolDay = mapDateToSchoolDay(String(record.attendance_date || '').slice(0, 10));
      return subjectDays.has(schoolDay);
    });

    const absent = relatedRecords.filter((record: any) => String(record.status || '').toUpperCase() === 'ABSENT').length;
    const total = relatedRecords.length;
    const presentLike = total - absent;

    return { presentLike, absent, total };
  }, [data?.attendanceRecords, data?.timetable, overallAttendanceSummary, selectedAttendanceSubject]);

  const attendanceChartData = useMemo(() => {
    const source = selectedAttendanceSubject ? selectedSubjectAttendanceSummary : overallAttendanceSummary;
    return [
      { name: 'Present', value: source.presentLike, color: '#123B8A' },
      { name: 'Absent', value: source.absent, color: '#E24A6A' },
    ];
  }, [overallAttendanceSummary, selectedSubjectAttendanceSummary, selectedAttendanceSubject]);

  if (loading) {
    return <div className="rounded-[28px] border border-[#c7d7ff] bg-white p-8 text-sm text-slate-500">Loading student portal...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">{error}</div>;
  }

  const absenceRate = overallAttendanceSummary.total
    ? (overallAttendanceSummary.absent / overallAttendanceSummary.total) * 100
    : 0;
  const attendanceEligibilityRate = overallAttendanceSummary.total
    ? (overallAttendanceSummary.presentLike / overallAttendanceSummary.total) * 100
    : 0;

  const profile = (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[
        ['Full Name', `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || 'Student'],
        ['Admission Number', data?.currentClassroom?.admission_number || currentUser?.username || 'Not Assigned'],
        ['Classroom', data?.currentClassroom?.classroom_name || 'Not Assigned'],
        ['Grade Level', data?.currentClassroom?.grade_level || 'Not Assigned'],
        ['Academic Year', data?.currentClassroom?.academic_year || 'Not Assigned'],
        ['Status', currentUser?.status || 'active'],
      ].map(([label, value]) => (
        <div key={label} className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-bold text-slate-900">{value as string}</p>
        </div>
      ))}
    </div>
  );

  const attendance = (
    <div className="space-y-3">
      <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4">
        <p className="text-sm font-bold text-slate-900">Attendance Rate</p>
        <p className="mt-2 text-3xl font-black text-[#123B8A]">{Math.round(attendanceEligibilityRate)}%</p>
      </div>
      {absenceRate > 20 ? (
        <div className="rounded-2xl border border-rose-200 bg-[linear-gradient(135deg,#fff1f3_0%,#ffe6ea_100%)] px-4 py-4 text-sm text-rose-800">
          <p className="font-black uppercase tracking-[0.18em]">Exam Caution</p>
          <p className="mt-2">
            Your absence rate is <span className="font-black">{Math.round(absenceRate)}%</span>. Students above 20% absence risk being blocked from exams until attendance improves.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-[linear-gradient(135deg,#effcf4_0%,#e4f8eb_100%)] px-4 py-4 text-sm text-emerald-800">
          <p className="font-black uppercase tracking-[0.18em]">Exam Eligibility</p>
          <p className="mt-2">
            Your attendance is currently within the expected range for exams. Keep your absence below 20%.
          </p>
        </div>
      )}
      <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Attendance by Subject</p>
            <p className="mt-1 text-xs text-slate-500">
              Subject attendance is estimated from the real school-day attendance records on the days that subject is scheduled.
            </p>
          </div>
          <select
            className="rounded-xl border bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            value={selectedAttendanceSubject}
            onChange={(event) => setSelectedAttendanceSubject(event.target.value)}
          >
            <option value="">Overall attendance</option>
            {attendanceSubjectOptions.map((item: any) => (
              <option key={`${item.subject_name}-${item.day_of_week}-${item.id}`} value={String(item.subject_name || '')}>
                {item.subject_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-5 h-64">
          <ReResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <RePie data={attendanceChartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={86} paddingAngle={4}>
                {attendanceChartData.map((entry) => (
                  <ReCell key={entry.name} fill={entry.color} />
                ))}
              </RePie>
              <ReTooltip />
              <ReLegend />
            </RePieChart>
          </ReResponsiveContainer>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Present</p>
            <p className="mt-1 text-lg font-black text-[#123B8A]">
              {selectedAttendanceSubject ? selectedSubjectAttendanceSummary.presentLike : overallAttendanceSummary.presentLike}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Absent</p>
            <p className="mt-1 text-lg font-black text-rose-600">
              {selectedAttendanceSubject ? selectedSubjectAttendanceSummary.absent : overallAttendanceSummary.absent}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Attendance %</p>
            <p className="mt-1 text-lg font-black text-emerald-700">
              {Math.round(
                (selectedAttendanceSubject ? selectedSubjectAttendanceSummary.total : overallAttendanceSummary.total)
                  ? (((selectedAttendanceSubject ? selectedSubjectAttendanceSummary.presentLike : overallAttendanceSummary.presentLike) /
                      (selectedAttendanceSubject ? selectedSubjectAttendanceSummary.total : overallAttendanceSummary.total)) *
                      100)
                  : 0,
              )}%
            </p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4 text-sm text-slate-600">
        This section is personal to this student account only. It updates from real attendance records entered by the teacher.
      </div>
    </div>
  );

  const schedule = (
    <ListBlock
      items={(data?.timetable || []).slice(0, 12)}
      emptyMessage="No timetable entries found for your class."
      renderItem={(item) => (
        <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
          <p className="text-sm font-bold text-slate-900">{item.subject_name || 'Subject'}</p>
          <p className="mt-1 text-sm text-slate-500">
            Day {item.day_of_week} | {item.start_time} - {item.end_time}
          </p>
          <p className="mt-1 text-xs font-semibold text-[#123B8A]">
            Teacher: {item.teacher_name || 'Not assigned yet'}
          </p>
        </div>
      )}
    />
  );

  const exams = (
    <div className="space-y-5">
      {absenceRate > 20 ? (
        <div className="rounded-2xl border border-rose-200 bg-[linear-gradient(135deg,#fff1f3_0%,#ffe6ea_100%)] px-4 py-4 text-sm text-rose-800">
          Your absence rate is currently <span className="font-black">{Math.round(absenceRate)}%</span>. This may stop you from entering exams until your attendance improves.
        </div>
      ) : null}
      <ListBlock
        items={(data?.recentAssignments || []).slice(0, 6)}
        emptyMessage="No assignments found."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">Due: {String(item.due_date || '').slice(0, 10)}</p>
          </div>
        )}
      />
      <ListBlock
        items={(data?.recentResults || []).slice(0, 6)}
        emptyMessage="No results published yet."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Exam Result</p>
            <p className="mt-1 text-sm text-slate-500">Marks: {item.marks_obtained ?? '-'} | Grade: {item.grade || '-'}</p>
          </div>
        )}
      />
      <ListBlock
        items={(data?.reportCards || []).slice(0, 6)}
        emptyMessage="No published report cards yet."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Report Card #{item.id}</p>
            <p className="mt-1 text-sm text-slate-500">Average: {item.average_percentage ?? '-'}% | Grade: {item.overall_grade || '-'}</p>
          </div>
        )}
      />
    </div>
  );

  const finance = (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4">
        <p className="text-sm font-bold text-slate-900">Current Fee Balance</p>
        <p className="mt-2 text-3xl font-black text-[#123B8A]">{data?.feeBalance?.total_balance ?? 0}</p>
      </div>
      <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff9eb_0%,#fff4d8_100%)] px-4 py-4 text-sm text-amber-900">
        <p className="font-black uppercase tracking-[0.18em]">Payment Process</p>
        <p className="mt-2">
          Students do not pay invoices directly inside this portal. Take the invoice number to the school finance office, then the accountant records the payment and your balance updates automatically.
        </p>
      </div>
      <ListBlock
        items={(data?.invoices || []).slice(0, 8)}
        emptyMessage="No invoices recorded yet."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">{item.invoice_number || `Invoice #${item.id}`}</p>
                <p className="mt-1 text-sm text-slate-500">
                  Due: {String(item.due_date || item.invoice_date || '').slice(0, 10) || '-'} | Status: {item.status || 'UNPAID'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-[#123B8A]">{item.final_amount ?? item.total_amount ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500">Balance: {item.balance_amount ?? 0}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {Array.isArray(item.items) && item.items.length ? (
                item.items.map((feeItem: any) => (
                  <div key={feeItem.id} className="rounded-2xl border border-white/70 bg-white/70 px-3 py-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {feeItem.fee_type_name || feeItem.description || 'Fee item'}
                        </p>
                        {feeItem.description ? <p className="mt-1 text-[11px] text-slate-500">{feeItem.description}</p> : null}
                      </div>
                      <div className="text-right text-xs text-slate-600">
                        <p>Amount: {feeItem.amount ?? 0}</p>
                        <p>Discount: {feeItem.discount_amount ?? 0}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No fee item details were added to this invoice.</p>
              )}
            </div>
            {String(item.status || '').toUpperCase() !== 'PAID' && Number(item.balance_amount ?? item.final_amount ?? item.total_amount ?? 0) > 0 ? (
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                Present <span className="font-black">{item.invoice_number || `Invoice #${item.id}`}</span> at the finance office to pay the remaining balance of{' '}
                <span className="font-black">{item.balance_amount ?? item.final_amount ?? item.total_amount ?? 0}</span>.
              </div>
            ) : null}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInvoice(item)}
                className="inline-flex items-center gap-2 rounded-full border border-[#b8cbff] bg-white/85 px-3.5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#123B8A] transition hover:border-[#123B8A]"
              >
                <Eye className="h-3.5 w-3.5" />
                View Full Invoice
              </button>
            </div>
          </div>
        )}
      />
      <ListBlock
        items={(data?.payments || []).slice(0, 8)}
        emptyMessage="No payments recorded yet."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{item.receipt_number || `Payment #${item.id}`}</p>
            <p className="mt-1 text-sm text-slate-500">Amount: {item.amount ?? 0} | Date: {String(item.payment_date || '').slice(0, 10)}</p>
          </div>
        )}
      />
      <ListBlock
        items={(data?.libraryLoans || []).slice(0, 6)}
        emptyMessage="No library loans found."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">Book Loan #{item.id}</p>
            <p className="mt-1 text-sm text-slate-500">Due: {String(item.due_date || '').slice(0, 10)} | Status: {item.status}</p>
          </div>
        )}
      />
    </div>
  );

  const overview = (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      <SectionCard title="Profile Snapshot" icon={<UserRound className="h-4 w-4" />}>{profile}</SectionCard>
      <SectionCard title="Attendance Snapshot" icon={<CalendarDays className="h-4 w-4" />}>{attendance}</SectionCard>
      <SectionCard title="Study Snapshot" icon={<BookText className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Assignments</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{(data?.recentAssignments || []).length}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Results</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{(data?.recentResults || []).length}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Report Cards</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{(data?.reportCards || []).length}</p></div>
        </div>
      </SectionCard>
      <SectionCard title="Finance Snapshot" icon={<CreditCard className="h-4 w-4" />}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Balance</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{data?.feeBalance?.total_balance ?? 0}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Invoices</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{(data?.invoices || []).length}</p></div>
          <div className="rounded-2xl bg-slate-50 px-4 py-4"><p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Payments</p><p className="mt-2 text-2xl font-black text-[#123B8A]">{(data?.payments || []).length}</p></div>
        </div>
      </SectionCard>
    </div>
  );

  const announcements = (
    <SectionCard title="School Announcements" icon={<Megaphone className="h-4 w-4" />}>
      <ListBlock
        items={(data?.announcements || []).slice(0, 5)}
        emptyMessage="No announcements available."
        renderItem={(item) => (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{item.title}</p>
            <p className="mt-1 text-sm text-slate-500">{item.message || item.content}</p>
          </div>
        )}
      />
    </SectionCard>
  );

  const canShowAnnouncements = activeTab === 'dashboard' || activeTab === 'profile';

  const renderFocused = () => {
    switch (activeTab) {
      case 'profile':
        return <SectionCard title="My Profile" icon={<UserRound className="h-4 w-4" />}>{profile}</SectionCard>;
      case 'attendance':
        return <SectionCard title="Attendance" icon={<CalendarDays className="h-4 w-4" />}>{attendance}</SectionCard>;
      case 'timetable':
        return <SectionCard title="Schedule" icon={<School className="h-4 w-4" />}>{schedule}</SectionCard>;
      case 'exams':
        return <SectionCard title="Exam & Academic Record" icon={<GraduationCap className="h-4 w-4" />}>{exams}</SectionCard>;
      case 'finance':
        return <SectionCard title="Finance & Balance" icon={<CreditCard className="h-4 w-4" />}>{finance}</SectionCard>;
      default:
        return overview;
    }
  };

  return (
    <div className="space-y-6">
      {renderFocused()}
      {canShowAnnouncements ? announcements : null}
      <InvoicePreviewModal
        invoice={selectedInvoice}
        ownerName={`${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() || currentUser?.username || 'Student'}
        onClose={() => setSelectedInvoice(null)}
      />
    </div>
  );
}
