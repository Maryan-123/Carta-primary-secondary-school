import React, { useEffect, useState } from 'react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';
import { BookText, CalendarDays, CreditCard, GraduationCap, Library, Megaphone, School, UserRound } from 'lucide-react';

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

  if (loading) {
    return <div className="rounded-[28px] border border-[#c7d7ff] bg-white p-8 text-sm text-slate-500">Loading student portal...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">{error}</div>;
  }

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
        <p className="mt-2 text-3xl font-black text-[#123B8A]">{Math.round(data?.attendancePercentage ?? 0)}%</p>
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
          <p className="mt-1 text-sm text-slate-500">Day {item.day_of_week} | {item.start_time} - {item.end_time}</p>
        </div>
      )}
    />
  );

  const exams = (
    <div className="space-y-5">
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
      <ListBlock
        items={(data?.invoices || []).slice(0, 8)}
        emptyMessage="No invoices recorded yet."
        renderItem={(item) => (
          <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
            <p className="text-sm font-bold text-slate-900">{item.invoice_number || `Invoice #${item.id}`}</p>
            <p className="mt-1 text-sm text-slate-500">Amount: {item.final_amount ?? item.total_amount ?? 0} | Status: {item.status || 'UNPAID'}</p>
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
    </div>
  );
}
