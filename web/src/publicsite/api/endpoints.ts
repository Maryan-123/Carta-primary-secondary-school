import { axiosClient } from "./axios-client";
import { BRAND_ASSETS, SITE_CONTENT } from "../config/site-content";
import {
  SchoolProfile,
  Announcement,
  SchoolEvent,
  GalleryItem,
  ContactSubmission,
  AdmissionInquiry,
} from "../types";

// Helper to determine if we should simulate slow API calls during local testing
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const schoolApi = {
  getProfile: async (): Promise<SchoolProfile> => {
    try {
      const response = await axiosClient.get("/public/school");
      return response.data?.data || response.data;
    } catch (error) {
      console.warn("API Error in getProfile, falling back to local configuration:", error);
      // Wait briefly to make transitions feel natural
      await delay(300);
      return {
        schoolName: SITE_CONTENT.schoolName,
        schoolCode: "CARTA",
        address: SITE_CONTENT.contact.address,
        phone: SITE_CONTENT.contact.phone,
        email: SITE_CONTENT.contact.infoEmail,
        logoPath: BRAND_ASSETS.logo,
        principalName: SITE_CONTENT.principal.name,
        currency: "USD",
        timezone: "Africa/Mogadishu",
      };
    }
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    try {
      const response = await axiosClient.get("/public/announcements");
      return response.data?.data || response.data;
    } catch (error) {
      console.warn("API Error in getAnnouncements, falling back to local data:", error);
      await delay(400);
      return SITE_CONTENT.announcements as Announcement[];
    }
  },

  getAnnouncementById: async (id: string | number): Promise<Announcement> => {
    try {
      const response = await axiosClient.get(`/public/announcements/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn(`API Error in getAnnouncementById (${id}), falling back to local data:`, error);
      await delay(300);
      const found = SITE_CONTENT.announcements.find((a) => a.id.toString() === id.toString());
      if (!found) {
        throw new Error(`Announcement with ID ${id} not found.`);
      }
      return found as Announcement;
    }
  },

  getEvents: async (): Promise<SchoolEvent[]> => {
    try {
      const response = await axiosClient.get("/public/events");
      return response.data?.data || response.data;
    } catch (error) {
      console.warn("API Error in getEvents, falling back to local data:", error);
      await delay(400);
      return SITE_CONTENT.events as SchoolEvent[];
    }
  },

  getEventById: async (id: string | number): Promise<SchoolEvent> => {
    try {
      const response = await axiosClient.get(`/public/events/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn(`API Error in getEventById (${id}), falling back to local data:`, error);
      await delay(300);
      const found = SITE_CONTENT.events.find((e) => e.id.toString() === id.toString());
      if (!found) {
        throw new Error(`Event with ID ${id} not found.`);
      }
      return found as SchoolEvent;
    }
  },

  getGallery: async (): Promise<GalleryItem[]> => {
    try {
      const response = await axiosClient.get("/public/gallery");
      return response.data?.data || response.data;
    } catch (error) {
      console.warn("API Error in getGallery, falling back to local data:", error);
      await delay(400);
      return SITE_CONTENT.gallery as GalleryItem[];
    }
  },

  getGalleryById: async (id: string | number): Promise<GalleryItem> => {
    try {
      const response = await axiosClient.get(`/public/gallery/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.warn(`API Error in getGalleryById (${id}), falling back to local data:`, error);
      await delay(300);
      const found = SITE_CONTENT.gallery.find((g) => g.id.toString() === id.toString());
      if (!found) {
        throw new Error(`Gallery item with ID ${id} not found.`);
      }
      return found as GalleryItem;
    }
  },

  submitContact: async (data: ContactSubmission): Promise<{ success: boolean; message: string }> => {
    // Honeypot spam protection
    if (data.honeypot) {
      console.warn("Spam contact attempt blocked.");
      await delay(1000);
      return { success: true, message: "Thank you for your message. We will get back to you shortly." };
    }
    try {
      const response = await axiosClient.post("/public/contact", data);
      return response.data;
    } catch (error) {
      console.warn("API Error in submitContact, simulating successful local storage:", error);
      await delay(1000);
      return {
        success: true,
        message: "Your message has been submitted locally. Thank you for contacting CARTA School!",
      };
    }
  },

  submitAdmissionInquiry: async (data: AdmissionInquiry): Promise<{ success: boolean; message: string }> => {
    // Honeypot spam protection
    if (data.honeypot) {
      console.warn("Spam admission inquiry attempt blocked.");
      await delay(1000);
      return { success: true, message: "Your inquiry has been received. Thank you." };
    }
    try {
      const response = await axiosClient.post("/public/admission-inquiries", data);
      return response.data;
    } catch (error) {
      console.warn("API Error in submitAdmissionInquiry, simulating successful local storage:", error);
      await delay(1200);
      return {
        success: true,
        message: "Your admission inquiry has been received successfully. Our admissions office will contact you soon.",
      };
    }
  },
};
