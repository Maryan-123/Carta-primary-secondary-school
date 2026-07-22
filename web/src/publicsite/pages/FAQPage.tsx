import { useState } from "react";
import { ChevronDown, HelpCircle, MessageSquare } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";

export default function FAQPage() {
  const crumbs = [{ label: "FAQ" }];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleAccordion = (idx: number) => {
    if (openIdx === idx) {
      setOpenIdx(null);
    } else {
      setOpenIdx(idx);
    }
  };

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Frequently Asked Questions</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Find immediate answers regarding school calendars, uniforms, registration fees, and portal logins.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      <Section bg="white" id="faq-accordions">
        <Container className="max-w-3xl">
          <SectionHeading
            title="General School Inquiries"
            subtitle="Providing swift transparency for both prospective and currently registered CARTA families."
            badge="FAQ"
          />

          <div className="space-y-4">
            {SITE_CONTENT.faqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="flex justify-between items-center w-full p-5 text-left font-bold text-[#172033] hover:text-[#1A46FD] focus:outline-none focus:bg-gray-100 transition-colors gap-4"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-[#1A46FD] shrink-0 mt-0.5" />
                      <span className="text-sm sm:text-base">{faq.question}</span>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-[#667085] transition-transform duration-200 ${
                        isOpen ? "transform rotate-180 text-[#1A46FD]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pl-11 text-xs sm:text-sm text-[#667085] leading-relaxed font-medium bg-white/50 border-t border-[#E4E7EC]/50 animate-in fade-in slide-in-from-top-1 duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Lower CTA */}
      <Section bg="neutral" className="py-14 text-center">
        <Container className="max-w-xl space-y-4">
          <MessageSquare className="w-10 h-10 text-[#019444] mx-auto" />
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033]">Have a different question?</h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Our admissions helpdesk and registrar officers are always happy to answer any query. Contact us now.
          </p>
          <div className="pt-2">
            <Button asLink to="/contact" variant="primary">
              Contact School Registrar
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
