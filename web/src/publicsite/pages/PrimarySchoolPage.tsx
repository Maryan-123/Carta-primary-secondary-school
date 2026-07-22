import { CheckCircle2, BookOpen, Users, Calendar, Award } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";

export default function PrimarySchoolPage() {
  const crumbs = [
    { label: "Academics", to: "/academics" },
    { label: "Primary School" },
  ];

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Primary School (Grades 1 - 6)</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Interactive, foundational education building strong basic literacy, maths, and social values.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      {/* Intro section */}
      <Section bg="white" id="primary-intro">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Early Foundations
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Curiosity & Character Development
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.primarySchool.intro}
            </p>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              We understand that young children absorb information through practical actions and sensory feedback. Our primary classes feature moderate classroom layouts, qualified infant-educators, and safe indoor recreation zones.
            </p>
            <div className="pt-2">
              <Button asLink to="/admissions" variant="primary">
                Inquire for Admission
              </Button>
            </div>
          </div>

          <div className="bg-[#F7F9FC] border border-[#E4E7EC] p-6 sm:p-8 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-[#172033]">Primary Learning Goals</h3>
            <ul className="space-y-4">
              {SITE_CONTENT.primarySchool.goals.map((goal, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-[#667085] font-medium leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Teaching Methods & Parent Involvements */}
      <Section bg="neutral" id="primary-methods">
        <Container className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E4E7EC] p-6 sm:p-8 rounded-xl space-y-4 shadow-sm">
            <div className="p-3 bg-[#EAF0FF] text-[#1A46FD] w-fit rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#172033]">Active Learning Methods</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {SITE_CONTENT.primarySchool.teachingMethods}
            </p>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Interactive science logs, educational visual aids, field trips, and basic computer laboratory sessions form the core of our early training curricula.
            </p>
          </div>

          <div className="bg-white border border-[#E4E7EC] p-6 sm:p-8 rounded-xl space-y-4 shadow-sm">
            <div className="p-3 bg-[#E8F7EF] text-[#019444] w-fit rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#172033]">Strong Parent Coordination</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {SITE_CONTENT.primarySchool.parentInvolvement}
            </p>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Weekly progress reports are uploaded to the portal so parents can monitor exactly which topics have been covered and what homework sheets require signatures.
            </p>
          </div>
        </Container>
      </Section>
    </div>
  );
}
