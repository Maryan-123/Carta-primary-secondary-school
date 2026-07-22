import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { schoolApi } from "../api/endpoints";
import { normalizeError } from "../api/error-normalizer";
import { Container, Section, SectionHeading, Breadcrumbs, LoadingSkeleton, ErrorState, EmptyState } from "../components/common/UI";
import { GalleryCard } from "../components/cards/SchoolCards";
import { GalleryItem } from "../types";

export default function GalleryPage() {
  const crumbs = [{ label: "Campus Gallery" }];
  const [filter, setFilter] = useState("ALL"); // ALL, Campus, Classrooms, Activities
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // TanStack Query fetching gallery images
  const {
    data: items = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["gallery"],
    queryFn: schoolApi.getGallery,
  });

  // Filter gallery items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === "ALL") return true;
      return item.category.toLowerCase() === filter.toLowerCase();
    });
  }, [items, filter]);

  const activeItem = lightboxIdx !== null ? filteredItems[lightboxIdx] : null;

  const navigateLightbox = (direction: "prev" | "next") => {
    if (lightboxIdx === null) return;
    let nextIdx = lightboxIdx + (direction === "next" ? 1 : -1);
    if (nextIdx < 0) {
      nextIdx = filteredItems.length - 1;
    } else if (nextIdx >= filteredItems.length) {
      nextIdx = 0;
    }
    setLightboxIdx(nextIdx);
  };

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">School Gallery</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            A window into the vibrant classroom events, chemical labs, track meets, and academic structures of CARTA.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="gallery-display">
        <Container>
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center bg-[#F7F9FC] border border-[#E4E7EC] p-3 rounded-2xl mb-10 max-w-2xl mx-auto shadow-sm">
            {["ALL", "Campus", "Classrooms", "Activities"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilter(cat);
                  setLightboxIdx(null);
                }}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors focus:outline-none ${
                  filter === cat
                    ? "bg-[#1A46FD] text-white"
                    : "bg-white border border-[#E4E7EC] text-[#667085] hover:bg-gray-50"
                }`}
              >
                {cat === "ALL" ? "All Photos" : cat}
              </button>
            ))}
          </div>

          {/* Grid Render */}
          {isLoading ? (
            <LoadingSkeleton count={6} type="card" />
          ) : isError ? (
            <ErrorState message={normalizeError(error)} onRetry={refetch} />
          ) : filteredItems.length === 0 ? (
            <EmptyState
              title="No Photos Available"
              description="No approved images belong to the selected category currently."
              actionLabel="Reset Gallery Filter"
              onAction={() => setFilter("ALL")}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item, idx) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  onClick={() => setLightboxIdx(idx)}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* LIGHTBOX POPUP MODAL */}
      {activeItem && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={() => setLightboxIdx(null)}
        >
          {/* Top Panel Controls */}
          <div className="flex justify-between items-center text-white pb-4 border-b border-white/10 relative z-10">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-widest text-[#019444]">
                {activeItem.category}
              </p>
              <h3 className="text-sm sm:text-base font-bold truncate max-w-xs sm:max-w-md">
                {activeItem.title}
              </h3>
            </div>

            <button
              onClick={() => setLightboxIdx(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-white focus:outline-none"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mid Panel Media and Nav */}
          <div className="flex-grow flex items-center justify-between gap-4 max-h-[75vh]">
            {/* Prev Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("prev");
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Previous Image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Central Large image */}
            <div
              className="relative max-h-full max-w-[80vw] flex items-center justify-center overflow-hidden rounded-xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeItem.imagePath}
                alt={activeItem.title}
                className="max-h-[65vh] max-w-full object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Next Trigger */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateLightbox("next");
              }}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Next Image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lower caption block */}
          <div
            className="bg-white/5 border-t border-white/10 p-4 rounded-xl text-center text-white/80 max-w-2xl mx-auto w-full relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {activeItem.description && (
              <p className="text-xs sm:text-sm leading-relaxed">{activeItem.description}</p>
            )}
            <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-white/50 mt-2 font-semibold">
              <Calendar className="w-4 h-4 text-[#019444]" />
              <span>CARTA Media Archive (Photos {lightboxIdx !== null ? lightboxIdx + 1 : 1} of {filteredItems.length})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
