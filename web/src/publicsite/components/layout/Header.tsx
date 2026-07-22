import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { Logo, Container, Button } from "../common/UI";
import { NAVIGATION_ITEMS, NavItem } from "../../config/navigation";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Handle scroll event to add shadow/border
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  // Click outside to close desktop dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isLinkActive = (to?: string) => {
    if (!to) return false;
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  const isDropdownActive = (item: NavItem) => {
    if (!item.dropdown) return false;
    return item.dropdown.some((sub) => location.pathname === sub.to);
  };

  const toggleDropdown = (label: string) => {
    if (activeDropdown === label) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(label);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md border-b border-[#E4E7EC]"
          : "bg-white border-b border-[#E4E7EC]"
      }`}
    >
      <Container className="flex items-center justify-between h-20">
        {/* School Logo */}
        <Logo size="md" />

        {/* Desktop Navigation */}
        <nav ref={dropdownRef} className="hidden lg:flex items-center gap-6" aria-label="Main Navigation">
          {NAVIGATION_ITEMS.map((item, index) => {
            const hasDropdown = !!item.dropdown;
            const dropdownOpen = activeDropdown === item.label;
            const active = hasDropdown ? isDropdownActive(item) : isLinkActive(item.to);

            if (hasDropdown) {
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A46FD]/50 ${
                      active
                        ? "text-[#1A46FD] font-semibold"
                        : "text-[#172033] hover:text-[#1A46FD]"
                    }`}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        dropdownOpen ? "transform rotate-180 text-[#1A46FD]" : "text-[#667085]"
                      }`}
                    />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 rounded-xl bg-white border border-[#E4E7EC] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      {item.dropdown?.map((sub, sIdx) => {
                        const subActive = location.pathname === sub.to;
                        return (
                          <Link
                            key={sIdx}
                            to={sub.to}
                            onClick={() => setActiveDropdown(null)}
                            className={`block px-4 py-2.5 text-sm transition-colors ${
                              subActive
                                ? "bg-[#EAF0FF] text-[#1A46FD] font-semibold"
                                : "text-[#172033] hover:bg-[#F7F9FC] hover:text-[#1A46FD]"
                            }`}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={index}
                to={item.to || "/"}
                className={`px-3 py-2 text-sm sm:text-base font-medium rounded-md transition-colors ${
                  active
                    ? "text-[#1A46FD] font-semibold"
                    : "text-[#172033] hover:text-[#1A46FD]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex">
            <Button variant="primary" size="sm" icon={<LogIn className="w-4 h-4" />}>
              School Portal
            </Button>
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 text-[#172033] hover:bg-[#F7F9FC] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer (Slide-out) */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-20 bg-black/50 z-40" onClick={() => setIsOpen(false)}>
          <div
            className="w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-left duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col gap-5">
              {NAVIGATION_ITEMS.map((item, index) => {
                const hasDropdown = !!item.dropdown;
                const dropdownOpen = activeDropdown === item.label;
                const active = hasDropdown ? isDropdownActive(item) : isLinkActive(item.to);

                if (hasDropdown) {
                  return (
                    <div key={index} className="space-y-2">
                      <button
                        onClick={() => toggleDropdown(item.label)}
                        className={`flex items-center justify-between w-full py-2 font-medium text-left transition-colors border-b border-[#E4E7EC]/50 ${
                          active ? "text-[#1A46FD]" : "text-[#172033]"
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            dropdownOpen ? "transform rotate-180 text-[#1A46FD]" : "text-[#667085]"
                          }`}
                        />
                      </button>

                      {dropdownOpen && (
                        <div className="pl-4 border-l-2 border-[#1A46FD]/20 space-y-2 py-1">
                          {item.dropdown?.map((sub, sIdx) => {
                            const subActive = location.pathname === sub.to;
                            return (
                              <Link
                                key={sIdx}
                                to={sub.to}
                                className={`block py-1.5 text-sm transition-colors ${
                                  subActive
                                    ? "text-[#1A46FD] font-semibold"
                                    : "text-[#667085] hover:text-[#1A46FD]"
                                }`}
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={index}
                    to={item.to || "/"}
                    className={`block py-2 font-medium border-b border-[#E4E7EC]/50 transition-colors ${
                      active ? "text-[#1A46FD] font-semibold" : "text-[#172033] hover:text-[#1A46FD]"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <Link to="/login" className="mt-4">
                <Button variant="primary" size="md" className="w-full" icon={<LogIn className="w-4 h-4" />}>
                  Login to School Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
