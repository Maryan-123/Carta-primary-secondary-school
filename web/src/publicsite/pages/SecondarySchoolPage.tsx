import { CheckCircle2, Award, ClipboardCheck, Users, ChevronRight } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, Breadcrumbs, Button } from "../components/common/UI";

export default function SecondarySchoolPage() {
  const crumbs = [
    { label: "Academics", to: "/academics" },
    { label: "Secondary School" },
  ];

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Secondary School (Grades 7 - 12)</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Deep academic discipline, targeted exam prep, and pre-university career preparation.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      {/* Intro section */}
      <Section bg="white" id="secondary-intro">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Advanced Curriculum
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Academic Independence & Intellectual Depth
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.secondarySchool.intro}
            </p>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              In secondary grades, students move away from passive reading into active critical analysis, hands-on scientific experimentation, and research writing. Our teachers are highly certified specialists who push students to challenge themselves and score at top levels.
            </p>
            <div className="pt-2">
              <Button asLink to="/admissions" variant="primary">
                Review Admission Requirements
              </Button>
            </div>
          </div>

          <div className="bg-[#F7F9FC] border border-[#E4E7EC] p-6 sm:p-8 rounded-2xl space-y-6">
            <h3 className="text-lg font-bold text-[#172033]">Secondary Learning Objectives</h3>
            <ul className="space-y-4">
              {SITE_CONTENT.secondarySchool.goals.map((goal, i) => (
                <li key={i} className="flex gap-3 text-xs sm:text-sm text-[#667085] font-medium leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-[#1A46FD] shrink-0 mt-0.5" />
                  <span>{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Core subjects & guidance */}
      <Section bg="neutral" id="secondary-details">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white border border-[#E4E7EC] p-6 sm:p-8 rounded-xl space-y-4 shadow-sm">
            <div className="p-3 bg-[#EAF0FF] text-[#1A46FD] w-fit rounded-xl">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#172033]">Rigorous Exam Preparation</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {SITE_CONTENT.secondarySchool.examPrep}
            </p>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Students go through timed mock trials, peer review groups, and intensive subject seminars to master the National examination guidelines.
            </p>
          </div>

          <div className="bg-white border border-[#E4E7EC] p-6 sm:p-8 rounded-xl space-y-4 shadow-sm">
            <div className="p-3 bg-[#E8F7EF] text-[#019444] w-fit rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-[#172033]">University Guidance & Pathways</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {SITE_CONTENT.secondarySchool.guidance}
            </p>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Our placement staff advises students on essay writing, scholarship routes, and specialized local and regional universities selection.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
