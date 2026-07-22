import React, { useMemo, useState } from 'react';
import { useUIStore } from '../store';
import { api } from '../api';
import cartaLogo from '../assets/branding/carta-logo.jpeg';
import { PortalTab, ROLE_TAB_ACCESS } from '../security/portal-access';
import {
  BookMarked,
  ChevronDown,
  ClipboardList,
  Clock,
  DollarSign,
  GraduationCap,
  LayoutDashboard,
  FileBarChart,
  Library,
  LogOut,
  Megaphone,
  Scroll,
  Settings,
  Shield,
  UserCheck,
  UserRound,
  Users,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

type NavGroup = 'Overview' | 'People' | 'Academic' | 'Finance' | 'Services' | 'System' | 'Reports' | 'Account';

interface SidebarItem {
  id: PortalTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: NavGroup;
}

const navItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { id: 'reports', label: 'Reports Center', icon: FileBarChart, group: 'Reports' },
  { id: 'students', label: 'Student Directory', icon: Users, group: 'People' },
  { id: 'parents', label: 'Parent Records', icon: UserCheck, group: 'People' },
  { id: 'staff', label: 'Staff & Payroll', icon: UserCheck, group: 'People' },
  { id: 'academic', label: 'Subjects & Teachers', icon: BookMarked, group: 'Academic' },
  { id: 'attendance', label: 'Attendance', icon: Calendar, group: 'Academic' },
  { id: 'timetable', label: 'Schedule', icon: Clock, group: 'Academic' },
  { id: 'assignments', label: 'Assignments', icon: ClipboardList, group: 'Academic' },
  { id: 'exams', label: 'Exam', icon: GraduationCap, group: 'Academic' },
  { id: 'fees', label: 'Fee Billing', icon: DollarSign, group: 'Finance' },
  { id: 'finance', label: 'Finance', icon: DollarSign, group: 'Finance' },
  { id: 'library', label: 'Library Catalog', icon: Library, group: 'Services' },
  { id: 'discipline', label: 'Discipline Cases', icon: AlertTriangle, group: 'Services' },
  { id: 'announcements', label: 'Notices & Events', icon: Megaphone, group: 'Services' },
  { id: 'settings', label: 'School Settings', icon: Settings, group: 'System' },
  { id: 'audit', label: 'System Audit Logs', icon: Scroll, group: 'System' },
  { id: 'profile', label: 'Profile', icon: UserRound, group: 'Account' },
];

const defaultOpenGroups: Record<NavGroup, boolean> = {
  Overview: true,
  People: true,
  Academic: true,
  Finance: true,
  Services: true,
  System: true,
  Reports: true,
  Account: true,
};

export default function Sidebar() {
  const { currentUser, activeTab, setActiveTab, setCurrentUser, openProfileView } = useUIStore();
  const [openGroups, setOpenGroups] = useState<Record<NavGroup, boolean>>(defaultOpenGroups);

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
  };

  const userRole = currentUser?.role || 'STUDENT';
  const allowedTabs = ROLE_TAB_ACCESS[userRole];
  const filteredNavItems = navItems.filter((item) => allowedTabs.includes(item.id));

  const groupedItems = useMemo(() => {
    return filteredNavItems.reduce<Record<NavGroup, SidebarItem[]>>((acc, item) => {
      acc[item.group].push(item);
      return acc;
    }, {
      Overview: [],
      People: [],
      Academic: [],
      Finance: [],
      Services: [],
      System: [],
      Reports: [],
      Account: [],
    });
  }, [filteredNavItems]);

  const toggleGroup = (group: NavGroup) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <aside id="app-sidebar" className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-[linear-gradient(180deg,#f8fafc_0%,#eef6ff_38%,#eefbf4_100%)] text-slate-700">
      <div className="h-20 space-x-3 border-b border-slate-200 bg-white/90 px-6 backdrop-blur">
        <div className="flex h-full items-center">
        <div className="shrink-0">
          <img
            src={cartaLogo}
            alt="CARTA School logo"
            className="h-11 w-11 rounded-full border border-blue-200 bg-white p-1 shadow-sm"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="truncate text-sm font-black tracking-wide text-slate-900">CARTA SCHOOL</span>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Primary & Secondary</span>
        </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-3">
        {Object.entries(groupedItems).map(([groupName, items]) => {
          if (!items.length) {
            return null;
          }

          const group = groupName as NavGroup;
          const isOpen = openGroups[group];

          return (
            <div key={group}>
              <button
                onClick={() => toggleGroup(group)}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-black uppercase tracking-widest text-slate-500 transition hover:bg-white hover:text-slate-800"
              >
                <span className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-blue-500" />
                  {group}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen ? (
                <div className="mt-2 space-y-1">
                  {items.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition ${
                          isActive
                            ? 'bg-[linear-gradient(135deg,#1A46FD_0%,#019444_100%)] text-white shadow-lg shadow-blue-200/60'
                            : 'text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                        }`}
                      >
                        <IconComponent className="mr-3 h-5 w-5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="flex flex-col border-t border-slate-200 bg-white/90 p-4">
        <button
          onClick={openProfileView}
          className="mb-4 flex w-full items-center space-x-3 rounded-2xl px-2 py-2 text-left transition hover:bg-slate-50"
          title="Open profile"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#1A46FD_0%,#019444_100%)] text-white font-bold uppercase ring-2 ring-white shadow-sm">
            {currentUser?.firstName?.charAt(0)}{currentUser?.lastName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {currentUser?.firstName} {currentUser?.lastName}
            </p>
            <span className="mt-0.5 inline-flex items-center rounded border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              {currentUser?.role}
            </span>
          </div>
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
        >
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
