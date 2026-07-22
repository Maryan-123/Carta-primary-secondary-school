import React from 'react';
import { PortalRole } from '../types';
import { SCHOOL_LOGO_URL } from '../data/mockData';

interface Props {
  currentRole: PortalRole;
  onSelectRole: (role: PortalRole) => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<Props> = ({
  currentRole,
  onSelectRole,
  unreadNotificationsCount,
  onOpenNotifications,
}) => {
  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 flex justify-between items-center px-4 md:px-8 w-full h-16 border-b border-[#E4E7EC] shadow-2xs">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1a46fd] rounded-xl flex items-center justify-center overflow-hidden shadow-xs">
          <img 
            src={SCHOOL_LOGO_URL} 
            alt="CARTA School Logo" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-lg text-[#0030ce] leading-tight">
            CARTA School
          </span>
          <span className="text-[10px] text-[#747688] hidden sm:inline">
            Management Portal
          </span>
        </div>
      </div>

      {/* Role Quick Switcher Pills */}
      <div className="flex items-center bg-[#f4f2ff] p-1 rounded-full border border-[#c4c5da] text-xs font-medium">
        <button
          onClick={() => onSelectRole('student')}
          className={`px-2.5 py-1 rounded-full transition-all ${
            currentRole === 'student'
              ? 'bg-[#0030ce] text-white shadow-xs font-semibold'
              : 'text-[#444657] hover:text-[#0030ce]'
          }`}
          title="Switch to Student Dashboard"
        >
          Student
        </button>
        <button
          onClick={() => onSelectRole('parent')}
          className={`px-2.5 py-1 rounded-full transition-all ${
            currentRole === 'parent'
              ? 'bg-[#0030ce] text-white shadow-xs font-semibold'
              : 'text-[#444657] hover:text-[#0030ce]'
          }`}
          title="Switch to Parent Dashboard"
        >
          Parent
        </button>
        <button
          onClick={() => onSelectRole('teacher')}
          className={`px-2.5 py-1 rounded-full transition-all ${
            currentRole === 'teacher'
              ? 'bg-[#0030ce] text-white shadow-xs font-semibold'
              : 'text-[#444657] hover:text-[#0030ce]'
          }`}
          title="Switch to Teacher Dashboard"
        >
          Teacher
        </button>
        <button
          onClick={() => onSelectRole('login')}
          className={`px-2 py-1 rounded-full transition-all ${
            currentRole === 'login'
              ? 'bg-[#1a1b25] text-white shadow-xs font-semibold'
              : 'text-[#747688] hover:text-[#1a1b25]'
          }`}
          title="View Login Screen"
        >
          Logout
        </button>
      </div>

      {/* Right Controls: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-[#0030ce] hover:bg-[#f4f2ff] transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Profile Info based on role */}
        <div className="hidden md:flex items-center gap-2 border-l border-[#E4E7EC] pl-3">
          <div className="text-right">
            <p className="text-xs font-bold text-[#1a1b25]">
              {currentRole === 'student' && 'Alex Johnson'}
              {currentRole === 'parent' && 'Parent Account'}
              {currentRole === 'teacher' && 'Mr. Ibrahim'}
              {currentRole === 'login' && 'Guest'}
            </p>
            <p className="text-[10px] text-[#747688]">
              {currentRole === 'student' && 'Grade 11-B'}
              {currentRole === 'parent' && 'Sarah & John'}
              {currentRole === 'teacher' && 'Math & Science'}
              {currentRole === 'login' && 'Portal Sign-In'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#84fb9d] flex items-center justify-center font-bold text-[#00210a] text-xs overflow-hidden border border-[#c4c5da]">
            {currentRole === 'student' && 'AJ'}
            {currentRole === 'parent' && 'P'}
            {currentRole === 'teacher' && (
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwtdS8nFT85_PywbTPFVOO5rzADfnPWIe2jgTzUcyFpLnkTgdaD4Ug-HH03eIhXvOUiCndWZ9kj7_2aZihA1lmU9j-wuxlcJOdZ6G-WIb9RpkUZogYGu9WN5mCkGK9sLtHsjk5hUEoMoyQMeziyksE1ML9k7XDuJIXPbi0DcSgBjN2ee0Uzwlb_YDav3OLRh1Ut3kFyt6HMDyot3VqL0j_ztwvRIZHIK2uLHU_B0q-SX8qneKEMibErVoSuAJeJfZApDoxAK22JfuB"
                alt="Teacher"
                className="w-full h-full object-cover"
              />
            )}
            {currentRole === 'login' && '?'}
          </div>
        </div>
      </div>
    </header>
  );
};
