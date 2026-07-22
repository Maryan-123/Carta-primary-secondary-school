/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useUIStore } from '../store';
import Dashboard from './Dashboard';
import Reports from './Reports';
import Academic from './Academic';
import Directory from './Directory';
import AcademicsOperational from './AcademicsOperational';
import BillingFinance from './BillingFinance';
import ServicesSettings from './ServicesSettings';
import StudentPortal from './StudentPortal';
import { canAccessPortalTab, PortalTab } from '../security/portal-access';
import { ShieldAlert } from 'lucide-react';

function AccessDenied() {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <ShieldAlert className="h-6 w-6" />
      </div>
      <h2 className="text-lg font-black text-rose-900">Access denied</h2>
      <p className="mt-2 text-sm text-rose-700">
        This portal screen is not available for your account role.
      </p>
    </div>
  );
}

export default function Views() {
  const { activeTab, currentUser } = useUIStore();
  const userRole = currentUser?.role;
  const tab = activeTab as PortalTab;
  const isStudent = userRole === 'STUDENT';
  const isStudentOrParent = userRole === 'STUDENT' || userRole === 'PARENT';

  if (!canAccessPortalTab(userRole, tab)) {
    return (
      <main id="app-main-content" className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f5f8ff_0%,#f4fbf7_52%,#f8fbff_100%)] p-6">
        <AccessDenied />
      </main>
    );
  }

  return (
    <main id="app-main-content" className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f5f8ff_0%,#f4fbf7_52%,#f8fbff_100%)] p-6">
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'profile' && (isStudent ? <StudentPortal /> : <Dashboard />)}
      {activeTab === 'reports' && <Reports />}
      {activeTab === 'academic' && <Academic />}
      
      {/* Directory Tab Views */}
      {['students', 'parents', 'staff'].includes(activeTab) && <Directory />}
      
      {/* Academic Operational Tab Views */}
      {['attendance', 'timetable', 'assignments', 'exams'].includes(activeTab) &&
        (isStudent ? <StudentPortal /> : isStudentOrParent ? <Dashboard /> : <AcademicsOperational />)}
      
      {/* Billing and Finance Tab Views */}
      {['fees', 'finance'].includes(activeTab) &&
        (isStudent ? <StudentPortal /> : isStudentOrParent ? <Dashboard /> : <BillingFinance />)}
      
      {/* Support Services, notices, backups and settings Tab Views */}
      {['library', 'discipline', 'announcements', 'settings', 'audit'].includes(activeTab) && <ServicesSettings />}
    </main>
  );
}
