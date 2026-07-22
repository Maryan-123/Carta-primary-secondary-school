import { BookOpen, Sparkles, Award, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";

export default function AcademicsPage() {
  const crumbs = [{ label: "Academics" }];

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Academic Overview</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            High standards of knowledge, structured examinations, and comprehensive subject selections.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      {/* Overview & Approach */}
      <Section bg="white" id="academics-overview">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Curriculum Outlook
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Excellence Driven by Standards & Active Learning
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.academics.overview}
            </p>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.academics.approach}
            </p>
          </div>

          <div className="bg-[#F7F9FC] border border-[#E4E7EC] rounded-2xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-[#172033]">Core Academic Pillars</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="p-2.5 rounded-lg bg-[#EAF0FF] text-[#1A46FD] h-fit shrink-0">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#172033]">Formative & Summative Assessments</h4>
                  <p className="text-xs text-[#667085] leading-relaxed">Weekly performance logs, timed mock diagnostics, and continuous score sheets shared on the portal.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="p-2.5 rounded-lg bg-[#E8F7EF] text-[#019444] h-fit shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-[#172033]">Personalized Remedial Groups</h4>
                  <p className="text-xs text-[#667085] leading-relaxed">Afternoon revision desks, targeted subject coaching, and individual support counselors.</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Program Division Cards */}
      <Section bg="neutral" id="curriculum-levels">
        <Container>
          <SectionHeading
            title="School Levels"
            subtitle="Explore how our primary and secondary structures guide students from basic literacy to exam certs."
            badge="Pathways"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#E4E7EC] hover:border-[#1A46FD] hover:shadow-md rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-[#EAF0FF] text-[#1A46FD] w-fit rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Primary Division (Grades 1 - 6)</h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  Focuses heavily on early literacy, essential numeracy, primary laboratory discovery, and basic social discipline.
                </p>
              </div>
              <div className="pt-4">
                <Button asLink to="/primary-school" variant="outline" size="sm">
                  Explore Primary Curriculum
                </Button>
              </div>
            </div>

            <div className="bg-white border border-[#E4E7EC] hover:border-[#019444] hover:shadow-md rounded-2xl p-6 sm:p-8 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="p-3 bg-[#E8F7EF] text-[#019444] w-fit rounded-xl">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-[#172033]">Secondary Division (Grades 7 - 12)</h3>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  Focuses on deep conceptual specialization in science, maths, humanities, computer sciences, and direct national certificate testing preparation.
                </p>
              </div>
              <div className="pt-4">
                <Button asLink to="/secondary-school" variant="outline" size="sm" className="border-[#019444] text-[#019444] hover:bg-[#E8F7EF]">
                  Explore Secondary Curriculum
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Subjects Grid */}
      <Section bg="white" id="subjects">
        <Container>
          <SectionHeading
            title="Subjects Offered"
            subtitle="Comprehensive class materials taught by experienced subject matters experts."
            badge="Academic Scope"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE_CONTENT.academics.subjects.map((sub, i) => (
              <div key={i} className="bg-white border border-[#E4E7EC] p-6 rounded-xl hover:shadow-sm transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-[#172033]">{sub.name}</h4>
                  <span className="text-[10px] font-extrabold uppercase bg-gray-100 text-[#667085] px-2 py-0.5 rounded">
                    {sub.level}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
                  {sub.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Support Services */}
      <Section bg="neutral" id="support">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-4 flex justify-center">
            <div className="p-4 bg-[#EAF0FF]/50 border border-[#1A46FD]/10 rounded-2xl w-full max-w-xs text-center space-y-2">
              <GraduationCap className="w-12 h-12 text-[#1A46FD] mx-auto" />
              <h3 className="text-lg font-bold text-[#172033]">Comprehensive Student Care</h3>
              <p className="text-xs text-[#667085] leading-relaxed">No student is left behind at CARTA. We provide individualized target action guides.</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[#172033]">Integrated Academic Counseling</h3>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.academics.support}
            </p>
            <div className="bg-white border border-[#E4E7EC] p-5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm font-bold text-[#172033]">Looking for timetables, calendars, or report cards?</p>
                <p className="text-xs text-[#667085]">Sign in to your private portal profile. Social stats or private schedules are never published publicly.</p>
              </div>
              <Button asLink to="/login" variant="primary" size="sm">
                Log in to Portal
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
