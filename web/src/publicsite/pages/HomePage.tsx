import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Calendar, Sparkles, Mail, Phone, MapPin } from "lucide-react";
import { BRAND_ASSETS, SITE_CONTENT } from "../config/site-content";
import { schoolApi } from "../api/endpoints";
import { Container, Section, SectionHeading, Button } from "../components/common/UI";
import { AnnouncementCard, EventCard, ProgramCard, StatCard, GalleryCard } from "../components/cards/SchoolCards";

export default function HomePage() {
  // Fetch announcements, events, and gallery items
  const { data: announcements = [] } = useQuery({
    queryKey: ["homeAnnouncements"],
    queryFn: schoolApi.getAnnouncements,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["homeEvents"],
    queryFn: schoolApi.getEvents,
  });

  const { data: gallery = [] } = useQuery({
    queryKey: ["homeGallery"],
    queryFn: schoolApi.getGallery,
  });

  // Limit items for home preview
  const recentAnnouncements = announcements.slice(0, 3);
  const upcomingEvents = events.slice(0, 3);
  const galleryPreview = gallery.slice(0, 6);

  return (
    <div className="overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative bg-[#172033] text-white py-20 lg:py-32 flex items-center">
        {/* Background Graphic */}
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1A46FD] rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#019444] rounded-full filter blur-3xl"></div>
          <div className="w-full h-full bg-[radial-gradient(#E4E7EC_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#E8F7EF] bg-[#019444]/25 border border-[#019444]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#019444]" />
              <span>CARTA School Mogadishu</span>
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              CARTA Primary & <br />
              <span className="text-[#1A46FD]">Secondary School</span>
            </h1>
            <p className="text-base sm:text-lg text-[#667085] leading-relaxed max-w-xl">
              {SITE_CONTENT.tagline} We nurture character, build critical thinking, and secure academic excellence for every student.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button asLink to="/admissions" variant="primary" size="lg">
                Apply for Admission
              </Button>
              <Button asLink to="/about" variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Explore Our School
              </Button>
              <Button asLink to="/login" variant="white" size="lg">
                School Portal
              </Button>
            </div>
          </div>

          {/* Hero Branding Logo Shield */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm shadow-2xl animate-pulse-slow">
              <img
                src={BRAND_ASSETS.logo}
                alt="CARTA School Seal Logo"
                className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-2xl bg-white shadow-inner"
              />
              {/* Abs labels */}
              <div className="absolute -bottom-4 -left-4 bg-white text-[#172033] px-4 py-2.5 rounded-xl border border-[#E4E7EC] shadow-md text-xs font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#019444]"></span>
                <span>Disciplined Environment</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#1A46FD] text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                <span>Term Registration Open</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 2. WELCOME INTRO */}
      <Section bg="white" id="welcome">
        <Container className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Welcome to CARTA
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172033] leading-tight">
              Holistic Education Built on Knowledge & Discipline
            </h2>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              {SITE_CONTENT.introduction}
            </p>
            <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
              Our schools provide rich primary and secondary structures designed to groom students for both domestic national certificates and international standard literacy. We welcome you to experience our safe, highly supervised facilities.
            </p>
            <div className="pt-2">
              <Button asLink to="/about" variant="outline" icon={<ArrowRight className="w-4 h-4" />}>
                Read More About Us
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] border border-[#E4E7EC]">
            <img
              src="https://picsum.photos/seed/students/800/600"
              alt="CARTA school students"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-6 text-white">
              <p className="font-bold text-base sm:text-lg">Classroom Excellence</p>
              <p className="text-xs text-white/80">Interactive, student-centered lessons driven by modern methods.</p>
            </div>
          </div>
        </Container>
      </Section>

      {/* 3. MISSION, VISION, & VALUES */}
      <Section bg="neutral" id="mission-vision">
        <Container>
          <SectionHeading
            title="Our Foundations"
            subtitle="The core goals and standards guiding our daily administrative and educational operations."
            badge="Mission & Vision"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white border border-[#E4E7EC] rounded-xl p-8 hover:border-[#1A46FD] transition-colors shadow-sm space-y-4">
              <div className="bg-[#EAF0FF] text-[#1A46FD] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase w-fit tracking-wider">
                Our Mission
              </div>
              <p className="text-base sm:text-lg text-[#172033] font-medium leading-relaxed">
                "{SITE_CONTENT.missionVision.mission.description}"
              </p>
            </div>

            <div className="bg-white border border-[#E4E7EC] rounded-xl p-8 hover:border-[#019444] transition-colors shadow-sm space-y-4">
              <div className="bg-[#E8F7EF] text-[#019444] px-3.5 py-1.5 rounded-md text-xs font-bold uppercase w-fit tracking-wider">
                Our Vision
              </div>
              <p className="text-base sm:text-lg text-[#172033] font-medium leading-relaxed">
                "{SITE_CONTENT.missionVision.vision.description}"
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/about#values" className="text-sm font-bold text-[#1A46FD] hover:underline flex items-center justify-center gap-1.5">
              <span>View CARTA School Core Values</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Container>
      </Section>

      {/* 4. ACADEMIC PROGRAMS */}
      <Section bg="white" id="programs">
        <Container>
          <SectionHeading
            title="Our Academic Pathways"
            subtitle="We offer highly structured primary and secondary curriculums tailored to critical development stages."
            badge="Academic Divisions"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProgramCard
              title="Primary School"
              description="Ages 6-12. Focused on building deep foundation reading comprehension, standard mathematics reasoning, primary science curiosity, and moral integrity."
              to="/primary-school"
              icon="primary"
            />
            <ProgramCard
              title="Secondary School"
              description="Ages 13-18. Highly structured, certificate-ready courses preparing students for high scores in national certificate boards and future university applications."
              to="/secondary-school"
              icon="secondary"
            />
            <div className="bg-gradient-to-br from-[#1232B8] to-[#1A46FD] text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full bg-[radial-gradient(#FFF_1px,transparent_1px)] [background-size:12px_12px]"></div>
              </div>
              <div className="relative z-10 space-y-4">
                <span className="inline-block bg-[#019444] text-white font-extrabold text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md">
                  Portals & Resources
                </span>
                <h3 className="text-xl sm:text-2xl font-black">Online Student Portals</h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Enrolled students and parents can instantly log in to view personal timetables, homework boards, term report cards, fee records, and teacher communications.
                </p>
              </div>
              <div className="pt-6 relative z-10">
                <Button asLink to="/login" variant="white" size="md" className="w-full text-[#1A46FD] hover:bg-[#EAF0FF]">
                  Go to Portal Login
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 5. WHY CHOOSE CARTA */}
      <Section bg="neutral" id="why-choose-carta">
        <Container>
          <SectionHeading
            title="Why Families Choose CARTA"
            subtitle="Providing a robust educational community built on student accountability and parent transparency."
            badge="The CARTA Difference"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SITE_CONTENT.whyChooseUs.map((benefit, i) => (
              <div
                key={i}
                className="bg-white border border-[#E4E7EC] rounded-xl p-6 hover:shadow-md transition-all flex gap-3.5"
              >
                <CheckCircle2 className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-[#172033]">{benefit.title}</h4>
                  <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 6. STATISTICS */}
      <Section bg="blue" className="py-12 md:py-16">
        <Container>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {SITE_CONTENT.statistics.map((stat, i) => (
              <StatCard key={i} value={stat.value} label={stat.label} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 7. LATEST ANNOUNCEMENTS */}
      <Section bg="white" id="home-announcements">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
                School Updates
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mt-1">
                Latest Announcements
              </h2>
            </div>
            <Link
              to="/announcements"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1A46FD] hover:underline"
            >
              <span>View all announcements</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {recentAnnouncements.length === 0 ? (
            <div className="text-center py-8 text-[#667085]">
              No public announcements are currently scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentAnnouncements.map((ann) => (
                <AnnouncementCard key={ann.id} item={ann} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* 8. UPCOMING EVENTS */}
      <Section bg="neutral" id="home-events">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#019444]">
                Mark Your Calendar
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mt-1">
                Upcoming School Events
              </h2>
            </div>
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#019444] hover:underline animate-pulse-slow"
            >
              <span>View all events calendar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="text-center py-8 text-[#667085]">
              No upcoming school events are currently scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt.id} item={evt} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      {/* 9. ADMISSIONS CALL TO ACTION */}
      <Section bg="green" className="py-16">
        <Container className="text-center max-w-3xl space-y-6">
          <span className="inline-block bg-[#019444] text-white font-extrabold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
            Admissions Open
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#172033] tracking-tight">
            Begin Your Child’s Educational Journey with CARTA
          </h2>
          <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl mx-auto">
            Take the first step to securing your child's space in our qualified classes. Read through our entry requirements or fill out an inquiry form.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Button asLink to="/admissions" variant="success" size="lg">
              Submit Admission Inquiry
            </Button>
            <Button asLink to="/admissions#requirements" variant="outline" size="lg" className="border-[#019444] text-[#019444] hover:bg-[#E8F7EF]">
              View Requirements
            </Button>
          </div>
        </Container>
      </Section>

      {/* 10. GALLERY PREVIEW */}
      <Section bg="white" id="home-gallery">
        <Container>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
                Life at CARTA
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#172033] mt-1">
                Our Campus Gallery
              </h2>
            </div>
            <Link
              to="/gallery"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#1A46FD] hover:underline"
            >
              <span>View full gallery</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryPreview.map((item) => (
              <GalleryCard key={item.id} item={item} />
            ))}
          </div>
        </Container>
      </Section>

      {/* 11. CONTACT PREVIEW */}
      <Section bg="neutral" id="home-contact">
        <Container className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#1A46FD]">
              Get in Touch
            </span>
            <h2 className="text-3xl font-bold text-[#172033] tracking-tight">
              Contact the Admissions Desk
            </h2>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              Have questions about registration timelines, fee schedules, or school policies? Reach out directly or visit our office.
            </p>
            
            <ul className="space-y-4 text-xs sm:text-sm text-[#172033]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#019444] shrink-0 mt-0.5" />
                <span>{SITE_CONTENT.contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#1A46FD] shrink-0" />
                <span>{SITE_CONTENT.contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#019444] shrink-0" />
                <span>{SITE_CONTENT.contact.infoEmail}</span>
              </li>
            </ul>

            <div className="pt-2">
              <Button asLink to="/contact" variant="primary" icon={<Mail className="w-4 h-4" />}>
                Go to Contact Form
              </Button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E4E7EC] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#172033]">School Directions & Hours</h3>
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {SITE_CONTENT.contact.directions}
            </p>
            <div className="bg-[#F7F9FC] border border-[#E4E7EC] p-4 rounded-xl">
              <p className="text-xs font-bold text-[#172033] uppercase tracking-wider text-[#1A46FD] mb-1">Office Hours</p>
              <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-semibold">{SITE_CONTENT.contact.officeHours}</p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
