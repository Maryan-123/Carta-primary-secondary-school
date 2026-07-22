import { Award, BookOpen, GraduationCap, ShieldCheck, Landmark } from "lucide-react";
import { SITE_CONTENT } from "../config/site-content";
import { Container, Section, SectionHeading, Breadcrumbs, Button } from "../components/common/UI";
import { ValueCard } from "../components/cards/SchoolCards";

export default function AboutPage() {
  const crumbs = [{ label: "About Us" }];

  return (
    <div>
      {/* 1. Page Hero */}
      <div className="bg-[#172033] text-white py-14 border-b-4 border-[#019444] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
        <Container className="relative z-10 text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">About CARTA School</h1>
          <p className="text-sm sm:text-base text-[#667085] max-w-xl mx-auto">
            Our history, guiding principles, and educational standards serving the Mogadishu community.
          </p>
        </Container>
      </div>

      <Breadcrumbs items={crumbs} />

      {/* 2. Introduction & History */}
      <Section bg="white" id="intro">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Academic History
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033]">
              Nurturing Excellence for Over 15 Years
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              Established with a clear vision to bridge academic discipline with creative innovation, CARTA School has grown from a humble primary community center into a leading full-scale dual-track primary and secondary educational institute in Mogadishu, Somalia.
            </p>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              We focus heavily on structural accountability. Over the past decades, our students have regularly scored in the highest percentiles in the National Examinations, securing admissions to top-tier universities locally and globally.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl p-5 text-center space-y-2">
              <Landmark className="w-8 h-8 text-[#1A46FD] mx-auto" />
              <p className="text-xl font-bold text-[#172033]">2011</p>
              <p className="text-xs text-[#667085] font-semibold uppercase tracking-wider">Founding Year</p>
            </div>
            <div className="bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl p-5 text-center space-y-2">
              <GraduationCap className="w-8 h-8 text-[#019444] mx-auto" />
              <p className="text-xl font-bold text-[#172033]">100%</p>
              <p className="text-xs text-[#667085] font-semibold uppercase tracking-wider">Exam Pass Rate</p>
            </div>
            <div className="bg-[#F7F9FC] border border-[#E4E7EC] rounded-xl p-5 text-center space-y-2 col-span-2">
              <ShieldCheck className="w-8 h-8 text-[#1A46FD] mx-auto" />
              <p className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">Ministry Approved & Accredited</p>
              <p className="text-xs text-[#667085]">Fully registered under the Ministry of Education.</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. Core Values */}
      <Section bg="neutral" id="values">
        <Container>
          <SectionHeading
            title="Our Core Values"
            subtitle="The fundamental standards we cultivate in every child, administrator, and teacher."
            badge="The CARTA Pillars"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE_CONTENT.missionVision.values.list.map((value, i) => (
              <ValueCard key={i} name={value.name} description={value.description} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 4. Educational Philosophy */}
      <Section bg="white" id="philosophy">
        <Container className="max-w-4xl space-y-8">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#019444]">Philosophy</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] mt-1">Our Educational Approach</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[#667085] text-xs sm:text-sm sm:leading-relaxed">
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#172033] flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1A46FD]" />
                <span>Knowledge & Discipline First</span>
              </h3>
              <p>
                We believe that learning is most productive in a structured, calm, and highly respectful environment. We set clear performance and behavioral standards so students develop self-governing study habits and administrative responsibility early in life.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-bold text-[#172033] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#019444]" />
                <span>Transparent Parent Partnerships</span>
              </h3>
              <p>
                A child's education is a collaborative journey. Through continuous portal reports and monthly conferences, we keep parents directly in the loop regarding academic scores, syllabus coverage, class attendances, and personal development challenges.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. CTA Section */}
      <Section bg="blue" className="py-14 text-center">
        <Container className="max-w-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#172033]">Ready to join our community?</h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
            Connect with our admissions desk to learn more about registrar timelines, placement assessments, and campus tours.
          </p>
          <div className="flex justify-center gap-4 pt-2">
            <Button asLink to="/admissions" variant="primary">
              Admission Requirements
            </Button>
            <Button asLink to="/contact" variant="outline">
              Contact Us
            </Button>
          </div>
        </Container>
      </Section>
    </div>
  );
}
