import { Outlet } from "react-router-dom";
import { TopBar } from "../components/layout/TopBar";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import { BackToTop } from "../components/common/UI";
import { useScrollToTop } from "../hooks/use-scroll-to-top";

export default function PublicLayout() {
  // Scroll to top on every route change
  useScrollToTop();

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC] text-[#172033] antialiased">
      {/* Informational Top Strip Banner */}
      <TopBar />

      {/* Main Responsive Header */}
      <Header />

      {/* Primary Dynamic Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Main Branding Footer */}
      <Footer />

      {/* Scroll to Top Control */}
      <BackToTop />
    </div>
  );
}
