import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Loader2, ArrowLeft, Bookmark } from "lucide-react";
import { schoolApi } from "../api/endpoints";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, Breadcrumbs, ErrorState, Button } from "../components/common/UI";

const getEventTheme = (eventType: string) => {
  switch (eventType.toLowerCase()) {
    case "sports":
      return {
        gradient: "from-[#0f766e] via-[#0891b2] to-[#1d4ed8]",
        pill: "bg-cyan-50 text-cyan-800 border-cyan-100",
      };
    case "parent-teacher":
      return {
        gradient: "from-[#7c2d12] via-[#b45309] to-[#f59e0b]",
        pill: "bg-amber-50 text-amber-800 border-amber-100",
      };
    default:
      return {
        gradient: "from-[#172033] via-[#1A46FD] to-[#019444]",
        pill: "bg-emerald-50 text-emerald-800 border-emerald-100",
      };
  }
};

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch specific event
  const {
    data: event,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["eventDetails", id],
    queryFn: () => schoolApi.getEventById(id || ""),
    enabled: !!id,
  });

  const crumbs = [
    { label: "Events Calendar", to: "/events" },
    { label: event ? event.title : "Event Details" },
  ];

  const startDateStr = event
    ? new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const theme = getEventTheme(event?.eventType || "academic");

  return (
    <div>
      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="event-details">
        <Container className="max-w-3xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#1A46FD]" />
              <span className="text-sm text-[#667085] font-semibold">Loading event details...</span>
            </div>
          ) : isError ? (
            <ErrorState message={normalizeError(error)} onRetry={refetch} />
          ) : !event ? (
            <div className="text-center py-10">School event not found.</div>
          ) : (
            <div className="space-y-8 bg-[#F7F9FC] border border-[#E4E7EC] rounded-2xl p-6 sm:p-10 shadow-sm">
              <div className={`relative overflow-hidden rounded-[28px] bg-gradient-to-br ${theme.gradient} px-6 py-8 sm:px-8 sm:py-10 text-white`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white_0,transparent_28%),radial-gradient(circle_at_bottom_left,white_0,transparent_25%)]" />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div className="max-w-2xl space-y-4">
                    <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em]">
                      {event.eventType} Event
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                      {event.title}
                    </h1>
                    <p className="max-w-xl text-sm sm:text-base leading-7 text-white/85">
                      {event.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:w-56">
                    <div className="rounded-2xl bg-white/92 px-4 py-4 text-center text-[#172033] shadow-lg">
                      <p className="text-[11px] font-black uppercase tracking-widest text-[#667085]">Day</p>
                      <p className="mt-2 text-3xl font-black leading-none">{new Date(event.startDate).toLocaleDateString("en-US", { day: "2-digit" })}</p>
                      <p className="mt-1 text-xs font-black uppercase tracking-[0.25em] text-[#019444]">
                        {new Date(event.startDate).toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/12 border border-white/15 px-4 py-4 backdrop-blur-sm">
                      <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Open</p>
                      <p className="mt-2 text-xl font-black leading-tight">Public</p>
                      <p className="mt-1 text-xs text-white/70">School invitation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Header */}
              <div className="space-y-4 pb-6 border-b border-[#E4E7EC]">
                <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${theme.pill}`}>
                  Event Summary
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#172033] tracking-tight leading-tight">
                  Plan and prepare for this school event
                </h2>
              </div>

              {/* Event Meta Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white border border-[#E4E7EC] p-6 rounded-xl">
                <div className="flex gap-3 items-start">
                  <Calendar className="w-5 h-5 text-[#1A46FD] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Date</p>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">{startDateStr}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <Clock className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Time</p>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">{event.time}</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-[#1A46FD] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-bold text-[#667085] uppercase tracking-wider">Location</p>
                    <p className="text-xs sm:text-sm font-bold text-[#172033]">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-[#172033]">Event Information</h3>
                <p className="text-sm sm:text-base text-[#667085] leading-relaxed font-medium">
                  {event.description}
                </p>
              </div>

              {/* Lower Controls */}
              <div className="pt-6 border-t border-[#E4E7EC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link to="/events">
                  <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Events Calendar
                  </Button>
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#667085] font-semibold">
                  <Bookmark className="w-4.5 h-4.5 text-[#019444]" />
                  <span>Public School Invitation</span>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
