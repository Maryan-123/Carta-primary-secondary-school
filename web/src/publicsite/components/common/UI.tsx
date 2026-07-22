import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, AlertTriangle, Inbox, ChevronRight, Loader2 } from "lucide-react";
import { BRAND_ASSETS, SITE_CONTENT } from "../../config/site-content";

// --- Container Component ---
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  clean?: boolean;
}

export function Container({ children, className = "", clean = false, ...props }: ContainerProps) {
  return (
    <div
      className={clean ? className : `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// --- Section Component ---
export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
  bg?: "white" | "neutral" | "blue" | "green";
  id?: string;
}

export function Section({ children, className = "", bg = "white", id, ...props }: SectionProps) {
  const bgClasses = {
    white: "bg-white",
    neutral: "bg-[#F7F9FC]",
    blue: "bg-[#EAF0FF]",
    green: "bg-[#E8F7EF]",
  };

  return (
    <section
      id={id}
      className={`py-12 md:py-20 ${bgClasses[bg]} ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

// --- Section Heading Component ---
export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
  badge?: string;
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  alignment = "center",
  badge,
  className = "",
}: SectionHeadingProps) {
  return (
    <div
      className={`mb-10 md:mb-14 ${
        alignment === "center" ? "text-center max-w-2xl mx-auto" : "text-left max-w-3xl"
      } ${className}`}
    >
      {badge && (
        <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wider text-[#019444] uppercase bg-[#E8F7EF] rounded-full mb-3">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#172033] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base md:text-lg text-[#667085] leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// --- Button Component ---
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "success" | "danger" | "outline" | "white";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  asLink?: boolean;
  to?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  asLink = false,
  to = "",
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-[#1A46FD] hover:bg-[#1232B8] text-white focus:ring-[#1A46FD]",
    secondary: "bg-[#EAF0FF] hover:bg-[#d6e2ff] text-[#1A46FD] focus:ring-[#1A46FD]",
    success: "bg-[#019444] hover:bg-[#00733A] text-white focus:ring-[#019444]",
    danger: "bg-[#D92D20] hover:bg-[#b82016] text-white focus:ring-[#D92D20]",
    outline: "bg-white border border-[#1A46FD] text-[#1A46FD] hover:bg-[#EAF0FF] focus:ring-[#1A46FD]",
    white: "bg-white border border-[#E4E7EC] text-[#172033] hover:bg-[#F7F9FC] focus:ring-[#172033]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs sm:text-sm",
    md: "px-5 py-2.5 text-sm sm:text-base",
    lg: "px-7 py-3.5 text-base sm:text-lg",
  };

  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );

  if (asLink && to) {
    return (
      <Link
        to={to}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {content}
    </button>
  );
}

// --- Logo Component ---
export interface LogoProps {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  className?: string;
}

export function Logo({ size = "md", withText = true, className = "" }: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-11 w-11",
    lg: "h-16 w-16",
  };

  return (
    <Link to="/" className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={BRAND_ASSETS.logo}
        alt={`${SITE_CONTENT.schoolName} Logo`}
        className={`${sizes[size]} object-contain rounded-full shadow-sm bg-white border border-[#E4E7EC]`}
      />
      {withText && (
        <div className="flex flex-col">
          <span className="font-bold text-[#172033] tracking-tight leading-none text-base sm:text-lg md:text-xl">
            CARTA
          </span>
          <span className="text-[10px] sm:text-xs text-[#667085] font-medium tracking-wider uppercase">
            Primary & Secondary
          </span>
        </div>
      )}
    </Link>
  );
}

// --- Breadcrumbs Component ---
export interface BreadcrumbLink {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbLink[] }) {
  return (
    <nav aria-label="Breadcrumb" className="py-3 px-4 bg-[#F7F9FC] border-b border-[#E4E7EC]">
      <Container className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-[#667085] font-medium">
        <Link to="/" className="hover:text-[#1A46FD] transition-colors">
          Home
        </Link>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-[#E4E7EC]" />
            {item.to ? (
              <Link to={item.to} className="hover:text-[#1A46FD] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[#172033] font-semibold">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </Container>
    </nav>
  );
}

// --- Back To Top Component ---
export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 p-3 bg-[#1A46FD] text-white rounded-full shadow-lg hover:bg-[#1232B8] hover:scale-110 active:scale-95 transition-all z-40 focus:outline-none focus:ring-2 focus:ring-[#1A46FD]"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}

// --- Loading Skeleton Component ---
export function LoadingSkeleton({
  count = 3,
  type = "card",
}: {
  count?: number;
  type?: "card" | "list" | "text";
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border border-[#E4E7EC] rounded-xl p-5 bg-white space-y-4 shadow-sm"
        >
          {type === "card" && (
            <div className="h-44 bg-gray-100 rounded-lg w-full"></div>
          )}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-100 rounded w-full"></div>
            <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          </div>
          <div className="h-8 bg-gray-100 rounded w-1/3 pt-2"></div>
        </div>
      ))}
    </div>
  );
}

// --- Error State Component ---
export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border border-red-100 rounded-2xl bg-red-50/30 max-w-xl mx-auto my-6 space-y-4">
      <AlertTriangle className="w-12 h-12 text-[#D92D20]" />
      <div>
        <h3 className="text-lg font-bold text-[#172033]">Connection Error</h3>
        <p className="text-sm text-[#667085] mt-1 leading-relaxed">
          {message}
        </p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry Connection
        </Button>
      )}
    </div>
  );
}

// --- Empty State Component ---
export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 border border-dashed border-[#E4E7EC] rounded-2xl bg-white max-w-xl mx-auto my-6 space-y-4">
      <div className="p-3 bg-[#F7F9FC] rounded-full">
        <Inbox className="w-8 h-8 text-[#667085]" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-[#172033]">{title}</h3>
        <p className="text-sm text-[#667085] mt-1 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
