import { Mail, Phone, Calendar } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, Breadcrumbs, Button } from "../components/common/UI";

export default function PrincipalMessagePage() {
  const crumbs = [
    { label: "About Us", to: "/about" },
    { label: "Principal's Message" },
  ];

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Principal’s Message</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            A welcoming statement and educational outlook from our school leadership.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="message-content">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Principal Image and Stats */}
          <div className="lg:col-span-4 bg-[#F7F9FC] border border-[#E4E7EC] rounded-2xl overflow-hidden p-6 space-y-6 text-center">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-200 border border-[#E4E7EC] shadow-inner relative">
              <img
                src={SITE_CONTENT.principal.image}
                alt={SITE_CONTENT.principal.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#172033]">{SITE_CONTENT.principal.name}</h3>
              <p className="text-xs font-bold text-[#019444] uppercase tracking-wider">
                {SITE_CONTENT.principal.title}
              </p>
              <p className="text-xs text-[#667085] font-semibold">CARTA Primary & Secondary School</p>
            </div>
            
            <div className="border-t border-[#E4E7EC]/80 pt-4 space-y-3 text-left text-xs text-[#667085] font-medium">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1A46FD]" />
                <span>{SITE_CONTENT.contact.infoEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#019444]" />
                <span>{SITE_CONTENT.contact.phone}</span>
              </div>
            </div>
          </div>

          {/* Letter Body */}
          <div className="lg:col-span-8 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Leadership Outlook
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Welcome to the CARTA Learning Family
            </h2>
            
            {/* Split paragraphs to render cleanly */}
            <div className="text-sm sm:text-base text-[#667085] leading-relaxed space-y-5 whitespace-pre-line font-medium">
              {SITE_CONTENT.principal.message}
            </div>

            <div className="border-t border-[#E4E7EC] pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div className="space-y-1">
                <p className="font-bold text-[#172033]">{SITE_CONTENT.principal.name}</p>
                <p className="text-xs text-[#667085] font-semibold">
                  Principal, CARTA Primary & Secondary School
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asLink to="/admissions" variant="primary" icon={<Calendar className="w-4 h-4" />}>
                  Book admission inquiry
                </Button>
                <Button asLink to="/contact" variant="outline">
                  Contact Registrar
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
