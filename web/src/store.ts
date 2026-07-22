/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { User, Notification, UserRole } from './types';
import { api } from './api';

interface UIState {
  currentUser: User | null;
  activeTab: string;
  isProfileOpen: boolean;
  notifications: Notification[];
  isLoading: boolean;
  isOfflineMode: boolean;
  confirmState: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    tone: 'danger' | 'primary';
  };
  setCurrentUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
  openProfileView: () => void;
  closeProfileView: () => void;
  setOfflineMode: (offline: boolean) => void;
  fetchCurrentUser: () => Promise<void>;
  addNotification: (title: string, message: string) => void;
  markNotificationsAsRead: () => void;
  openConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'primary';
  }) => Promise<boolean>;
  resolveConfirm: (confirmed: boolean) => void;
}

let confirmResolver: ((confirmed: boolean) => void) | null = null;

export const useUIStore = create<UIState>((set, get) => ({
  currentUser: null,
  activeTab: 'dashboard',
  isProfileOpen: false,
  notifications: [
    { id: 'not-1', userId: 'usr-admin', title: 'New Attendance Submission', message: 'Abdi Hassan recorded Grade 9 section A morning attendance.', isRead: false, createdAt: new Date().toISOString() },
    { id: 'not-2', userId: 'usr-admin', title: 'Fee Payment Received', message: 'Invoice INV-2026-0001 was paid in full ($175) via Mobile Money.', isRead: false, createdAt: new Date().toISOString() }
  ],
  isLoading: false,
  isOfflineMode: false,
  confirmState: {
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    tone: 'danger',
  },

  setCurrentUser: (user) =>
    set({
      currentUser: user,
      activeTab: 'dashboard',
      isProfileOpen: false,
    }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  openProfileView: () => set({ isProfileOpen: true }),
  closeProfileView: () => set({ isProfileOpen: false }),
  setOfflineMode: (offline) => {
    api.toggleMode(offline);
    set({ isOfflineMode: offline });
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });
    try {
      const res = await api.auth.getCurrentUser();
      if (res.success && res.data) {
        set({ currentUser: res.data });
      } else {
        set({ currentUser: null });
      }
    } catch (err) {
      console.error("Could not fetch user session", err);
      set({ currentUser: null });
    } finally {
      set({ isLoading: false });
    }
  },

  addNotification: (title, message) => {
    const newNot: Notification = {
      id: `not-${Date.now()}`,
      userId: get().currentUser?.id || 'all',
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    set({ notifications: [newNot, ...get().notifications] });
  },

  markNotificationsAsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, isRead: true }))
    });
  },

  openConfirm: async ({ title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', tone = 'danger' }) => {
    if (confirmResolver) {
      confirmResolver(false);
      confirmResolver = null;
    }

    set({
      confirmState: {
        isOpen: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        tone,
      }
    });

    return new Promise<boolean>((resolve) => {
      confirmResolver = resolve;
    });
  },

  resolveConfirm: (confirmed: boolean) => {
    set((state) => ({
      confirmState: {
        ...state.confirmState,
        isOpen: false,
      }
    }));

    if (confirmResolver) {
      confirmResolver(confirmed);
      confirmResolver = null;
    }
  }
}));
