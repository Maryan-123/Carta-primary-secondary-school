import React from 'react';
import { PortalRole } from '../types';

interface Props {
  currentRole: PortalRole;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<Props> = ({ currentRole, activeTab, onTabChange }) => {
  if (currentRole === 'login') return null;

  const renderStudentNav = () => (
    <>
      <button
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'dashboard'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
          dashboard
        </span>
        <span className="text-[11px] font-medium">Dashboard</span>
      </button>

      <button
        onClick={() => onTabChange('timetable')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'timetable'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">calendar_today</span>
        <span className="text-[11px] font-medium">Timetable</span>
      </button>

      <button
        onClick={() => onTabChange('tasks')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'tasks'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">assignment</span>
        <span className="text-[11px] font-medium">Tasks</span>
      </button>

      <button
        onClick={() => onTabChange('grades')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'grades'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">grade</span>
        <span className="text-[11px] font-medium">Grades</span>
      </button>

      <button
        onClick={() => onTabChange('profile')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'profile'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">person</span>
        <span className="text-[11px] font-medium">Profile</span>
      </button>
    </>
  );

  const renderParentNav = () => (
    <>
      <button
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'dashboard'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
          dashboard
        </span>
        <span className="text-[11px] font-medium">Dashboard</span>
      </button>

      <button
        onClick={() => onTabChange('children')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'children'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">group</span>
        <span className="text-[11px] font-medium">Children</span>
      </button>

      <button
        onClick={() => onTabChange('attendance')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'attendance'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">calendar_today</span>
        <span className="text-[11px] font-medium">Attendance</span>
      </button>

      <button
        onClick={() => onTabChange('academics')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'academics'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">grade</span>
        <span className="text-[11px] font-medium">Academics</span>
      </button>

      <button
        onClick={() => onTabChange('more')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'more'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">more_horiz</span>
        <span className="text-[11px] font-medium">More</span>
      </button>
    </>
  );

  const renderTeacherNav = () => (
    <>
      <button
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'dashboard'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: activeTab === 'dashboard' ? "'FILL' 1" : "'FILL' 0" }}>
          dashboard
        </span>
        <span className="text-[11px] font-medium">Dashboard</span>
      </button>

      <button
        onClick={() => onTabChange('classes')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'classes'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">calendar_today</span>
        <span className="text-[11px] font-medium">Classes</span>
      </button>

      <button
        onClick={() => onTabChange('attendance')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'attendance'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">assignment</span>
        <span className="text-[11px] font-medium">Attendance</span>
      </button>

      <button
        onClick={() => onTabChange('assignments')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'assignments'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">grade</span>
        <span className="text-[11px] font-medium">Assignments</span>
      </button>

      <button
        onClick={() => onTabChange('more')}
        className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
          activeTab === 'more'
            ? 'bg-[#1a46fd] text-white rounded-full px-5 py-1 scale-95 shadow-xs font-semibold'
            : 'text-[#444657] hover:text-[#0030ce]'
        }`}
      >
        <span className="material-symbols-outlined text-xl">person</span>
        <span className="text-[11px] font-medium">More</span>
      </button>
    </>
  );

  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-2 bg-white/95 backdrop-blur-md border-t border-[#c4c5da] rounded-t-xl shadow-lg md:hidden">
      {currentRole === 'student' && renderStudentNav()}
      {currentRole === 'parent' && renderParentNav()}
      {currentRole === 'teacher' && renderTeacherNav()}
    </nav>
  );
};
