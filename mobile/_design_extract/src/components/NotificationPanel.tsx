import React from 'react';
import { NotificationItem } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onDismiss: (id: string) => void;
}

export const NotificationPanel: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onDismiss,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-xs">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E4E7EC] animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-[#E4E7EC] flex items-center justify-between bg-[#fbf8ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0030ce]">notifications</span>
            <h3 className="font-bold font-headline text-lg text-[#1a1b25]">Notifications</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 text-[#747688] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#f4f2ff] border-b border-[#E4E7EC] flex items-center justify-between">
          <span className="text-xs text-[#444657] font-medium">
            {notifications.filter(n => !n.read).length} Unread
          </span>
          <button
            onClick={onMarkAllRead}
            className="text-xs font-semibold text-[#0030ce] hover:underline"
          >
            Mark all read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-[#747688] text-sm">
              No notifications right now.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-xl border transition-all relative ${
                  item.read
                    ? 'bg-white border-[#E4E7EC]'
                    : 'bg-[#edecfb] border-[#bac3ff]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        item.type === 'warning'
                          ? 'bg-[#ba1a1a]'
                          : item.type === 'success'
                          ? 'bg-[#006d30]'
                          : 'bg-[#0030ce]'
                      }`}
                    />
                    <h4 className="text-sm font-semibold text-[#1a1b25]">
                      {item.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => onDismiss(item.id)}
                    className="text-xs text-[#747688] hover:text-[#ba1a1a]"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </button>
                </div>
                <p className="text-xs text-[#444657] mt-1">{item.message}</p>
                <span className="text-[10px] text-[#747688] block mt-2 text-right">
                  {item.time}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
