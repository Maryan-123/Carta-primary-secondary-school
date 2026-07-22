import React, { useState } from 'react';
import { useUIStore } from './store';
import { api } from './api';
import Sidebar from './components/Sidebar';
import Views from './components/Views';
import { Bell, LogOut, Mail, Phone, ShieldCheck, UserRound, Wifi, WifiOff, X } from 'lucide-react';

function ProfileModal({
  isOpen,
  onClose,
  currentUser,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}) {
  if (!isOpen || !currentUser) {
    return null;
  }

  const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.username;
  const initials =
    `${currentUser.firstName?.slice(0, 1) || ''}${currentUser.lastName?.slice(0, 1) || ''}`.toUpperCase() || 'CP';

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.25)]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(26,70,253,0.18),_transparent_35%),linear-gradient(135deg,#ffffff_0%,#f4f8ff_45%,#eefaf4_100%)] px-6 py-7">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#1A46FD]/10 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#1A46FD_0%,#019444_100%)] text-2xl font-black text-white shadow-[0_18px_45px_rgba(26,70,253,0.24)]">
                {initials}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#019444]">My Profile</p>
                <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">{fullName}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                    {currentUser.role}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                    @{currentUser.username}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                    {currentUser.status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-500 transition hover:text-slate-900"
              title="Close profile"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-[1fr_0.95fr]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#1A46FD]" />
                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-800">Identity</h3>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Full Name</p>
                  <p className="mt-1 font-semibold text-slate-900">{fullName}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Username</p>
                  <p className="mt-1 font-semibold text-slate-900">@{currentUser.username}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Role</p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.role}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1A46FD]" />
                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-800">Access Summary</h3>
              </div>
              <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600">
                This profile belongs only to the current logged-in user. Access to records and portal content is filtered by the role assigned to this account.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#1A46FD]" />
                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-800">Contact</h3>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Email</p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.email || 'No email on file'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    Phone
                  </p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.phone || 'No phone on file'}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.22em] text-slate-800">Linked Profile IDs</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Teacher</p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.linkedTeacherId || 'Not linked'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Student</p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.linkedStudentId || 'Not linked'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Parent</p>
                  <p className="mt-1 font-semibold text-slate-900">{currentUser.linkedParentId || 'Not linked'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortalShell() {
  const { currentUser, notifications, markNotificationsAsRead, setCurrentUser, isOfflineMode, openProfileView, closeProfileView, isProfileOpen } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleLogout = async () => {
    await api.auth.logout();
    setCurrentUser(null);
  };

  return (
    <div className="portal-shell flex h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top,#eef4ff_0%,#f4fbf7_42%,#edf3ff_100%)] font-sans text-slate-800">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-10 flex h-16 shrink-0 items-center justify-between border-b border-[#d9e2ff] bg-[linear-gradient(180deg,#ffffff_0%,#f6faff_58%,#f1fbf6_100%)] px-6 shadow-[0_10px_28px_rgba(26,70,253,0.06)]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {isOfflineMode ? (
                <div className="flex items-center space-x-1.5 rounded-full border border-[#bce9cf] bg-[#edf9f2] px-3 py-1 text-xs font-black text-[#019444]">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>LOCAL DIRECT ACCESS</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 rounded-full border border-[#d8e1ff] bg-[#eef3ff] px-3 py-1 text-xs font-black text-[#1A46FD]">
                  <Wifi className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                  <span>LIVE BACKEND CONNECTED</span>
                </div>
              )}
            </div>

            <span className="hidden items-center text-[11px] font-bold uppercase tracking-wider text-slate-400 md:inline-flex">
              Node ID: CARTA-MOG-01
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) {
                    markNotificationsAsRead();
                  }
                }}
                className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 w-4 animate-bounce items-center justify-center rounded-full border-2 border-white bg-rose-600 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-[#d3dce7] bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] py-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                    <span className="text-sm font-extrabold text-slate-800">System Activity Logs</span>
                    <button
                      onClick={() => markNotificationsAsRead()}
                      className="text-xs font-bold text-[#1A46FD] hover:underline"
                    >
                      Dismiss all
                    </button>
                  </div>
                  <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No system events logged today.</p>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="flex flex-col space-y-1 p-3 hover:bg-[#f5f8fc]">
                          <span className="text-xs font-black text-slate-800">{notification.title}</span>
                          <span className="text-xs leading-snug text-slate-500">{notification.message}</span>
                          <span className="font-mono text-[9px] text-slate-400">
                            {notification.createdAt.split('T')[1]?.slice(0, 5) ?? '--:--'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <button
                onClick={openProfileView}
                className="flex items-center space-x-3 rounded-2xl px-2 py-1 transition hover:bg-slate-50"
                title="Open profile"
              >
                <div className="hidden text-right sm:block">
                  <h4 className="text-sm font-black text-slate-800">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </h4>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#019444]">
                    {currentUser?.role}
                  </span>
                </div>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 text-xs font-black text-white shadow-inner">
                  {currentUser?.firstName?.slice(0, 1)}
                  {currentUser?.lastName?.slice(0, 1)}
                </div>
              </button>

              <button
                onClick={handleLogout}
                title="Log out session"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 transition hover:border-rose-300 hover:bg-rose-100 hover:text-rose-700"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        <Views />
      </div>

      <ProfileModal isOpen={isProfileOpen} onClose={closeProfileView} currentUser={currentUser} />
    </div>
  );
}
