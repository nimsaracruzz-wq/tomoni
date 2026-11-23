export interface CourseDetail {
  slug: string;
  name: string;
  levelBadge: string;
  category: string;
  targetAudience: string;
  duration: string;
  schedule: string;
  mode: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  summary: string;
  curriculum: string[];
  outcomes: string[];
  faqs: { q: string; a: string }[];
}

export const COURSE_CATALOG: Record<string, CourseDetail> = {
  "jlpt-n5": {
    slug: "jlpt-n5",
    name: "JLPT N5 Preparation Course",
    levelBadge: "Beginner Level (JLPT N5)",
    category: "JLPT Preparation",
    targetAudience: "Absolute beginners, school leavers, and individuals starting their Japanese language journey.",
    duration: "4–6 Months",
    schedule: "Weekday & Weekend Batches (Morning / Evening options)",
    mode: "Physical in Kuliyapitiya & Live Interactive Online across Sri Lanka",
    metaTitle: "JLPT N5 Classes in Sri Lanka | Beginner Japanese Course | Tomoni",
    metaDescription: "Enroll in premier JLPT N5 classes in Sri Lanka with Tomoni Japanese Language Center. Master Hiragana, Katakana, basic Kanji, and grammar for the official JLPT examination.",
    keywords: [
      "JLPT N5 Classes Sri Lanka",
      "JLPT N5 course Sri Lanka",
      "Beginner Japanese classes Sri Lanka",
      "Learn Japanese Hiragana Katakana",
      "JLPT N5 exam preparation",
    ],
    summary:
      "The JLPT N5 course is designed for absolute beginners with zero prior knowledge of Japanese. It establishes solid foundations in the three Japanese writing systems (Hiragana, Katakana, and ~100 essential Kanji), everyday vocabulary, conversational greeting patterns, and basic grammar constructs required to pass the internationally recognized JLPT N5 examination.",
    curriculum: [
      "Mastery of Hiragana & Katakana with correct stroke orders and pronunciation drills",
      "Over 100 essential Kanji characters and 800+ core everyday vocabulary words",
      "Core sentence patterns: Desu/Masu forms, particles (wa, ga, o, ni, de, to, e), questions, and negations",
      "Listening comprehension training using authentic Japanese native audio materials",
      "Monthly mock examinations and past paper discussions under timed exam conditions",
      "Cultural orientation and basic Japanese social etiquette",
    ],
    outcomes: [
      "Read and write Hiragana, Katakana, and approximately 100 fundamental Kanji",
      "Understand and engage in basic everyday conversations and introductions",
      "Confidently sit and pass the official JLPT N5 / NAT-TEST 5Q examination",
      "Meet the prerequisite language standard for student visa processing to Japan",
    ],
    faqs: [
      {
        q: "Do I need any previous Japanese knowledge to join JLPT N5?",
        a: "No. This course starts from absolute zero. We begin with the writing scripts and phonetics, making it ideal for complete beginners.",
      },
      {
        q: "Is JLPT N5 sufficient to apply for a student visa to Japan?",
        a: "Yes, Japanese Immigration requires proof of at least 150 hours of certified Japanese study or a JLPT N5 / NAT-TEST 5Q certificate for student visa applications.",
      },
      {
        q: "Are physical classes held in Kuliyapitiya or online?",
        a: "Both! We conduct physical batches at our modern classrooms in Kuliyapitiya, as well as live online batches for students located anywhere in Sri Lanka.",
      },
    ],
  },

  "jlpt-n4": {
    slug: "jlpt-n4",
    name: "JLPT N4 Preparation Course",
    levelBadge: "Upper Beginner (JLPT N4)",
    category: "JLPT Preparation",
    targetAudience: "Students with JLPT N5 knowledge who want to advance their communication and qualify for Japanese vocational colleges and work programs.",
    duration: "4–6 Months",
    schedule: "Weekday & Weekend Batches",
    mode: "Physical in Kuliyapitiya & Live Interactive Online",
    metaTitle: "JLPT N4 Classes in Sri Lanka | Intermediate Preparation | Tomoni",
    metaDescription: "Master JLPT N4 in Sri Lanka with Tomoni Japanese Language Center. Deepen your grammar, expand vocabulary to 1,500 words, and prepare for higher studies or work in Japan.",
    keywords: [
      "JLPT N4 Classes Sri Lanka",
      "JLPT N4 course Sri Lanka",
      "Intermediate Japanese classes",
      "Japanese language certification Sri Lanka",
    ],
    summary:
      "JLPT N4 bridges beginner Japanese into functional daily communication. Students learn complex grammar structures (potential, passive, causative, and conditional forms), expand their Kanji repository to ~300 characters, and learn to comprehend Japanese spoken at near-natural speed.",
    curriculum: [
      "Over 300 Kanji characters and 1,500 functional vocabulary items",
      "Advanced verb conjugations: Te-form combinations, potential, passive, and causative forms",
      "Complex conditionals (tara, ba, to, nara) and polite honorific expressions (basic keigo)",
      "Daily life listening scenarios: train announcements, shopping, doctor visits, and workplace interactions",
      "Intensive JLPT N4 past paper drills and speed-reading techniques",
    ],
    outcomes: [
      "Read and comprehend passages on familiar daily topics written with basic vocabulary and Kanji",
      "Understand spoken conversations in daily life situations spoken at slightly slower than normal speed",
      "Meet criteria for specialized vocational training and SSW (Specified Skilled Worker) categories in Japan",
    ],
    faqs: [
      {
        q: "What is the entry requirement for the JLPT N4 class?",
        a: "Students should have completed JLPT N5 or equivalent coursework (approximately 150 hours of foundational Japanese).",
      },
      {
        q: "How does JLPT N4 help with jobs in Japan?",
        a: "JLPT N4 is the benchmark language requirement for many Japanese Specified Skilled Worker (SSW) visas, caregiver tracks, and technical internships.",
      },
    ],
  },

  "jlpt-n3": {
    slug: "jlpt-n3",
    name: "JLPT N3 Preparation Course",
    levelBadge: "Intermediate Level (JLPT N3)",
    category: "JLPT Preparation",
    targetAudience: "Students aiming for direct employment in Japanese companies, university degree courses, or professional translation.",
    duration: "6 Months",
    schedule: "Weekend Intensive Sessions & Evening Batches",
    mode: "Hybrid / Online & Kuliyapitiya Physical",
    metaTitle: "JLPT N3 Classes in Sri Lanka | Professional Japanese Course | Tomoni",
    metaDescription: "Achieve JLPT N3 proficiency in Sri Lanka. Bridge the gap between basic Japanese and natural workplace fluency with Tomoni Japanese Language Center.",
    keywords: [
      "JLPT N3 Classes Sri Lanka",
      "Intermediate Japanese course",
      "Business Japanese Sri Lanka",
      "Work in Japan language requirements",
    ],
    summary:
      "JLPT N3 is the recognized bridge to professional Japanese competency. It enables students to read newspapers with aids, understand coherent workplace discussions, and communicate naturally across diverse social and business scenarios.",
    curriculum: [
      "Comprehensive mastery of ~650 Kanji characters and 3,500+ vocabulary words",
      "Nuanced grammar: expressions of probability, intention, nuance, and contrast",
      "Business etiquette (Keigo: Sonkeigo, Kenjougo, Teineigo) used in corporate Japan",
      "Rapid essay reading and analytical listening comprehension",
      "Regular JLPT N3 simulated mock exams",
    ],
    outcomes: [
      "Read and understand written materials with specific contents concerning everyday and workplace topics",
      "Grasp summary information from newspaper headlines and formal notices",
      "Qualify for white-collar job interviews with Japanese employers and Japanese IT firms",
    ],
    faqs: [
      {
        q: "Is JLPT N3 required for Japanese universities?",
        a: "Many Japanese universities accept JLPT N3 or N2 for English-track programs or specialized diploma entrance.",
      },
    ],
  },

  "jft-basic": {
    slug: "jft-basic",
    name: "JFT-Basic & SSW Worker Class",
    levelBadge: "Specified Skilled Worker (SSW) Track",
    category: "Working in Japan",
    targetAudience: "Sri Lankan candidates applying for Specified Skilled Worker (SSW / Tokutei Ginou) visas and Japanese technical employment.",
    duration: "4–5 Months Intensive",
    schedule: "Morning & Evening Intensive Batches",
    mode: "Physical in Kuliyapitiya & Live Online",
    metaTitle: "JFT-Basic Classes in Sri Lanka | SSW Working Visa in Japan | Tomoni",
    metaDescription: "Prepare for the JFT-Basic A2 examination in Sri Lanka with Tomoni Japanese Language Center. Direct pathway for Specified Skilled Worker (SSW) visas in Japan.",
    keywords: [
      "JFT Basic classes Sri Lanka",
      "JFT exam preparation Sri Lanka",
      "SSW visa Japan Sri Lanka",
      "Work in Japan from Sri Lanka",
      "Specified Skilled Worker Japanese",
    ],
    summary:
      "The JFT-Basic (Japan Foundation Test for Basic Japanese) evaluates the Japanese language communication skills needed by foreign nationals to live and work in Japan under the Specified Skilled Worker (SSW / Tokutei Ginou) residence status. This course provides targeted training specifically aligned with the Irodori curriculum and computer-based test (CBT) format.",
    curriculum: [
      "Irodori: Japanese for Life in Japan curriculum (Can-Do based learning)",
      "Essential workplace conversation, health & safety instructions, and daily living skills",
      "Computer-based testing (CBT) practice questions and simulated online tests",
      "Key vocabulary for nursing care, hospitality, agriculture, food service, and construction fields",
      "Interview etiquette and preparation for Japanese employer selection",
    ],
    outcomes: [
      "Pass the official computer-based JFT-Basic A2 examination",
      "Meet the regulatory language requirements for the SSW residence status",
      "Communicate effectively with supervisors and colleagues in Japanese workplace environments",
    ],
    faqs: [
      {
        q: "What is the difference between JLPT and JFT-Basic?",
        a: "Both qualify you for the SSW visa (A2 level). However, JFT-Basic is held multiple times throughout the year via computer-based testing (CBT), providing much faster results than JLPT which is held only twice a year.",
      },
    ],
  },

  "study-in-japan-visa": {
    slug: "study-in-japan-visa",
    name: "Study in Japan Visa Pathway + Japanese Course",
    levelBadge: "Higher Education & Visa Pathway",
    category: "Study in Japan",
    targetAudience: "Students seeking admission to Japanese universities, vocational colleges (Senmon Gakko), or Japanese language academies.",
    duration: "6–12 Months Comprehensive",
    schedule: "Full-Time & Flexible Cohorts",
    mode: "Kuliyapitiya Campus & Consultation Center",
    metaTitle: "Study in Japan from Sri Lanka | Visa Guidance & Japanese Classes | Tomoni",
    metaDescription: "Comprehensive Study in Japan program from Sri Lanka. Learn Japanese (JLPT N5/N4), complete Certificate of Eligibility (COE) filing, and get your student visa with Tomoni.",
    keywords: [
      "Study in Japan from Sri Lanka",
      "Japan student visa Sri Lanka",
      "Japan language school admission Sri Lanka",
      "COE application Japan Sri Lanka",
      "Japanese education consultants Sri Lanka",
    ],
    summary:
      "Tomoni's flagship Study in Japan program offers an end-to-end pathway for Sri Lankan students. We combine intensive JLPT preparation with honest, ethical visa guidance, partner school matching across Japan (Tokyo, Osaka, Nagoya, Fukuoka), Certificate of Eligibility (COE) documentation, and pre-departure life orientation.",
    curriculum: [
      "Intensive JLPT N5 and N4 training required for Japanese Immigration",
      "Selection and direct application to partner Japanese language academies and universities",
      "Preparation of Japanese Statement of Purpose (Shiyuusho)",
      "Financial sponsorship documentation auditing and legal verification",
      "Japanese Embassy mock visa interview simulations",
      "Pre-departure briefing: part-time work regulations (28 hrs/week), bank accounts, and housing",
    ],
    outcomes: [
      "Attain JLPT N5 or N4 certification within 4–6 months",
      "Obtain Certificate of Eligibility (COE) and Japanese Student Visa",
      "Smooth transition to living, studying, and working part-time in Japan",
    ],
    faqs: [
      {
        q: "Can students work part-time in Japan while studying?",
        a: "Yes. With the official 'Permission to Engage in Activity other than that Permitted under the Status of Residence Previously Granted', international students can legally work up to 28 hours per week during school terms and up to 40 hours per week during holidays.",
      },
      {
        q: "When are the intakes for Japanese language schools in Japan?",
        a: "The primary intakes are April and October, with secondary intakes in January and July.",
      },
    ],
  },

  "school-ol-al": {
    slug: "school-ol-al",
    name: "Sri Lankan School O/L & A/L Japanese Syllabus",
    levelBadge: "National Curriculum (G.C.E. O/L & A/L)",
    category: "School Curriculum",
    targetAudience: "School students in Grades 9–13 preparing for G.C.E. O/L and G.C.E. A/L Japanese examinations.",
    duration: "Annual Academic Programs",
    schedule: "Weekend and After-School Batches",
    mode: "Physical in Kuliyapitiya & Live Online",
    metaTitle: "Japanese O/L & A/L Classes Sri Lanka | National Syllabus | Tomoni",
    metaDescription: "Top-ranked Japanese classes for Sri Lankan G.C.E. O/L and A/L examinations. Past paper discussions, grammar breakdowns, and model exams at Tomoni Japanese Center.",
    keywords: [
      "Japanese OL class Sri Lanka",
      "Japanese AL class Sri Lanka",
      "GCE AL Japanese past papers",
      "Japanese language teacher Sri Lanka",
      "School Japanese syllabus Sri Lanka",
    ],
    summary:
      "Tailored specifically for Sri Lankan school students, this program follows the Department of Examinations and National Institute of Education (NIE) syllabus for G.C.E. Ordinary Level and Advanced Level Japanese. Taught by experienced educators dedicated to achieving A-grade distinctions.",
    curriculum: [
      "Comprehensive coverage of the government prescribed textbooks and literature",
      "Grammar points, sentence building, and translation practice (Sinhala/English to Japanese)",
      "Kanji characters specified for the G.C.E. O/L and A/L examination benchmarks",
      "10+ years of past paper analysis and marking scheme discussions",
      "Model term test examinations with personalized answer grading",
    ],
    outcomes: [
      "Achieve Distinction (A grade) in G.C.E. O/L or A/L Japanese",
      "Gain competitive Z-score advantages for university entrance in arts and humanities streams",
      "Build a natural head-start toward JLPT certifications and studying in Japan",
    ],
    faqs: [
      {
        q: "Are the classes taught according to the government school syllabus?",
        a: "Yes, our teachers adhere strictly to the National Institute of Education (NIE) curriculum guidelines and past examination patterns.",
      },
    ],
  },
};
