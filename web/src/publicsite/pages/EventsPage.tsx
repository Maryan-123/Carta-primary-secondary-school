import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, CalendarDays, RefreshCw, Filter } from "lucide-react";
import { schoolApi } from "../api/endpoints";
import { useDebounce } from "../hooks/use-debounce";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, SectionHeading, Breadcrumbs, LoadingSkeleton, ErrorState, EmptyState } from "../components/common/UI";
import { EventCard } from "../components/cards/SchoolCards";

export default function EventsPage() {
  const crumbs = [{ label: "Events Calendar" }];
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("ALL"); // ALL, Academic, Sports, Parent-Teacher

  // Debounce search
  const debouncedSearch = useDebounce(search, 300);

  // TanStack Query fetching events
  const {
    data: events = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["events"],
    queryFn: schoolApi.getEvents,
  });

  // Filter and search logic
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      const matchesSearch =
        evt.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        evt.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        evt.location.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesType = eventType === "ALL" || evt.eventType.toLowerCase() === eventType.toLowerCase();

      return matchesSearch && matchesType;
    });
  }, [events, debouncedSearch, eventType]);

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">School Events Calendar</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Review upcoming track & field, PTCA reviews, science showcases, and term assemblies at CARTA.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="events-list">
        <Container>
          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#F7F9FC] border border-[#E4E7EC] p-4 rounded-xl mb-10 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                placeholder="Search events by title or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[#E4E7EC] bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#667085]">
              <button
                onClick={() => setEventType("ALL")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  eventType === "ALL"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => setEventType("Academic")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  eventType === "Academic"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                Academic
              </button>
              <button
                onClick={() => setEventType("Sports")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  eventType === "Sports"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                Sports
              </button>
              <button
                onClick={() => setEventType("Parent-Teacher")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  eventType === "Parent-Teacher"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                Parent-Teacher
              </button>
            </div>
          </div>

          {/* Rendering logic */}
          {isLoading ? (
            <LoadingSkeleton count={3} type="card" />
          ) : isError ? (
            <ErrorState message={normalizeError(error)} onRetry={refetch} />
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              title="No Events Scheduled"
              description="No upcoming events match your search parameters or category filter. Try editing your criteria."
              actionLabel="Show All Scheduled Events"
              onAction={() => {
                setSearch("");
                setEventType("ALL");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((evt) => (
                <EventCard key={evt.id} item={evt} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
