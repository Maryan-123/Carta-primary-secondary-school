import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ExternalLink, Calendar, GraduationCap, Award } from "lucide-react";
import { BRAND_ASSETS, SITE_CONTENT } from "../../config/site-content";
import { Container } from "../common/UI";

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#172033] text-[#F7F9FC] border-t-4 border-[#019444]">
      {/* Upper Footer Grid */}
      <div className="py-16 px-4 md:px-8 border-b border-gray-800">
        <Container className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* School Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={BRAND_ASSETS.logo}
                alt={`${SITE_CONTENT.schoolName} Logo`}
                className="h-14 w-14 object-contain rounded-full border border-gray-700 bg-white p-0.5"
              />
              <div>
                <h3 className="text-lg font-bold tracking-tight text-white">CARTA SCHOOL</h3>
                <p className="text-xs text-[#019444] font-semibold tracking-widest uppercase">
                  Primary & Secondary
                </p>
              </div>
            </div>
            <p className="text-sm text-[#667085] leading-relaxed">
              Building knowledge, character, confidence, and a brighter future for every learner. Nurturing tomorrow's ethical leaders today.
            </p>
          </div>

          {/* Quick Info & Portal */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-gray-800 pb-2">
              School Portal
            </h4>
            <p className="text-sm text-[#667085] leading-relaxed">
              Enrolled students, parents, teachers, and school administration can securely access the internal CARTA management portal here.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A46FD] hover:text-[#EAF0FF] transition-colors"
            >
              <span>Access Student Portal</span>
              <ExternalLink className="w-4 h-4 text-[#019444]" />
            </Link>
          </div>

          {/* Academic & Admissions Links */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-gray-800 pb-2">
              Programs & Links
            </h4>
            <ul className="space-y-2.5 text-sm text-[#667085]">
              <li>
                <Link to="/academics" className="hover:text-white transition-colors flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#1A46FD]" />
                  <span>Academic Overview</span>
                </Link>
              </li>
              <li>
                <Link to="/primary-school" className="hover:text-white transition-colors flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#019444]" />
                  <span>Primary Education</span>
                </Link>
              </li>
              <li>
                <Link to="/secondary-school" className="hover:text-white transition-colors flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1A46FD]" />
                  <span>Secondary Education</span>
                </Link>
              </li>
              <li>
                <Link to="/admissions" className="hover:text-white transition-colors flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#019444]" />
                  <span>Admissions & Inquiries</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Office Contact Section */}
          <div className="space-y-4">
            <h4 className="text-base font-bold text-white tracking-wide border-b border-gray-800 pb-2">
              School Office
            </h4>
            <ul className="space-y-3 text-sm text-[#667085]">
              <li className="flex gap-2.5 items-start">
                <MapPin className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{SITE_CONTENT.contact.address}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Phone className="w-4 h-4 text-[#1A46FD] shrink-0" />
                <span>{SITE_CONTENT.contact.phone}</span>
              </li>
              <li className="flex gap-2.5 items-center">
                <Mail className="w-4 h-4 text-[#019444] shrink-0" />
                <span>{SITE_CONTENT.contact.infoEmail}</span>
              </li>
            </ul>
          </div>
        </Container>
      </div>

      {/* Lower Copyright Area */}
      <div className="bg-[#1232B8]/10 py-6 px-4 md:px-8 text-center text-xs text-[#667085] font-medium">
        <Container className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>
            &copy; {currentYear} {SITE_CONTENT.schoolName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/faq" className="hover:text-white transition-colors">
              Frequently Asked Questions (FAQ)
            </Link>
            <Link to="/contact" className="hover:text-white transition-colors">
              Admissions Desk
            </Link>
          </div>
        </Container>
      </div>
    </footer>
  );
}
