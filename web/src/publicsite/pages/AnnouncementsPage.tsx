import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, RefreshCw, XCircle } from "lucide-react";
import { schoolApi } from "../api/endpoints";
import { useDebounce } from "../hooks/use-debounce";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, SectionHeading, Breadcrumbs, LoadingSkeleton, ErrorState, EmptyState, Button } from "../components/common/UI";
import { AnnouncementCard } from "../components/cards/SchoolCards";

export default function AnnouncementsPage() {
  const crumbs = [{ label: "Announcements" }];
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL"); // ALL, Public, Transfer, General

  // Debounce the search query
  const debouncedSearch = useDebounce(search, 300);

  // TanStack Query fetching announcements
  const {
    data: announcements = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: schoolApi.getAnnouncements,
  });

  // Filter and search announcements locally
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((ann) => {
      const matchesSearch =
        ann.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ann.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (ann.excerpt && ann.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()));

      const matchesAudience = category === "ALL" || ann.audience === category;

      return matchesSearch && matchesAudience && ann.isActive;
    });
  }, [announcements, debouncedSearch, category]);

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">School Announcements</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Stay updated with official statements, term resumes, admissions news, and examination celebrations.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="announcements-list">
        <Container>
          {/* Search and Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-[#F7F9FC] border border-[#E4E7EC] p-4 rounded-xl mb-10 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                placeholder="Search announcements by keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-[#E4E7EC] bg-white text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs sm:text-sm font-semibold text-[#667085]">
              <button
                onClick={() => setCategory("ALL")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  category === "ALL"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                All Announcements
              </button>
              <button
                onClick={() => setCategory("ALL")}
                className={`px-4 py-1.5 rounded-lg transition-colors focus:outline-none ${
                  category === "Public"
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] hover:bg-gray-50"
                }`}
              >
                Public Updates
              </button>
            </div>
          </div>

          {/* List Rendering */}
          {isLoading ? (
            <LoadingSkeleton count={3} type="card" />
          ) : isError ? (
            <ErrorState message={normalizeError(error)} onRetry={refetch} />
          ) : filteredAnnouncements.length === 0 ? (
            <EmptyState
              title="No Announcements Found"
              description="No official updates match your search term or audience query. Try modifying your search filters or reload the feed."
              actionLabel="Reset Search Filters"
              onAction={() => {
                setSearch("");
                setCategory("ALL");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAnnouncements.map((item) => (
                <AnnouncementCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </div>
  );
}
