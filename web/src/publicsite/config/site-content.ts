export const BRAND_ASSETS = {
  logo: new URL("../../assets/branding/carta-logo.jpeg", import.meta.url).href,
};

export const EVENT_ASSETS = {
  studentsOne: new URL("../../assets/events/carta-event-1.jpeg", import.meta.url).href,
  studentsTwo: new URL("../../assets/events/carta-event-2.jpeg", import.meta.url).href,
  studentsThree: new URL("../../assets/events/carta-event-3.jpeg", import.meta.url).href,
};

export const SITE_CONTENT = {
  schoolName: "CARTA Primary & Secondary School",
  shortName: "CARTA School",
  tagline: "Building knowledge, character, confidence, and a brighter future for every learner.",
  introduction: "CARTA Primary & Secondary School is a premier educational institution committed to academic excellence, moral integrity, and personal growth. We provide a holistic learning environment that empowers students to discover their potential and prepares them to be responsible global citizens.",
  
  principal: {
    name: "Dr. Farah Ahmed",
    title: "Principal",
    image: "https://picsum.photos/seed/principal/600/800",
    message: `Dear Students, Parents, and Visitors,

Welcome to CARTA Primary & Secondary School!

It is an honor to serve as the Principal of this outstanding institution. At CARTA School, we believe that education is not just about academic success, but also about the development of character, resilience, and compassion. Our dedicated team of educators is committed to creating a safe, nurturing, and intellectually stimulating environment where every child can thrive.

We combine a rigorous academic curriculum with rich co-curricular activities, ensuring our students grow into well-rounded individuals. We view parents as our active partners in this educational journey, and we work hand-in-hand to monitor and guide student progress.

I invite you to explore our website, learn about our vibrant community, and consider joining the CARTA family.

Warm regards,

Dr. Farah Ahmed
Principal, CARTA Primary & Secondary School`,
  },

  missionVision: {
    mission: {
      title: "Our Mission",
      description: "To deliver high-quality, inclusive, and transformative education that fosters intellectual curiosity, moral integrity, and active citizenship in every student.",
    },
    vision: {
      title: "Our Vision",
      description: "To be a leading center of educational excellence, recognized for nurturing compassionate, innovative, and principled leaders who positively impact society.",
    },
    values: {
      title: "Core Values",
      list: [
        { name: "Knowledge", description: "Pursuing academic excellence and lifelong learning." },
        { name: "Discipline", description: "Developing self-control, focus, and structured habits." },
        { name: "Integrity", description: "Acting with honesty, fairness, and ethical principles." },
        { name: "Respect", description: "Valuing diversity, self, others, and the environment." },
        { name: "Responsibility", description: "Being accountable for our choices, actions, and duties." },
        { name: "Excellence", description: "Striving for the highest quality in everything we do." },
      ],
    },
  },

  academics: {
    overview: "At CARTA School, we offer a comprehensive academic program designed to stimulate intellectual development, critical thinking, and a love for learning. Our curriculum meets national standards while integrating global educational best practices, ensuring students are well-prepared for higher education and career success.",
    approach: "Our student-centered teaching methodology focuses on active learning, collaborative problem-solving, and practical application. We leverage interactive teaching tools, small class sizes for personalized attention, and regular formative assessments to track and support individual learning pathways.",
    subjects: [
      { name: "Mathematics", level: "Primary & Secondary", description: "From foundational arithmetic to advanced calculus, fostering logical reasoning and analytical skills." },
      { name: "English Language & Literature", level: "Primary & Secondary", description: "Enhancing reading comprehension, creative writing, public speaking, and literary appreciation." },
      { name: "Sciences", level: "Primary & Secondary", description: "Comprehensive study of Biology, Chemistry, and Physics with hands-on laboratory experiments." },
      { name: "Social Studies & History", level: "Primary & Secondary", description: "Exploring local and global history, geography, civics, and cultural studies." },
      { name: "Information Technology", level: "Primary & Secondary", description: "Equipping students with digital literacy, basic coding, and responsible computer science skills." },
      { name: "Art, Music & Drama", level: "Primary & Secondary", description: "Unlocking creative expression, performance skills, and aesthetic sensitivity." },
    ],
    support: "We provide comprehensive support services, including academic tutoring, language support, study skills workshops, and individual guidance counseling, ensuring no learner is left behind.",
  },

  primarySchool: {
    intro: "The Primary School program at CARTA caters to children in their foundational years. We focus on building key literacy, numeracy, and social skills in an engaging and supportive environment.",
    goals: [
      "Develop strong foundational reading, writing, and mathematical abilities.",
      "Encourage curiosity, observation, and critical inquiry.",
      "Foster emotional intelligence, social interaction, and teamwork.",
      "Instill positive learning habits and moral discipline."
    ],
    teachingMethods: "We employ play-based learning, interactive projects, sensory education, and visual storytelling alongside structured classroom work to keep young learners actively engaged.",
    parentInvolvement: "We hold monthly parent-teacher conferences, share weekly progress logs, and invite parents to school events to ensure a strong collaborative bridge between home and classroom."
  },

  secondarySchool: {
    intro: "Our Secondary School program is designed to guide students through adolescence into early adulthood, preparing them for external national examinations and future higher education pathways.",
    goals: [
      "Acquire deep knowledge in specialized academic fields.",
      "Develop advanced analytical, research, and critical thinking skills.",
      "Cultivate self-directed study skills and exam readiness.",
      "Build leadership, civic responsibility, and ethical career awareness."
    ],
    examPrep: "We conduct intensive examination preparation, mock trials, timed assessments, and review workshops to ensure high success rates in national certificates.",
    guidance: "Our dedicated guidance counselor provides student mentoring, higher education pathways advice, career explorations, and personal development support."
  },

  admissions: {
    title: "Admissions at CARTA School",
    intro: "We welcome applications for admission from families who share our commitment to academic excellence, discipline, and character growth. Learn about our clear, step-by-step admission process below.",
    steps: [
      { step: 1, title: "Contact the School", description: "Inquire online or visit our school campus to receive initial information packets and speak with our admissions coordinator." },
      { step: 2, title: "Submit Admission Inquiry", description: "Fill out the online admission inquiry form or complete a paper copy at the registrar's office." },
      { step: 3, title: "Submit Required Documents", description: "Provide certified copies of student ID, previous school transcripts/reports, and passport photos." },
      { step: 4, title: "Assessment & Interview", description: "Prospective students participate in a basic placement assessment to evaluate reading, writing, and mathematical levels, followed by a friendly interview." },
      { step: 5, title: "Admission Decision", description: "The admissions board reviews the complete application portfolio and issues a formal decision letter within 5 working days." },
      { step: 6, title: "Registration & Tuition", description: "Secure the offered seat by submitting the enrollment contract, student health record, and completing fee arrangements." }
    ],
    requirements: [
      "Student identification (birth certificate or passport copy).",
      "Academic records or report cards from the previous two school years (if transferring).",
      "Two recent passport-sized color photographs of the student.",
      "Identification of parents or legal guardians (passport or national ID copy).",
      "Completed and signed medical history and immunization records.",
      "Proof of residence or contact information."
    ],
    levels: [
      "Primary Grade 1", "Primary Grade 2", "Primary Grade 3", "Primary Grade 4", 
      "Primary Grade 5", "Primary Grade 6", "Secondary Grade 7", "Secondary Grade 8", 
      "Secondary Grade 9", "Secondary Grade 10", "Secondary Grade 11", "Secondary Grade 12"
    ],
    terms: ["Term 1 (Sept - Dec)", "Term 2 (Jan - Mar)", "Term 3 (Apr - Jun)"]
  },

  whyChooseUs: [
    { title: "Qualified & Dedicated Teachers", description: "Our faculty consists of certified, experienced, and highly motivated educators committed to student success." },
    { title: "Safe & Supportive Environment", description: "We prioritize student physical and emotional safety with strict campus security and anti-bullying policies." },
    { title: "Strong Academic Foundation", description: "Our curriculum is rigorous, balanced, and structured to yield high scores in national examinations." },
    { title: "Character & Leadership Development", description: "We integrate moral guidance, leadership camps, and civic engagement into daily school life." },
    { title: "Parent-School Partnership", description: "We keep parents fully updated with frequent reports, digital communications, and collaborative meetings." },
    { title: "Student Progress Monitoring", description: "Continuous assessment profiles track student achievements, weaknesses, and behavioral growth." }
  ],

  statistics: [
    { value: "450+", label: "Enrolled Students", suffix: "" },
    { value: "32", label: "Qualified Educators", suffix: "" },
    { value: "18", label: "Modern Classrooms", suffix: "" },
    { value: "15+", label: "Years of Educational Service", suffix: "" }
  ],

  faqs: [
    {
      question: "What are the school operating hours?",
      answer: "The school day begins at 7:30 AM and ends at 2:00 PM, Sunday through Thursday. Extra-curricular clubs and sports activities run from 2:15 PM to 3:45 PM on designated afternoons."
    },
    {
      question: "Is there a school uniform requirement?",
      answer: "Yes, all students are required to wear the official CARTA school uniform during school hours and on official school excursions. The uniform catalog and purchasing guidelines are provided upon successful admission."
    },
    {
      question: "What curriculum does CARTA School follow?",
      answer: "We follow the official National Educational Curriculum, enriched with international teaching methodologies, advanced information technology studies, and practical laboratory sciences."
    },
    {
      question: "How are school fees structured and paid?",
      answer: "School fees are split into three termly payments, due at the beginning of each term. Out of respect for family privacy and administrative security, detailed fee tables and banking routes are shared privately with prospective families after document verification."
    },
    {
      question: "Can parents monitor their child's daily progress?",
      answer: "Absolutely. Parents receive secure login credentials for the CARTA School Portal, where they can monitor attendance, report cards, fee receipts, class timetables, and message teachers directly."
    },
    {
      question: "What support is available for students struggling academically?",
      answer: "We offer academic support groups, peer tutoring, and after-school remedial sessions in core subjects like Mathematics and English. Teachers work closely with parents to create individual action plans."
    }
  ],

  contact: {
    address: "Km 4, Airport Road, Wadajir District, Mogadishu, Somalia",
    phone: "+252 61 555 1234",
    phoneAlternative: "+252 61 555 5678",
    email: "admissions@carta.edu.so",
    infoEmail: "info@carta.edu.so",
    officeHours: "Sunday to Thursday: 7:00 AM - 3:00 PM (Closed on Fridays, Saturdays, and public holidays)",
    directions: "Our main campus is conveniently located in the Wadajir district, just a 5-minute drive from Aden Adde International Airport. We have secure drop-off zones and private parking for visitors."
  },

  announcements: [
    {
      id: "ann-1",
      title: "Admissions Officially Open for the 2026/2027 Academic Year",
      content: "CARTA Primary & Secondary School is proud to announce that registration for the upcoming academic year is now officially open! Families interested in joining our vibrant school community are encouraged to review our Admission Requirements and submit an inquiry form. Early bird registration discounts are available for completed applications received before August 15th. Placement assessments will commence on a rolling basis. For transferring secondary students, please ensure certified academic transcripts from previous schools are prepared.",
      excerpt: "Enroll your child in CARTA School today. Registration for the 2026/2027 academic year is officially open for all grades.",
      audience: "ALL",
      publishDate: "2026-07-20",
      expiryDate: null,
      isActive: true,
      authorName: "Registrar Office"
    },
    {
      id: "ann-2",
      title: "CARTA Secondary Achieves Outstanding National Examination Results",
      content: "We are thrilled to celebrate our Class of 2025/2026 for achieving a remarkable 100% pass rate in the National Secondary Certificate Examinations! Our students have performed exceptionally well, with over 68% securing Grade A marks in Mathematics and Science. This success is a testament to the hard work of our students, the unwavering dedication of our teaching staff, and the invaluable partnership of our parent community. Congratulations to our graduates as they prepare for prestigious higher education pathways!",
      excerpt: "CARTA Secondary School celebrates another year of academic excellence with a historic 100% pass rate in national exams.",
      audience: "ALL",
      publishDate: "2026-07-15",
      expiryDate: null,
      isActive: true,
      authorName: "Dr. Farah Ahmed"
    },
    {
      id: "ann-3",
      title: "Resumption Guidelines and Orientation Day for Term 1",
      content: "As we gear up for a fresh, inspiring academic year, we are pleased to outline our Term 1 resumption schedule. Staff orientation will begin on September 1st, followed by our Welcome Back Parent-Teacher meeting on September 5th. Official student classes will commence on Sunday, September 6th, at 7:30 AM. All students are expected to report in full, correct school uniforms. Please ensure textbook orders and portal accounts are verified before the first day.",
      excerpt: "Key dates and uniform guidelines for parents and students in preparation for the Term 1 resumption in September.",
      audience: "ALL",
      publishDate: "2026-07-10",
      expiryDate: null,
      isActive: true,
      authorName: "Admissions Office"
    }
  ],

  events: [
    {
      id: "evt-1",
      title: "Term 1 Student Resumption & Welcome Assembly",
      description: "Welcome assembly at the school main quadrangle to mark the official commencement of Term 1. The Principal will deliver the opening address and introduce new members of our teaching faculty. Students will receive class schedules, locker assignments, and guidance handbooks.",
      eventType: "Academic",
      imagePath: BRAND_ASSETS.logo,
      startDate: "2026-09-06",
      endDate: "2026-09-06",
      time: "07:30 AM - 09:30 AM",
      location: "Main Quadrangle",
      isPublic: true
    },
    {
      id: "evt-2",
      title: "Annual CARTA Track & Field Sports Day",
      description: "Our highly anticipated Annual Sports Day is back! Students from all primary and secondary levels will compete in track races, relays, long jump, and tug-of-war. Parents are cordially invited to cheer for their children's color houses. Food stalls and refreshments will be managed by the Parent-Teacher Association.",
      eventType: "Sports",
      imagePath: BRAND_ASSETS.logo,
      startDate: "2026-10-15",
      endDate: "2026-10-15",
      time: "08:00 AM - 1:00 PM",
      location: "School Athletics Field",
      isPublic: true
    },
    {
      id: "evt-3",
      title: "Annual Science, Tech & Craft Exhibition",
      description: "A showcase of innovative projects designed by our secondary science students, alongside interactive craft models from our primary school learners. Projects cover sustainable energy, simple robotics, geological formations, and digital designs. Open to the public, local community leaders, and prospective parents.",
      eventType: "Academic",
      imagePath: BRAND_ASSETS.logo,
      startDate: "2026-11-12",
      endDate: "2026-11-13",
      time: "09:00 AM - 2:00 PM",
      location: "CARTA Assembly Hall",
      isPublic: true
    },
    {
      id: "evt-4",
      title: "First Term Parent-Teacher Consultative Meeting",
      description: "An essential opportunity for parents to sit down individually with class and subject teachers to review academic performance logs, discuss behavioral progress, and address any student needs. Individual time slots will be scheduled and shared via the secure Parent Portal.",
      eventType: "Parent-Teacher",
      imagePath: BRAND_ASSETS.logo,
      startDate: "2026-11-26",
      endDate: "2026-11-26",
      time: "08:00 AM - 3:00 PM",
      location: "Respective Classrooms",
      isPublic: true
    }
  ],

  gallery: [
    {
      id: "gal-1",
      title: "Modern Chemistry and Biology Lab",
      category: "Campus",
      imagePath: EVENT_ASSETS.studentsOne,
      description: "Our state-of-the-art secondary laboratory, fully equipped for safe, hands-on scientific experiments.",
      date: "2026-05"
    },
    {
      id: "gal-2",
      title: "Primary Interactive Storytelling Session",
      category: "Classrooms",
      imagePath: EVENT_ASSETS.studentsTwo,
      description: "Active primary learners engaging in a modern, collaborative reading and critical inquiry activity.",
      date: "2026-06"
    },
    {
      id: "gal-3",
      title: "Annual Sports Day Relay Race",
      category: "Activities",
      imagePath: EVENT_ASSETS.studentsThree,
      description: "Secondary students showing incredible speed, teamwork, and athletic sportsmanship in the annual color house relay.",
      date: "2026-02"
    },
    {
      id: "gal-4",
      title: "CARTA School Modern Main Building Front",
      category: "Campus",
      imagePath: EVENT_ASSETS.studentsOne,
      description: "Our secure, welcoming main campus facility located in the Wadajir district of Mogadishu.",
      date: "2026-01"
    },
    {
      id: "gal-5",
      title: "Creative Painting and Art Class",
      category: "Activities",
      imagePath: EVENT_ASSETS.studentsTwo,
      description: "Primary school students expressing their creativity and developing aesthetic coordination using water paints.",
      date: "2026-04"
    },
    {
      id: "gal-6",
      title: "Computer Science and Coding Club",
      category: "Classrooms",
      imagePath: EVENT_ASSETS.studentsThree,
      description: "Secondary students learning foundational python scripts and digital design in our IT suite.",
      date: "2026-05"
    }
  ]
};
