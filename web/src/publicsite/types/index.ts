export interface SchoolProfile {
  schoolName: string;
  schoolCode: string;
  address: string;
  phone: string;
  email: string;
  logoPath: string;
  principalName: string;
  currency: string;
  timezone: string;
}

export interface Announcement {
  id: number | string;
  title: string;
  content: string;
  excerpt?: string;
  audience: "public" | "ALL" | "staff" | "students";
  publishDate: string;
  expiryDate?: string | null;
  isActive: boolean;
  authorName?: string;
}

export interface SchoolEvent {
  id: number | string;
  title: string;
  description: string;
  eventType: string; // e.g., Academic, Sports, Holiday, Parent-Teacher
  imagePath?: string;
  startDate: string;
  endDate?: string;
  time: string;
  location: string;
  isPublic: boolean;
}

export interface GalleryItem {
  id: number | string;
  title: string;
  category: string; // Activities, Classrooms, Events, Campus, etc.
  imagePath: string;
  description?: string;
  date?: string;
}

export interface ContactSubmission {
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  honeypot?: string;
}

export interface AdmissionInquiry {
  parentFullName: string;
  phone: string;
  alternativePhone?: string;
  email?: string;
  studentFullName: string;
  studentDateOfBirth: string;
  desiredLevel: string;
  previousSchool?: string;
  preferredStartTerm: string;
  message?: string;
  consentCheckbox: boolean;
  honeypot?: string;
}
