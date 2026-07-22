import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, User, ArrowLeft, Loader2, Megaphone } from "lucide-react";
import { schoolApi } from "../api/endpoints";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, Breadcrumbs, ErrorState, Button } from "../components/common/UI";

export default function AnnouncementDetailsPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch specific announcement
  const {
    data: item,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["announcementDetails", id],
    queryFn: () => schoolApi.getAnnouncementById(id || ""),
    enabled: !!id,
  });

  const crumbs = [
    { label: "Announcements", to: "/announcements" },
    { label: item ? item.title : "Announcement Details" },
  ];

  const publishDateStr = item
    ? new Date(item.publishDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div>
      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="announcement-content">
        <Container className="max-w-3xl">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#1A46FD]" />
              <span className="text-sm text-[#667085] font-semibold">Loading announcement details...</span>
            </div>
          ) : isError ? (
            <ErrorState message={normalizeError(error)} onRetry={refetch} />
          ) : !item ? (
            <div className="text-center py-10">Announcement not found.</div>
          ) : (
            <article className="space-y-8">
              {/* Meta Info Header */}
              <div className="space-y-4 pb-6 border-b border-[#E4E7EC]">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#667085] font-semibold">
                  <span className="bg-[#EAF0FF] text-[#1A46FD] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {item.audience === "ALL" ? "Public" : item.audience}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-[#019444]" />
                    <time dateTime={item.publishDate}>{publishDateStr}</time>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-[#1A46FD]" />
                    <span>{item.authorName || "Administration Office"}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172033] tracking-tight leading-tight">
                  {item.title}
                </h1>
              </div>

              {/* Safe Content Area splitting paragraphs by newlines */}
              <div className="text-sm sm:text-base text-[#667085] leading-relaxed space-y-5 font-medium">
                {item.content.split("\n").map((para, idx) => {
                  if (!para.trim()) return null;
                  return <p key={idx}>{para}</p>;
                })}
              </div>

              {/* Lower Navigation Footer */}
              <div className="pt-8 border-t border-[#E4E7EC] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link to="/announcements">
                  <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
                    Back to Announcements
                  </Button>
                </Link>

                <div className="flex items-center gap-2 text-xs text-[#667085] font-semibold">
                  <Megaphone className="w-4.5 h-4.5 text-[#019444]" />
                  <span>CARTA School Administrative Update</span>
                </div>
              </div>
            </article>
          )}
        </Container>
      </Section>
    </div>
  );
}
