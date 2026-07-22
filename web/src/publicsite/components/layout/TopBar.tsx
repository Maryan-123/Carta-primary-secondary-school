import { Phone, Mail, MapPin, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { SITE_CONTENT } from "../../config/site-content";
import { Container } from "../common/UI";

export function TopBar() {
  return (
    <div className="bg-[#1232B8] text-white text-xs py-2 border-b border-[#1A46FD]/20">
      <Container className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <a
            href={`tel:${SITE_CONTENT.contact.phone}`}
            className="flex items-center gap-1.5 hover:text-[#EAF0FF] transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{SITE_CONTENT.contact.phone}</span>
          </a>
          <a
            href={`mailto:${SITE_CONTENT.contact.infoEmail}`}
            className="flex items-center gap-1.5 hover:text-[#EAF0FF] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{SITE_CONTENT.contact.infoEmail}</span>
          </a>
          <span className="hidden md:flex items-center gap-1.5 text-white/80">
            <MapPin className="w-3.5 h-3.5 text-[#019444]" />
            <span className="truncate max-w-xs">Wadajir, Mogadishu</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="flex items-center gap-1 font-semibold text-[#E8F7EF] hover:text-white hover:underline transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#019444]" />
            <span>School Portal Login</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
