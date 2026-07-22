import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, BookOpen, Sparkles, Image as ImageIcon } from "lucide-react";
import { Announcement, SchoolEvent, GalleryItem } from "../../types";

const getEventTheme = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "sports":
      return {
        gradient: "from-[#0f766e] via-[#0891b2] to-[#1d4ed8]",
        soft: "bg-cyan-50 border-cyan-100 text-cyan-900",
      };
    case "parent-teacher":
      return {
        gradient: "from-[#7c2d12] via-[#b45309] to-[#f59e0b]",
        soft: "bg-amber-50 border-amber-100 text-amber-900",
      };
    default:
      return {
        gradient: "from-[#172033] via-[#1A46FD] to-[#019444]",
        soft: "bg-emerald-50 border-emerald-100 text-emerald-900",
      };
  }
};

// --- Announcement Card ---
export function AnnouncementCard({ item }: { item: Announcement; key?: any }) {
  const publishDateStr = new Date(item.publishDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="bg-white border border-[#E4E7EC] hover:border-[#1A46FD] hover:shadow-lg rounded-xl overflow-hidden transition-all duration-300 flex flex-col h-full group">
      <div className="p-6 flex-grow space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
          <span className="bg-[#EAF0FF] text-[#1A46FD] px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            {item.audience === "ALL" ? "Public" : item.audience}
          </span>
          <span>•</span>
          <time dateTime={item.publishDate}>{publishDateStr}</time>
        </div>
        <h3 className="text-lg font-bold text-[#172033] leading-snug group-hover:text-[#1A46FD] transition-colors line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-[#667085] leading-relaxed line-clamp-3">
          {item.excerpt || item.content}
        </p>
      </div>
      <div className="p-6 pt-0 mt-auto border-t border-[#E4E7EC]/50 bg-[#F7F9FC]/40 flex items-center justify-between">
        <span className="text-xs text-[#667085] font-medium">By {item.authorName || "Administration"}</span>
        <Link
          to={`/announcements/${item.id}`}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A46FD] hover:text-[#1232B8] transition-colors group"
        >
          <span>Read Details</span>
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </article>
  );
}

// --- Event Card ---
export function EventCard({ item }: { item: SchoolEvent; key?: any }) {
  const startDate = new Date(item.startDate);
  const dayStr = startDate.toLocaleDateString("en-US", { day: "2-digit" });
  const monthStr = startDate.toLocaleDateString("en-US", { month: "short" });
  const theme = getEventTheme(item.eventType);

  return (
    <article className="bg-white border border-[#E4E7EC] hover:border-[#019444] hover:shadow-xl rounded-[24px] overflow-hidden transition-all duration-300 flex flex-col h-full group">
      <div className={`relative overflow-hidden bg-gradient-to-br ${theme.gradient} p-6 min-h-52`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white_0,transparent_32%),radial-gradient(circle_at_bottom_left,white_0,transparent_28%)]" />
        <div className="relative flex items-start justify-between gap-4">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-white">
            {item.eventType}
          </span>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white/92 text-[#172033] w-16 h-16 shadow-lg">
            <span className="text-2xl font-black leading-none">{dayStr}</span>
            <span className="text-[11px] font-black uppercase tracking-widest mt-0.5">{monthStr}</span>
          </div>
        </div>
        <div className="relative mt-12">
          <h3 className="text-xl font-black text-white leading-snug max-w-xs">
            <Link to={`/events/${item.id}`} className="hover:underline decoration-white/40 underline-offset-4">
              {item.title}
            </Link>
          </h3>
          <p className="mt-3 text-sm leading-6 max-w-sm text-white/85 line-clamp-3">
            {item.description}
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-2 gap-3 text-xs font-medium">
        <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${theme.soft}`}>
          <Clock className="w-3.5 h-3.5 text-[#1A46FD] shrink-0" />
          <span>{item.time}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[#E4E7EC] bg-[#F7F9FC] px-3 py-2 text-[#667085]">
          <MapPin className="w-3.5 h-3.5 text-[#019444] shrink-0" />
          <span>{item.location}</span>
        </div>
      </div>
    </article>
  );
}

// --- Academic Program Card ---
export function ProgramCard({
  title,
  description,
  to,
  icon,
}: {
  title: string;
  description: string;
  to: string;
  icon?: "primary" | "secondary";
}) {
  return (
    <div className="bg-white border border-[#E4E7EC] hover:border-[#1A46FD] hover:shadow-xl rounded-xl p-6 sm:p-8 transition-all duration-300 flex flex-col h-full group">
      <div className="p-3 rounded-xl bg-[#EAF0FF] text-[#1A46FD] w-fit mb-5 group-hover:bg-[#1A46FD] group-hover:text-white transition-all">
        {icon === "secondary" ? (
          <Sparkles className="w-6 h-6" />
        ) : (
          <BookOpen className="w-6 h-6" />
        )}
      </div>
      <h3 className="text-xl font-bold text-[#172033] mb-3 group-hover:text-[#1A46FD] transition-colors">
        {title}
      </h3>
      <p className="text-sm text-[#667085] leading-relaxed mb-6 flex-grow">
        {description}
      </p>
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1A46FD] hover:text-[#1232B8] mt-auto group/btn"
      >
        <span>Explore Program</span>
        <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}

// --- Value Card ---
export function ValueCard({ name, description }: { name: string; description: string; key?: any }) {
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 shadow-sm border-l-4 border-l-[#019444]">
      <h3 className="text-base sm:text-lg font-bold text-[#172033] mb-2">{name}</h3>
      <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">{description}</p>
    </div>
  );
}

// --- Stat Card ---
export function StatCard({ value, label }: { value: string; label: string; key?: any }) {
  return (
    <div className="bg-white border border-[#E4E7EC] rounded-xl p-6 text-center shadow-sm">
      <div className="text-3xl sm:text-4xl font-extrabold text-[#1A46FD] tracking-tight mb-2">
        {value}
      </div>
      <div className="text-xs sm:text-sm font-semibold text-[#667085] uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}

// --- Gallery Card ---
export function GalleryCard({ item, onClick }: { item: GalleryItem; onClick?: () => void; key?: any }) {
  return (
    <div
      onClick={onClick}
      className={`relative group bg-white border border-[#E4E7EC] rounded-xl overflow-hidden shadow-sm transition-all duration-300 cursor-pointer ${
        onClick ? "hover:scale-[1.02] hover:shadow-lg hover:border-[#1A46FD]" : ""
      }`}
    >
      <div className="aspect-[4/3] w-full bg-gray-50 overflow-hidden relative">
        <img
          src={item.imagePath}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white">
            <ImageIcon className="w-6 h-6" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-[#E8F7EF] text-[#019444] mb-2 border border-[#019444]/10">
          {item.category}
        </span>
        <h4 className="text-sm sm:text-base font-bold text-[#172033] tracking-tight truncate">
          {item.title}
        </h4>
        {item.description && (
          <p className="text-xs text-[#667085] mt-1 line-clamp-1 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
}
