import { useState } from 'react';
import { PortalRole, NotificationItem, StudentAttendance, PendingTask } from './types';
import {
  STUDENT_TIMETABLE,
  RECENT_RESULTS,
  STUDENT_TASKS,
  CHILDREN_PROFILES,
  UPCOMING_EVENTS,
  ANNOUNCEMENTS,
  TEACHER_SCHEDULE,
  INITIAL_TEACHER_ATTENDANCE,
  INITIAL_NOTIFICATIONS,
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { NotificationPanel } from './components/NotificationPanel';
import { StudentDashboard } from './components/StudentDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { LoginScreen } from './components/LoginScreen';

export default function App() {
  const [currentRole, setCurrentRole] = useState<PortalRole>('student');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // App state
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [tasks, setTasks] = useState<PendingTask[]>(STUDENT_TASKS);
  const [attendanceList, setAttendanceList] = useState<StudentAttendance[]>(INITIAL_TEACHER_ATTENDANCE);

  // Toast message state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
    showToast('Task status updated!');
  };

  const handleUpdateAttendance = (
    id: string,
    newStatus: 'PRESENT' | 'ABSENT' | 'LATE'
  ) => {
    setAttendanceList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    showToast(`Attendance updated for student.`);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read.');
  };

  const handleDismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#1a1b25] flex flex-col pb-20 md:pb-8">
      {/* Top Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={(role) => {
          setCurrentRole(role);
          setActiveTab('dashboard');
          if (role !== 'login') {
            showToast(`Switched view to ${role.toUpperCase()} Portal.`);
          }
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentRole === 'login' && (
          <LoginScreen
            onLoginSuccess={(role) => {
              setCurrentRole(role);
              setActiveTab('dashboard');
            }}
            onShowToast={showToast}
          />
        )}

        {currentRole === 'student' && (
          <StudentDashboard
            timetable={STUDENT_TIMETABLE}
            results={RECENT_RESULTS}
            tasks={tasks}
            announcements={ANNOUNCEMENTS}
            onToggleTask={handleToggleTask}
            onShowToast={showToast}
          />
        )}

        {currentRole === 'parent' && (
          <ParentDashboard
            childrenProfiles={CHILDREN_PROFILES}
            events={UPCOMING_EVENTS}
            announcements={ANNOUNCEMENTS}
            onShowToast={showToast}
          />
        )}

        {currentRole === 'teacher' && (
          <TeacherDashboard
            schedule={TEACHER_SCHEDULE}
            attendanceList={attendanceList}
            onUpdateAttendance={handleUpdateAttendance}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentRole={currentRole}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'dashboard') {
            showToast(`Opened ${tab.toUpperCase()} view.`);
          }
        }}
      />

      {/* Slide-Over Notification Drawer */}
      <NotificationPanel
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onDismiss={handleDismissNotification}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 md:bottom-6 right-4 z-50 bg-[#1a1b25] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="material-symbols-outlined text-[#84fb9d] text-base">
            check_circle
          </span>
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
