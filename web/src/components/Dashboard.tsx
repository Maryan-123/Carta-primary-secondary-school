import React, { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../api';
import { useUIStore } from '../store';
import {
  BellRing,
  BookOpenCheck,
  BookText,
  CalendarDays,
  CreditCard,
  Eye,
  GraduationCap,
  Library,
  Megaphone,
  School,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  Bar as ReBar,
  BarChart as ReBarChart,
  CartesianGrid as ReCartesianGrid,
  Cell as ReCell,
  Legend as ReLegend,
  Pie as RePie,
  PieChart as RePieChart,
  ResponsiveContainer as ReResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis as ReXAxis,
  YAxis as ReYAxis,
} from 'recharts';
import InvoicePreviewModal from './InvoicePreviewModal';

type DashboardRole = 'ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'ACCOUNTANT' | 'LIBRARIAN' | 'PARENT' | 'STUDENT';

function HeroPanel({
  eyebrow,
  title,
  subtitle,
  chips,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  chips: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-[38px] border border-[#dbe5ff] bg-[radial-gradient(circle_at_top_left,_rgba(18,59,138,0.44),_transparent_34%),radial-gradient(circle_at_85%_18%,_rgba(71,125,255,0.16),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(11,143,90,0.22),_transparent_28%),linear-gradient(135deg,#ffffff_0%,#edf3ff_40%,#e8f8ef_100%)] p-8 shadow-[0_34px_90px_rgba(18,59,138,0.16)]">
      <div className="absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95),transparent)]" />
      <div className="absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#123B8A]/12 blur-3xl" />
      <div className="absolute bottom-0 right-8 h-36 w-36 rounded-full bg-[#0B8F5A]/10 blur-3xl" />
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full border border-white/60 bg-white/18 backdrop-blur-xl" />
      <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/90 bg-white/84 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.32em] text-[#123B8A] shadow-[0_10px_30px_rgba(18,59,138,0.08)] backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-[#102c63] sm:text-[2.85rem]">{title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#34507f] sm:text-[1.04rem]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2.5 xl:max-w-sm xl:justify-end">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/90 bg-white/88 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#123B8A] shadow-[0_10px_26px_rgba(18,59,138,0.08)] backdrop-blur"
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccentStatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: 'blue' | 'green' | 'amber' | 'rose';
}) {
  const toneClasses = {
    blue: 'from-[#143a86] via-[#2b59b0] to-[#4b82f3] text-white shadow-[0_22px_50px_rgba(18,59,138,0.24)]',
    green: 'from-[#0b7c4f] via-[#109663] to-[#2dc18b] text-white shadow-[0_22px_50px_rgba(11,143,90,0.22)]',
    amber: 'from-[#d88907] via-[#f0a61a] to-[#ffd166] text-slate-950 shadow-[0_22px_50px_rgba(245,158,11,0.22)]',
    rose: 'from-[#c61d48] via-[#e44f73] to-[#ff94aa] text-white shadow-[0_22px_50px_rgba(225,29,72,0.18)]',
  } as const;

  return (
    <div className={`rounded-[28px] bg-gradient-to-br p-[1px] ${toneClasses[tone]}`}>
      <div className="rounded-[27px] bg-[linear-gradient(180deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.08)_100%)] p-5 backdrop-blur-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] opacity-80">{label}</p>
            <p className="mt-3 text-3xl font-black tracking-[-0.04em]">{value}</p>
          </div>
          <div className="rounded-[18px] border border-white/15 bg-white/18 p-3 shadow-inner">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function SurfaceCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ff_50%,#eef8f2_100%)] p-5 shadow-[0_24px_56px_rgba(18,59,138,0.09)]">
      <div className="flex items-center gap-3">
        {icon ? <div className="rounded-[18px] border border-white/80 bg-[linear-gradient(135deg,#dce8ff_0%,#dcf5e8_100%)] p-2.5 text-[#123B8A] shadow-[0_10px_24px_rgba(18,59,138,0.08)]">{icon}</div> : null}
        <h2 className="text-sm font-black uppercase tracking-[0.24em] text-[#123B8A]">{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="rounded-[22px] border border-dashed border-[#c7d7ff] bg-[linear-gradient(135deg,#f4f8ff_0%,#eef8f2_100%)] px-4 py-6 text-sm leading-6 text-[#4b648b]">{message}</p>;
}

function ListStack({
  items,
  renderItem,
  emptyMessage,
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyMessage: string;
}) {
  if (!items.length) {
    return <EmptyState message={emptyMessage} />;
  }

  return <div className="space-y-3">{items.map((item, index) => <React.Fragment key={item.id ?? index}>{renderItem(item, index)}</React.Fragment>)}</div>;
}

function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#123B8A]">
      {children}
    </span>
  );
}

function QuickProfileFacts({
  facts,
}: {
  facts: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {facts.map((fact) => (
        <div key={fact.label} className="rounded-[26px] border border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_56%,#edf8f2_100%)] p-5 shadow-[0_18px_48px_rgba(18,59,138,0.08)]">
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0B8F5A]">{fact.label}</p>
          <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#123B8A]">{fact.value}</p>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[32px] border border-[#dbe5ff] bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_52%,#eef8f2_100%)] p-5 shadow-[0_24px_56px_rgba(18,59,138,0.1)]">
      <div className="mb-4">
        <h3 className="text-sm font-black uppercase tracking-[0.22em] text-[#123B8A]">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p>
      </div>
      <div className="h-72 rounded-[26px] border border-white/80 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        {children}
      </div>
    </div>
  );
}

function MetricTiles({
  items,
}: {
  items: Array<{ label: string; value: string | number; note: string }>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-[24px] border border-[#d7e3ff] bg-[linear-gradient(145deg,#ffffff_0%,#eef4ff_55%,#eef8f1_100%)] px-4 py-4 shadow-[0_12px_30px_rgba(18,59,138,0.06)]"
        >
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0B8F5A]">{item.label}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-[#123B8A]">{item.value}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{item.note}</p>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, activeTab } = useUIStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedInvoicePreview, setSelectedInvoicePreview] = useState<{ invoice: any; ownerName: string } | null>(null);

  const role = (currentUser?.role || 'STUDENT') as DashboardRole;

  const endpoint = useMemo(() => {
    switch (role) {
      case 'ADMIN':
        return '/dashboard/admin';
      case 'PRINCIPAL':
        return '/dashboard/principal';
      case 'TEACHER':
        return '/dashboard/teacher';
      case 'ACCOUNTANT':
        return '/dashboard/accountant';
      case 'LIBRARIAN':
        return '/dashboard/librarian';
      case 'PARENT':
        return '/dashboard/parent';
      case 'STUDENT':
      default:
        return '/dashboard/student';
    }
  }, [role]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) {
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await axiosClient.get(endpoint);
        setDashboardData(response.data?.data || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    void loadDashboard();
  }, [currentUser, endpoint]);

  if (!currentUser) {
    return null;
  }

  const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;

  const adminPopulationChart = [
    { name: 'Students', value: Number(dashboardData?.totalActiveStudents ?? 0) },
    { name: 'Teachers', value: Number(dashboardData?.totalTeachers ?? 0) },
    { name: 'Staff', value: Number(dashboardData?.totalStaff ?? 0) },
    { name: 'Parents', value: Number(dashboardData?.totalParents ?? 0) },
    { name: 'Classes', value: Number(dashboardData?.totalClassrooms ?? 0) },
  ];

  const adminFinanceChart = [
    { name: 'Collected', value: Number(dashboardData?.totalFeesCollectedThisMonth ?? 0) },
    { name: 'Expenses', value: Number(dashboardData?.totalExpensesThisMonth ?? 0) },
    { name: 'Unpaid', value: Number(dashboardData?.totalUnpaidFees ?? 0) },
  ];

  const adminOperationsChart = [
    { name: 'Borrowed', value: Number(dashboardData?.booksCurrentlyBorrowed ?? 0) },
    { name: 'Overdue', value: Number(dashboardData?.overdueBooks ?? 0) },
    { name: 'Events', value: Number((dashboardData?.upcomingEvents || []).length) },
    { name: 'Announcements', value: Number((dashboardData?.recentAnnouncements || []).length) },
  ];

  const adminGenderChart = (dashboardData?.studentGenderDistribution || []).map((item: any) => ({
    name: item.gender || 'OTHER',
    value: Number(item.total ?? 0),
  }));

  const teacherActionTiles = [
    {
      label: 'Attendance Work',
      value: dashboardData?.assigned_classrooms ?? 0,
      note: 'Assigned classrooms that need daily register coverage from your teaching account.',
    },
    {
      label: 'Assessment Queue',
      value: (dashboardData?.submissions || []).length,
      note: 'Recent submissions waiting for grading, review, or classroom follow-up.',
    },
    {
      label: 'Exam Readiness',
      value: (dashboardData?.upcomingExams || []).length,
      note: 'Scheduled exam items linked to your assigned classes and subjects.',
    },
  ];

  const studentJourneyTiles = [
    {
      label: 'Learning Track',
      value: dashboardData?.currentClassroom?.classroom_name || 'Not Assigned',
      note: 'Your current class placement from the school database.',
    },
    {
      label: 'Attendance Rate',
      value: `${Math.round(dashboardData?.attendancePercentage ?? 0)}%`,
      note: 'Updated only from your own recorded attendance rows.',
    },
    {
      label: 'Study Pipeline',
      value: (dashboardData?.recentAssignments || []).length,
      note: 'Visible assignments currently returned by your student account.',
    },
  ];

  const parentFamilyTiles = [
    {
      label: 'Linked Children',
      value: (dashboardData?.children || []).length,
      note: 'Only children connected to this parent through the real parent-student relationship table.',
    },
    {
      label: 'Family Notices',
      value: (dashboardData?.announcements || []).length,
      note: 'Announcements currently visible to this parent account.',
    },
    {
      label: 'Upcoming Events',
      value: (dashboardData?.upcomingEvents || []).length,
      note: 'Upcoming school dates relevant to your family and school calendar.',
    },
  ];

  if (loading) {
    return (
      <div className="rounded-[28px] border border-[#c7d7ff] bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_52%,#eef8f2_100%)] p-8 shadow-sm">
        <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded-2xl bg-slate-100" />
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-36 animate-pulse rounded-[24px] bg-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">{error}</div>;
  }

  if (role === 'ADMIN') {
    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="School Command Center"
          title={`Welcome back, ${fullName}`}
          subtitle="Monitor enrollment, staffing, collections, announcements, events, and academic operations from one polished leadership workspace."
          chips={['Administrator', 'Full System Access', dashboardData?.currentAcademicYear?.name || 'No Current Year']}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Current Academic Year', value: dashboardData?.currentAcademicYear?.name || 'Not Set' },
            { label: 'Current Term', value: dashboardData?.currentTerm?.name || 'Not Set' },
            { label: 'Books Borrowed', value: dashboardData?.booksCurrentlyBorrowed ?? 0 },
            { label: 'Upcoming Events', value: (dashboardData?.upcomingEvents || []).length },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <AccentStatCard label="Active Students" value={dashboardData?.totalActiveStudents ?? 0} icon={<Users className="h-5 w-5" />} tone="blue" />
          <AccentStatCard label="Teachers" value={dashboardData?.totalTeachers ?? 0} icon={<GraduationCap className="h-5 w-5" />} tone="green" />
          <AccentStatCard label="Classrooms" value={dashboardData?.totalClassrooms ?? 0} icon={<School className="h-5 w-5" />} tone="amber" />
          <AccentStatCard label="Unpaid Fees" value={dashboardData?.totalUnpaidFees ?? 0} icon={<CreditCard className="h-5 w-5" />} tone="rose" />
        </div>

        <SurfaceCard title="Leadership Focus" icon={<Sparkles className="h-4 w-4" />}>
          <MetricTiles
            items={[
              {
                label: 'Enrollment Pulse',
                value: dashboardData?.totalActiveStudents ?? 0,
                note: 'Active students currently visible in the real database.',
              },
              {
                label: 'Collection Pulse',
                value: dashboardData?.totalFeesCollectedThisMonth ?? 0,
                note: 'This month fee collections compared with live finance records.',
              },
              {
                label: 'Compliance Pulse',
                value: (dashboardData?.recentAuditActivity || []).length,
                note: 'Recent audit rows showing important activity across the system.',
              },
            ]}
          />
        </SurfaceCard>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard title="Recent Announcements" icon={<Megaphone className="h-4 w-4" />}>
            <ListStack
              items={dashboardData?.recentAnnouncements || []}
              emptyMessage="No recent announcements yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message || item.content}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="School Snapshot" icon={<ShieldCheck className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Current Term</p>
                <p className="mt-2 text-lg font-black text-slate-900">{dashboardData?.currentTerm?.name || 'Not Set'}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Books Borrowed</p>
                <p className="mt-2 text-lg font-black text-slate-900">{dashboardData?.booksCurrentlyBorrowed ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Upcoming Events</p>
                <p className="mt-2 text-lg font-black text-slate-900">{(dashboardData?.upcomingEvents || []).length}</p>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <div className="grid grid-cols-1 gap-5 2xl:grid-cols-2">
          <ChartCard title="School Population" subtitle="Live counts from the real backend database.">
            <ReResponsiveContainer width="100%" height="100%">
              <ReBarChart data={adminPopulationChart}>
                <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6e0ff" />
                <ReXAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                <ReYAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <ReTooltip />
                <ReBar dataKey="value" radius={[10, 10, 0, 0]} fill="#123B8A" />
              </ReBarChart>
            </ReResponsiveContainer>
          </ChartCard>

          <ChartCard title="Finance Snapshot" subtitle="Current month collections, expenses, and outstanding unpaid fees.">
            <ReResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <RePie data={adminFinanceChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {['#0B8F5A', '#f59e0b', '#e11d48'].map((color) => (
                    <ReCell key={color} fill={color} />
                  ))}
                </RePie>
                <ReTooltip />
                <ReLegend />
              </RePieChart>
            </ReResponsiveContainer>
          </ChartCard>

          <ChartCard title="Operations Pulse" subtitle="Library and communication activity translated from current backend records.">
            <ReResponsiveContainer width="100%" height="100%">
              <ReBarChart data={adminOperationsChart}>
                <ReCartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d6e0ff" />
                <ReXAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                <ReYAxis tick={{ fill: '#475569', fontSize: 12 }} />
                <ReTooltip />
                <ReBar dataKey="value" radius={[10, 10, 0, 0]}>
                  {['#123B8A', '#ef4444', '#0B8F5A', '#f59e0b'].map((color) => (
                    <ReCell key={color} fill={color} />
                  ))}
                </ReBar>
              </ReBarChart>
            </ReResponsiveContainer>
          </ChartCard>

          <ChartCard title="Student Gender" subtitle="Active student gender totals from the real database.">
            <ReResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <RePie data={adminGenderChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {['#123B8A', '#ec4899', '#0B8F5A'].map((color) => (
                    <ReCell key={color} fill={color} />
                  ))}
                </RePie>
                <ReTooltip />
                <ReLegend />
              </RePieChart>
            </ReResponsiveContainer>
          </ChartCard>
        </div>

        <SurfaceCard title="Recent Audit Activity" icon={<ShieldCheck className="h-4 w-4" />}>
          <ListStack
            items={dashboardData?.recentAuditActivity || []}
            emptyMessage="No audit records found."
            renderItem={(item: any) => (
              <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{String(item.action || 'UNKNOWN').replaceAll('_', ' ')}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      Table: {item.table_name || 'N/A'}{item.record_id ? ` | Record ID: ${item.record_id}` : ''}
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {String(item.created_at || item.timestamp || '').replace('T', ' ').slice(0, 16) || 'No timestamp'}
                  </div>
                </div>
              </div>
            )}
          />
        </SurfaceCard>
      </div>
    );
  }

  if (role === 'TEACHER') {
    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Teaching Workspace"
          title={`Good day, ${fullName}`}
          subtitle="Your dashboard is focused only on the classes, subjects, timetable, and notices assigned to you."
          chips={['Teacher', `${dashboardData?.assigned_classrooms ?? 0} Classes`, `${dashboardData?.assigned_subjects ?? 0} Subjects`]}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Timetable Slots', value: (dashboardData?.timetable || []).length },
            { label: 'Upcoming Exams', value: (dashboardData?.upcomingExams || []).length },
            { label: 'Report Cards', value: (dashboardData?.reportCards || []).length },
            { label: 'Announcements', value: (dashboardData?.announcements || []).length },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AccentStatCard label="Assigned Classes" value={dashboardData?.assigned_classrooms ?? 0} icon={<School className="h-5 w-5" />} tone="blue" />
          <AccentStatCard label="Assigned Subjects" value={dashboardData?.assigned_subjects ?? 0} icon={<BookOpenCheck className="h-5 w-5" />} tone="green" />
          <AccentStatCard label="Active Assignments" value={dashboardData?.active_assignments ?? 0} icon={<BookText className="h-5 w-5" />} tone="amber" />
        </div>

        <SurfaceCard title="Teaching Priorities" icon={<Sparkles className="h-4 w-4" />}>
          <MetricTiles items={teacherActionTiles} />
        </SurfaceCard>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SurfaceCard title="My Classes" icon={<School className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {(dashboardData?.assignedClasses || []).map((item: any) => (
                <div key={item.id}>
                  <InfoBadge>{item.name}{item.section_name ? ` - ${item.section_name}` : ''}</InfoBadge>
                </div>
              ))}
              {!(dashboardData?.assignedClasses || []).length ? <EmptyState message="No classes assigned yet." /> : null}
            </div>
          </SurfaceCard>

          <SurfaceCard title="My Subjects" icon={<BookOpenCheck className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {(dashboardData?.assignedSubjects || []).map((item: any) => (
                <div key={item.id}>
                  <InfoBadge>{item.code} - {item.name}</InfoBadge>
                </div>
              ))}
              {!(dashboardData?.assignedSubjects || []).length ? <EmptyState message="No subjects assigned yet." /> : null}
            </div>
          </SurfaceCard>

          <SurfaceCard title="Today and Upcoming Timetable" icon={<CalendarDays className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.timetable || []).slice(0, 8)}
              emptyMessage="No timetable entries assigned yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.classroom_name || 'Class'} - {item.subject_name || 'Subject'}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.day_of_week} | {item.start_time} - {item.end_time}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="Recent Assignment Submissions" icon={<BookText className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.submissions || []).slice(0, 6)}
              emptyMessage="No submissions have been received yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.assignment_title || 'Assignment Submission'}</p>
                  <p className="mt-1 text-sm text-slate-500">Status: {item.submission_status || item.status || 'SUBMITTED'}{item.submitted_at ? ` | Submitted: ${String(item.submitted_at).slice(0, 10)}` : ''}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="Upcoming Exams" icon={<GraduationCap className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.upcomingExams || []).slice(0, 6)}
              emptyMessage="No upcoming exams assigned yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.name || 'Exam'}</p>
                  <p className="mt-1 text-sm text-slate-500">From {String(item.start_date || '').slice(0, 10)} to {String(item.end_date || '').slice(0, 10)}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="Recent Announcements" icon={<BellRing className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.announcements || []).slice(0, 5)}
              emptyMessage="No announcements available."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message || item.content}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="Published Report Cards" icon={<ShieldCheck className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.reportCards || []).slice(0, 6)}
              emptyMessage="No published report cards are available for your classes yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Student #{item.student_id}</p>
                  <p className="mt-1 text-sm text-slate-500">Average: {item.average_percentage ?? '-'}% | Grade: {item.overall_grade || '-'}</p>
                </div>
              )}
            />
          </SurfaceCard>
        </div>
      </div>
    );
  }

  if (role === 'STUDENT') {
    const isStudentDashboard = activeTab === 'dashboard';
    const showStudentProfile = isStudentDashboard || activeTab === 'profile';
    const showStudentAttendance = isStudentDashboard || activeTab === 'attendance';
    const showStudentSchedule = isStudentDashboard || activeTab === 'timetable';
    const showStudentExam = isStudentDashboard || activeTab === 'exams';
    const showStudentFinance = isStudentDashboard || activeTab === 'finance';
    const overviewMode = activeTab === 'dashboard';

    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Student Profile"
          title={`Welcome, ${fullName}`}
          subtitle="This portal shows only your personal class, assignments, attendance, published results, fee balance, and library record."
          chips={[
            'Student',
            dashboardData?.currentClassroom?.classroom_name || 'No Class',
            dashboardData?.currentClassroom?.academic_year || 'No Academic Year',
          ]}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Admission No', value: dashboardData?.currentClassroom?.admission_number || currentUser.username },
            { label: 'Grade Level', value: dashboardData?.currentClassroom?.grade_level || 'Not Assigned' },
            { label: 'Invoices', value: (dashboardData?.invoices || []).length },
            { label: 'Announcements', value: (dashboardData?.announcements || []).length },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AccentStatCard label="Current Class" value={dashboardData?.currentClassroom?.classroom_name || 'Not Assigned'} icon={<School className="h-5 w-5" />} tone="blue" />
          <AccentStatCard label="Attendance" value={`${Math.round(dashboardData?.attendancePercentage ?? 0)}%`} icon={<CalendarDays className="h-5 w-5" />} tone="green" />
          <AccentStatCard label="Fee Balance" value={dashboardData?.feeBalance?.total_balance ?? 0} icon={<CreditCard className="h-5 w-5" />} tone="amber" />
        </div>

        {overviewMode ? (
          <SurfaceCard title="Personal Progress Snapshot" icon={<Sparkles className="h-4 w-4" />}>
            <MetricTiles items={studentJourneyTiles} />
          </SurfaceCard>
        ) : null}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {overviewMode ? (
            <SurfaceCard title="My Overview" icon={<Users className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Admission Number</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.admission_number || currentUser.username}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Grade Level</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.grade_level || 'Not Assigned'}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Academic Year</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.academic_year || 'Not Assigned'}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Section</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.section_name || 'No Section'}</p>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {showStudentProfile && !overviewMode ? (
            <SurfaceCard title="My Profile" icon={<Users className="h-4 w-4" />}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Full Name</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{fullName}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Admission Number</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.admission_number || 'Not Assigned'}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Grade Level</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">{dashboardData?.currentClassroom?.grade_level || 'Not Assigned'}</p>
                </div>
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Classroom</p>
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {dashboardData?.currentClassroom?.classroom_name || 'Not Assigned'}
                    {dashboardData?.currentClassroom?.section_name ? ` - ${dashboardData.currentClassroom.section_name}` : ''}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {showStudentSchedule && !overviewMode ? (
            <SurfaceCard title="My Timetable" icon={<CalendarDays className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.timetable || []).slice(0, 8)}
              emptyMessage="No timetable entries found for your class."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.subject_name || 'Subject'}</p>
                  <p className="mt-1 text-sm text-slate-500">Day {item.day_of_week} | {item.start_time} - {item.end_time}</p>
                  <p className="mt-1 text-xs font-semibold text-[#123B8A]">Teacher: {item.teacher_name || 'Not assigned yet'}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}

          {overviewMode ? (
            <SurfaceCard title="Study Snapshot" icon={<BookText className="h-4 w-4" />}>
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Assignments</p>
                  <p className="mt-1 text-sm text-slate-500">{(dashboardData?.recentAssignments || []).length} visible assignments</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Results</p>
                  <p className="mt-1 text-sm text-slate-500">{(dashboardData?.recentResults || []).length} recent results</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Report Cards</p>
                  <p className="mt-1 text-sm text-slate-500">{(dashboardData?.reportCards || []).length} published report cards</p>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {showStudentExam && !overviewMode ? (
            <SurfaceCard title="My Recent Assignments" icon={<BookText className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.recentAssignments || []).slice(0, 6)}
              emptyMessage="No assignments found."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">Due: {String(item.due_date || '').slice(0, 10)}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}

          {showStudentExam && !overviewMode ? (
            <SurfaceCard title="My Recent Results" icon={<GraduationCap className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.recentResults || []).slice(0, 6)}
              emptyMessage="No results published yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Exam Result</p>
                  <p className="mt-1 text-sm text-slate-500">Marks: {item.marks_obtained ?? '-'} | Grade: {item.grade || '-'}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}

          {showStudentExam && !overviewMode ? (
            <SurfaceCard title="Published Report Cards" icon={<ShieldCheck className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.reportCards || []).slice(0, 6)}
              emptyMessage="No published report cards yet."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Report Card #{item.id}</p>
                  <p className="mt-1 text-sm text-slate-500">Average: {item.average_percentage ?? '-'}% | Grade: {item.overall_grade || '-'}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}

          {overviewMode ? (
            <SurfaceCard title="Finance Snapshot" icon={<CreditCard className="h-4 w-4" />}>
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Outstanding Balance</p>
                  <p className="mt-1 text-sm text-slate-500">{dashboardData?.feeBalance?.total_balance ?? 0}</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Invoices</p>
                  <p className="mt-1 text-sm text-slate-500">{(dashboardData?.invoices || []).length} invoice records</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Payments</p>
                  <p className="mt-1 text-sm text-slate-500">{(dashboardData?.payments || []).length} payment records</p>
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {showStudentFinance && !overviewMode ? (
            <SurfaceCard title="Invoices and Payments" icon={<CreditCard className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                <p className="text-sm font-bold text-slate-900">Current Fee Balance</p>
                <p className="mt-1 text-sm text-slate-500">Outstanding: {dashboardData?.feeBalance?.total_balance ?? 0}</p>
              </div>
              <ListStack
                items={(dashboardData?.payments || []).slice(0, 4)}
                emptyMessage="No payments recorded yet."
                renderItem={(item: any) => (
                  <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                    <p className="text-sm font-bold text-slate-900">{item.receipt_number || `Payment #${item.id}`}</p>
                    <p className="mt-1 text-sm text-slate-500">Amount: {item.amount ?? 0} | Date: {String(item.payment_date || '').slice(0, 10)}</p>
                  </div>
                )}
              />
            </div>
            </SurfaceCard>
          ) : null}

          {showStudentFinance && !overviewMode ? (
            <SurfaceCard title="My Library Loans" icon={<Library className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.libraryLoans || []).slice(0, 6)}
              emptyMessage="No library loans found."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">Book Loan #{item.id}</p>
                  <p className="mt-1 text-sm text-slate-500">Due: {String(item.due_date || '').slice(0, 10)} | Status: {item.status}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}

          {overviewMode ? (
            <SurfaceCard title="Attendance Snapshot" icon={<CalendarDays className="h-4 w-4" />}>
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4">
                  <p className="text-sm font-bold text-slate-900">Current Attendance Rate</p>
                  <p className="mt-2 text-3xl font-black text-[#123B8A]">{Math.round(dashboardData?.attendancePercentage ?? 0)}%</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4 text-sm text-slate-600">
                  Open the `Attendance` tab from the sidebar to view your attendance-focused section.
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {showStudentAttendance && !overviewMode ? (
            <SurfaceCard title="Attendance Overview" icon={<CalendarDays className="h-4 w-4" />}>
              <div className="space-y-3">
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4">
                  <p className="text-sm font-bold text-slate-900">Current Attendance Rate</p>
                  <p className="mt-2 text-3xl font-black text-[#123B8A]">{Math.round(dashboardData?.attendancePercentage ?? 0)}%</p>
                </div>
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-4 text-sm text-slate-600">
                  Attendance records shown here come only from your own student account. When your teacher records class attendance, this percentage will update automatically.
                </div>
              </div>
            </SurfaceCard>
          ) : null}

          {(overviewMode || showStudentProfile || showStudentAttendance || showStudentSchedule || showStudentExam || showStudentFinance) ? (
            <SurfaceCard title="School Announcements" icon={<Megaphone className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.announcements || []).slice(0, 5)}
              emptyMessage="No announcements available."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message || item.content}</p>
                </div>
              )}
            />
            </SurfaceCard>
          ) : null}
        </div>
      </div>
    );
  }

  if (role === 'PARENT') {
    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Family Portal"
          title={`Welcome, ${fullName}`}
          subtitle="This parent profile is limited to your linked children and school updates relevant to your family."
          chips={['Parent', `${(dashboardData?.children || []).length} Linked Children`, 'Family Access']}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Linked Children', value: (dashboardData?.children || []).length },
            { label: 'Announcements', value: (dashboardData?.announcements || []).length },
            { label: 'Upcoming Events', value: (dashboardData?.upcomingEvents || []).length },
            { label: 'Username', value: currentUser.username },
          ]}
        />

        <SurfaceCard title="Family Snapshot" icon={<Sparkles className="h-4 w-4" />}>
          <MetricTiles items={parentFamilyTiles} />
        </SurfaceCard>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <SurfaceCard title="Linked Children" icon={<Users className="h-4 w-4" />}>
            <ListStack
              items={dashboardData?.children || []}
              emptyMessage="No linked children found for this parent account."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ebfaf2_100%)] px-4 py-4">
                  <p className="text-base font-black text-slate-900">{item.first_name} {item.last_name}</p>
                  <p className="mt-1 text-sm text-slate-500">Admission No: {item.admission_number}</p>
                  <p className="mt-1 text-sm text-slate-500">Class: {item.currentClassroom?.classroom_name || 'Not Assigned'} | Attendance: {Math.round(item.attendancePercentage ?? 0)}%</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <InfoBadge>{(item.assignments || []).length} Assignments</InfoBadge>
                    <InfoBadge>{(item.results || []).length} Results</InfoBadge>
                    <InfoBadge>{(item.reportCards || []).length} Report Cards</InfoBadge>
                    <InfoBadge>Balance: {item.feeBalance?.total_balance ?? item.feeBalance?.balance_amount ?? 0}</InfoBadge>
                  </div>
                  <div className="mt-4 space-y-3">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Invoice Details</p>
                    <div className="rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fff9eb_0%,#fff4d8_100%)] px-4 py-3 text-sm text-amber-900">
                      Parents can review invoices here, but payments are still recorded by the school finance office. Use the invoice number below when paying at school.
                    </div>
                    {Array.isArray(item.invoices) && item.invoices.length ? (
                      item.invoices.slice(0, 4).map((invoice: any) => (
                        <div key={invoice.id} className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{invoice.invoice_number || `Invoice #${invoice.id}`}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                Due: {String(invoice.due_date || invoice.invoice_date || '').slice(0, 10) || '-'} | Status: {invoice.status || 'UNPAID'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-[#123B8A]">{invoice.final_amount ?? invoice.total_amount ?? 0}</p>
                              <p className="mt-1 text-xs text-slate-500">Balance: {invoice.balance_amount ?? 0}</p>
                            </div>
                          </div>
                          <div className="mt-3 space-y-2">
                            {Array.isArray(invoice.items) && invoice.items.length ? (
                              invoice.items.map((feeItem: any) => (
                                <div key={feeItem.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                      <p className="text-xs font-bold text-slate-900">{feeItem.fee_type_name || feeItem.description || 'Fee item'}</p>
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
                          {String(invoice.status || '').toUpperCase() !== 'PAID' && Number(invoice.balance_amount ?? invoice.final_amount ?? invoice.total_amount ?? 0) > 0 ? (
                            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
                              Remaining balance for <span className="font-black">{invoice.invoice_number || `Invoice #${invoice.id}`}</span> is{' '}
                              <span className="font-black">{invoice.balance_amount ?? invoice.final_amount ?? invoice.total_amount ?? 0}</span>.
                            </div>
                          ) : null}
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedInvoicePreview({
                                  invoice,
                                  ownerName: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.admission_number || 'Student',
                                })
                              }
                              className="inline-flex items-center gap-2 rounded-full border border-[#b8cbff] bg-white/85 px-3.5 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#123B8A] transition hover:border-[#123B8A]"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Full Invoice
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl border border-dashed border-[#c7d7ff] bg-white/70 px-4 py-4 text-sm text-slate-500">
                        No invoices recorded yet for this child.
                      </p>
                    )}
                  </div>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="School Announcements" icon={<Megaphone className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.announcements || []).slice(0, 5)}
              emptyMessage="No announcements available."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.message || item.content}</p>
                </div>
              )}
            />
          </SurfaceCard>
        </div>

        <SurfaceCard title="Upcoming School Events" icon={<CalendarDays className="h-4 w-4" />}>
          <ListStack
            items={(dashboardData?.upcomingEvents || []).slice(0, 8)}
            emptyMessage="No upcoming events available."
            renderItem={(item: any) => (
              <div className="rounded-2xl border border-[#d6e0ff] bg-[linear-gradient(135deg,#f7faff_0%,#f0faf4_100%)] px-4 py-3">
                <p className="text-sm font-bold text-slate-900">{item.title || item.name}</p>
                <p className="mt-1 text-sm text-slate-500">Date: {String(item.start_date || '').slice(0, 10)}</p>
              </div>
            )}
          />
        </SurfaceCard>

        <InvoicePreviewModal
          invoice={selectedInvoicePreview?.invoice || null}
          ownerName={selectedInvoicePreview?.ownerName}
          onClose={() => setSelectedInvoicePreview(null)}
        />
      </div>
    );
  }

  if (role === 'ACCOUNTANT') {
    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Finance Office"
          title={`Welcome, ${fullName}`}
          subtitle="Track collections, outstanding balances, and the school cash position with finance-only access."
          chips={['Accountant', 'Finance Access', 'Restricted Scope']}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Today Collections', value: dashboardData?.todayCollections ?? 0 },
            { label: 'Monthly Collections', value: dashboardData?.monthlyCollections ?? 0 },
            { label: 'Outstanding', value: dashboardData?.totalOutstandingBalance ?? 0 },
            { label: 'Net Cash', value: dashboardData?.netCashSummary ?? 0 },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
          <AccentStatCard label="Today Collections" value={dashboardData?.todayCollections ?? 0} icon={<CreditCard className="h-5 w-5" />} tone="green" />
          <AccentStatCard label="Monthly Collections" value={dashboardData?.monthlyCollections ?? 0} icon={<ShieldCheck className="h-5 w-5" />} tone="blue" />
          <AccentStatCard label="Outstanding Balance" value={dashboardData?.totalOutstandingBalance ?? 0} icon={<BookText className="h-5 w-5" />} tone="rose" />
          <AccentStatCard label="Net Cash" value={dashboardData?.netCashSummary ?? 0} icon={<GraduationCap className="h-5 w-5" />} tone="amber" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <SurfaceCard title="Recent Payments" icon={<CreditCard className="h-4 w-4" />}>
            <ListStack
              items={(dashboardData?.recentPayments || []).slice(0, 8)}
              emptyMessage="No recent payments recorded."
              renderItem={(item: any) => (
                <div className="rounded-2xl border border-[#c7d7ff] bg-[linear-gradient(135deg,#edf4ff_0%,#ecf8f1_100%)] px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">{item.receipt_number || `Payment #${item.id}`}</p>
                  <p className="mt-1 text-sm text-slate-500">Amount: {item.amount ?? 0} | Date: {String(item.payment_date || '').slice(0, 10)}</p>
                </div>
              )}
            />
          </SurfaceCard>

          <SurfaceCard title="Finance Summary" icon={<ShieldCheck className="h-4 w-4" />}>
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Unpaid Invoices</p>
                <p className="mt-2 text-lg font-black text-slate-900">{dashboardData?.unpaidInvoices ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Partially Paid</p>
                <p className="mt-2 text-lg font-black text-slate-900">{dashboardData?.partiallyPaidInvoices ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-[linear-gradient(135deg,#ebf3ff_0%,#e8f7ef_100%)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Income vs Expenses</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">Income: {dashboardData?.income ?? 0} | Expenses: {dashboardData?.expenses ?? 0}</p>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    );
  }

  if (role === 'LIBRARIAN') {
    return (
      <div className="space-y-6">
        <HeroPanel
          eyebrow="Library Services"
          title={`Welcome, ${fullName}`}
          subtitle="Monitor circulation, active loans, and overdue books from your librarian workspace."
          chips={['Librarian', 'Library Access', 'Restricted Scope']}
        />
        <QuickProfileFacts
          facts={[
            { label: 'Borrowed Books', value: dashboardData?.booksCurrentlyBorrowed ?? 0 },
            { label: 'Overdue Books', value: dashboardData?.overdueBooks ?? 0 },
            { label: 'Recent Loans', value: (dashboardData?.recentLoans || []).length },
            { label: 'Role Access', value: 'Restricted' },
          ]}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <AccentStatCard label="Borrowed Books" value={dashboardData?.booksCurrentlyBorrowed ?? 0} icon={<Library className="h-5 w-5" />} tone="blue" />
          <AccentStatCard label="Overdue Books" value={dashboardData?.overdueBooks ?? 0} icon={<BookOpenCheck className="h-5 w-5" />} tone="rose" />
          <AccentStatCard label="Recent Loans" value={(dashboardData?.recentLoans || []).length} icon={<BookText className="h-5 w-5" />} tone="green" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeroPanel
        eyebrow="Principal Overview"
        title={`Welcome back, ${fullName}`}
        subtitle="Lead the school with a clear overview of students, teachers, classrooms, and ongoing school activity."
        chips={['Principal', dashboardData?.currentAcademicYear?.name || 'No Current Year', dashboardData?.currentTerm?.name || 'No Current Term']}
      />
      <QuickProfileFacts
        facts={[
          { label: 'Current Academic Year', value: dashboardData?.currentAcademicYear?.name || 'Not Set' },
          { label: 'Current Term', value: dashboardData?.currentTerm?.name || 'Not Set' },
          { label: 'Active Students', value: dashboardData?.totalActiveStudents ?? 0 },
          { label: 'Teachers', value: dashboardData?.totalTeachers ?? 0 },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-4">
        <AccentStatCard label="Active Students" value={dashboardData?.totalActiveStudents ?? 0} icon={<Users className="h-5 w-5" />} tone="blue" />
        <AccentStatCard label="Teachers" value={dashboardData?.totalTeachers ?? 0} icon={<GraduationCap className="h-5 w-5" />} tone="green" />
        <AccentStatCard label="Classrooms" value={dashboardData?.totalClassrooms ?? 0} icon={<School className="h-5 w-5" />} tone="amber" />
        <AccentStatCard label="Announcements" value={(dashboardData?.recentAnnouncements || []).length} icon={<Megaphone className="h-5 w-5" />} tone="rose" />
      </div>
    </div>
  );
}
