import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useUIStore } from './store';
import PortalShell from './PortalShell';
import ConfirmDialog from './components/ConfirmDialog';
import Login from './components/Login';
import PublicLayout from './publicsite/layouts/PublicLayout';
import HomePage from './publicsite/pages/HomePage';
import AboutPage from './publicsite/pages/AboutPage';
import PrincipalMessagePage from './publicsite/pages/PrincipalMessagePage';
import AcademicsPage from './publicsite/pages/AcademicsPage';
import PrimarySchoolPage from './publicsite/pages/PrimarySchoolPage';
import SecondarySchoolPage from './publicsite/pages/SecondarySchoolPage';
import AdmissionsPage from './publicsite/pages/AdmissionsPage';
import AnnouncementsPage from './publicsite/pages/AnnouncementsPage';
import AnnouncementDetailsPage from './publicsite/pages/AnnouncementDetailsPage';
import EventsPage from './publicsite/pages/EventsPage';
import EventDetailsPage from './publicsite/pages/EventDetailsPage';
import GalleryPage from './publicsite/pages/GalleryPage';
import ContactPage from './publicsite/pages/ContactPage';
import FAQPage from './publicsite/pages/FAQPage';
import NotFoundPage from './publicsite/pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppRoutes() {
  const { currentUser, fetchCurrentUser, isLoading } = useUIStore();

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 border-4 border-t-blue-500 border-slate-700 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium text-sm tracking-wide uppercase">
          Initializing CARTA school system...
        </p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/portal" replace /> : <Login />}
      />
      <Route
        path="/portal"
        element={currentUser ? <PortalShell /> : <Navigate to="/login" replace />}
      />
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="principal-message" element={<PrincipalMessagePage />} />
        <Route path="academics" element={<AcademicsPage />} />
        <Route path="primary-school" element={<PrimarySchoolPage />} />
        <Route path="secondary-school" element={<SecondarySchoolPage />} />
        <Route path="admissions" element={<AdmissionsPage />} />
        <Route path="announcements" element={<AnnouncementsPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailsPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:id" element={<EventDetailsPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3800,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '18px',
            fontSize: '13px',
            fontWeight: 700,
            border: '1px solid #d9e2ff',
            boxShadow: '0 18px 45px rgba(26, 70, 253, 0.12)',
            padding: '14px 16px',
          },
          success: {
            iconTheme: {
              primary: '#0f9f55',
              secondary: '#effdf5',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff1f2',
            },
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ConfirmDialog />
    </QueryClientProvider>
  );
}
