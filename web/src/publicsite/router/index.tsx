import React from "react";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import PrincipalMessagePage from "../pages/PrincipalMessagePage";
import AcademicsPage from "../pages/AcademicsPage";
import PrimarySchoolPage from "../pages/PrimarySchoolPage";
import SecondarySchoolPage from "../pages/SecondarySchoolPage";
import AdmissionsPage from "../pages/AdmissionsPage";
import AnnouncementsPage from "../pages/AnnouncementsPage";
import AnnouncementDetailsPage from "../pages/AnnouncementDetailsPage";
import EventsPage from "../pages/EventsPage";
import EventDetailsPage from "../pages/EventDetailsPage";
import GalleryPage from "../pages/GalleryPage";
import ContactPage from "../pages/ContactPage";
import FAQPage from "../pages/FAQPage";
import NotFoundPage from "../pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { path: "", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "principal-message", element: elementWithTitle(<PrincipalMessagePage />, "Principal's Message") },
      { path: "academics", element: elementWithTitle(<AcademicsPage />, "Academics Overview") },
      { path: "primary-school", element: elementWithTitle(<PrimarySchoolPage />, "Primary School Division") },
      { path: "secondary-school", element: elementWithTitle(<SecondarySchoolPage />, "Secondary School Division") },
      { path: "admissions", element: elementWithTitle(<AdmissionsPage />, "Admissions Requirements") },
      { path: "announcements", element: elementWithTitle(<AnnouncementsPage />, "Latest Updates") },
      { path: "announcements/:id", element: <AnnouncementDetailsPage /> },
      { path: "events", element: elementWithTitle(<EventsPage />, "Events Calendar") },
      { path: "events/:id", element: <EventDetailsPage /> },
      { path: "gallery", element: elementWithTitle(<GalleryPage />, "Campus Gallery") },
      { path: "contact", element: elementWithTitle(<ContactPage />, "Admissions & Contact Desk") },
      { path: "faq", element: elementWithTitle(<FAQPage />, "FAQ - General Inquiries") },
      { path: "*", element: elementWithTitle(<NotFoundPage />, "Page Not Found") },
    ],
  },
]);

// Helper wrapper to update document title automatically
import { useEffect } from "react";
import { useDocumentTitle } from "../hooks/use-document-title";

function PageTitleWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  useDocumentTitle(title);
  return <>{children}</>;
}

function elementWithTitle(element: React.ReactNode, title: string) {
  return <PageTitleWrapper title={title}>{element}</PageTitleWrapper>;
}
