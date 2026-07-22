export interface NavItem {
  label: string;
  to?: string;
  dropdown?: {
    label: string;
    to: string;
  }[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Home", to: "/" },
  {
    label: "About Us",
    dropdown: [
      { label: "About CARTA", to: "/about" },
      { label: "Principal's Message", to: "/principal-message" },
      { label: "Our Core Values", to: "/about#values" },
    ],
  },
  {
    label: "Academics",
    dropdown: [
      { label: "Academic Overview", to: "/academics" },
      { label: "Primary School", to: "/primary-school" },
      { label: "Secondary School", to: "/secondary-school" },
    ],
  },
  { label: "Admissions", to: "/admissions" },
  { label: "Announcements", to: "/announcements" },
  { label: "Events", to: "/events" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact", to: "/contact" },
  { label: "FAQ", to: "/faq" },
];
