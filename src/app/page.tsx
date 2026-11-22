"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationModal from "@/components/ApplicationModal";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  Flower2,
  ShieldCheck,
  BookOpen,
  FileText,
  Plane,
  Flag,
  X,
  type LucideIcon,
} from "lucide-react";

interface BackendCourse {
  id: string;
  name: string;
  active: number;
}

interface CourseMetadata {
  description: string;
  duration: string;
  schedule: string;
  syllabus: string[];
}

const courseDetailsMap: Record<string, CourseMetadata> = {
  visa: {
    description: "Complete preparation for Japanese student visas, universities, and vocational colleges in Japan. Includes Certificate of Eligibility (COE) filing.",
    duration: "6–12 Months",
    schedule: "Full-Time & Flexible Cohorts • Morning & Evening",
    syllabus: [
      "JLPT N5 / N4 proficiency requirement completion",
      "Statement of Purpose (Shiyuusho) coaching",
      "Embassy of Japan mock interviews",
      "Housing and resident registration orientation in Japan",
    ],
  },
  general: {
    description: "Practical conversational and everyday Japanese for adults, working professionals, and language enthusiasts.",
    duration: "4–6 Months",
    schedule: "Weekday Evening & Weekend Batches",
    syllabus: [
      "Mastery of Hiragana, Katakana, and everyday essential Kanji",
      "Authentic dialogue drills and listening comprehension",
      "Workplace manners and Japanese etiquette (Keigo)",
      "Zero prior knowledge required , absolute beginner friendly",
    ],
  },
  ol: {
    description: "Structured preparation aligned with the Sri Lankan Ministry of Education G.C.E. Ordinary Level Japanese curriculum.",
    duration: "6–10 Months",
    schedule: "Weekend & After-School Classes",
    syllabus: [
      "Complete coverage of the national G.C.E. O/L syllabus",
      "Systematic past paper analysis and model paper discussions",
      "Grammar formulas and essential Kanji lists",
      "Continuous mock exams with individual teacher feedback",
    ],
  },
  al: {
    description: "In-depth Japanese curriculum for students sitting for the Sri Lankan G.C.E. Advanced Level examination.",
    duration: "1–2 Years",
    schedule: "Weekend & Evening Cohorts",
    syllabus: [
      "Prescribed literary texts and advanced syntax breakdown",
      "Timed model examination series and essay writing techniques",
      "Strategies to secure distinction (A) grades for high Z-scores",
      "Experienced educators familiar with national marking schemes",
    ],
  },
  kids: {
    description: "An engaging, interactive introduction to Japanese for young learners with songs, stories, and cultural activities.",
    duration: "Ongoing / Term-based",
    schedule: "Weekend Mornings • Small Group Format",
    syllabus: [
      "Fun phonetic introduction to Hiragana and spoken vocabulary",
      "Interactive cultural storytelling, origami, and customs",
      "Nurturing child-friendly instructors with small cohort attention",
      "Builds early linguistic confidence and curiosity",
    ],
  },
};

const defaultCourses: BackendCourse[] = [
  { id: "visa", name: "Japanese Visa + Class", active: 1 },
  { id: "general", name: "General Class", active: 1 },
  { id: "ol", name: "O/L Class", active: 1 },
  { id: "al", name: "A/L Class", active: 1 },
  { id: "kids", name: "Kids Class", active: 1 },
];

function getCourseIcon(id: string) {
  switch (id) {
    case "visa":
      return Plane;
    case "general":
      return BookOpen;
    case "ol":
    case "al":
      return GraduationCap;
    case "kids":
      return Flower2;
    default:
      return BookOpen;
  }
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-bold text-primary">
      <span className="h-0.5 w-6 bg-primary" />
      {children}
    </div>
  );
}

function OutlineBtn({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-3 rounded-full border border-primary px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
    >
      {children} <ChevronRight className="h-4 w-4" />
    </button>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState<BackendCourse[]>(defaultCourses);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("general");
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<{
    course: BackendCourse;
    details: CourseMetadata;
  } | null>(null);

  // Fetch courses directly from the SQLite Backend API
  useEffect(() => {
    let active = true;
    fetch("/api/public/config")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses.filter((c: BackendCourse) => c.active !== 0));
        }
      })
      .catch((err) => {
        console.warn("Could not load backend courses, using default list:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleOpenApply = (courseId: string = "general") => {
    setSelectedCourseId(courseId);
    setIsApplyModalOpen(true);
  };

  const handleCourseClick = (course: BackendCourse) => {
    const details = courseDetailsMap[course.id] || {
      description: `Comprehensive Japanese language training in ${course.name}.`,
      duration: "4–6 Months",
      schedule: "Weekend & Weekday Batches",
      syllabus: [
        "Language proficiency drills",
        "Listening and speaking sessions",
        "Examination readiness",
        "Certification guidance",
      ],
    };
    setSelectedCourseDetail({ course, details });
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background font-sans text-foreground">
      {/* Shared Header — single hamburger menu */}
      <Header
        onOpenConsultation={() => handleOpenApply("general")}
        onOpenApply={() => handleOpenApply("general")}
      />

      {/* HERO */}
      <section id="hero" className="relative">
        <img
          src="/assets/hero.jpg"
          alt="Mount Fuji with pagoda and cherry blossoms"
          width={1600}
          height={912}
          className="absolute right-0 top-0 h-full w-full object-cover md:w-[62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent md:via-background/40" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="max-w-xl pb-16 pt-12">
            <h1 className="mt-3 font-serif text-5xl leading-[1.05] md:text-6xl">
              Your Journey to <span className="text-primary">Japan</span> Starts Here.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted-foreground">
              TOMONI Japanese Language Institute helps students learn Japanese, prepare for JLPT N5/N4, and take their next step toward Japan.
            </p>
            <div className="mt-6">
              <Link
                href="/register?course=visa"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-95 transition-colors"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-5 px-5 pb-5">
        {/* WHY STUDY IN JAPAN */}
        <section id="why" className="grid gap-6 py-4 md:grid-cols-[280px_1fr]">
          <div>
            <Eyebrow>Why study in Japan?</Eyebrow>
            <h2 className="mt-3 font-serif text-4xl leading-tight">A Land of Opportunities</h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Japanese education, advanced technology and a unique culture give students many paths for the future.
            </p>
            <div className="mt-4">
              <OutlineBtn onClick={() => handleOpenApply("visa")}>Learn More</OutlineBtn>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {([
              [GraduationCap, "World-Class Education", "Globally recognized education system"],
              [Briefcase, "Great Career Opportunities", "Build a global career in Japan"],
              [Flower2, "Unique Culture", "Experience a rich and inspiring culture"],
              [ShieldCheck, "Safe & Developed Country", "A safe and advanced society"],
            ] as [LucideIcon, string, string][]).map(([Icon, t, d]) => (
              <div
                key={t}
                className="rounded-2xl bg-muted px-4 py-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-primary">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-foreground">{t}</h3>
                <p className="mt-3 text-[11px] text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </section>

        {/* COURSES (USING COURSES FROM BACKEND) */}
        <section
          id="courses"
          className="grid items-center overflow-hidden rounded-3xl bg-muted md:grid-cols-[45%_1fr_240px]"
        >
          <img
            src="/assets/classroom.jpg"
            alt="Japanese teacher in classroom"
            width={1200}
            height={800}
            loading="lazy"
            className="h-64 w-full rounded-r-[50%_100%] border-r-8 border-primary object-cover md:h-full"
          />

          <div className="p-6">
            <Eyebrow>Our courses</Eyebrow>
            <h2 className="mt-2 font-serif text-3xl leading-tight">Learn Japanese Your Way</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              From beginner to advanced, we offer comprehensive Japanese language courses with expert guidance.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-colors shadow-sm"
            >
              <span>Explore Courses</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Backend Courses Pill Stack */}
          <div className="space-y-3 p-5">
            {courses.map((course) => {
              const Icon = getCourseIcon(course.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleCourseClick(course)}
                  className="w-full flex items-center gap-3 rounded-full bg-background px-4 py-2.5 text-[11px] font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-95 transition-colors text-left text-foreground group"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.7} />
                  <span className="flex-1 truncate group-hover:text-primary transition-colors">
                    {course.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* JOURNEY */}
        <section id="journey" className="grid items-center gap-6 md:grid-cols-[260px_1fr_240px]">
          <div>
            <Eyebrow>Your journey</Eyebrow>
            <h2 className="mt-2 font-serif text-3xl leading-tight">From Sri Lanka to Japan</h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              We are with you at every step , from language learning to visa support and pre-departure guidance.
            </p>
            <div className="mt-4">
              <OutlineBtn onClick={() => handleOpenApply("visa")}>Our Support</OutlineBtn>
            </div>
          </div>

          <div className="flex items-start justify-between gap-1 overflow-x-auto py-2">
            {([
              [BookOpen, "Learn Japanese"],
              [FileText, "Prepare Documents"],
              [Plane, "Get Your Visa"],
              [Flag, "Fly to Japan"],
            ] as [LucideIcon, string][]).map(([Icon, t], i) => (
              <div key={t} className="flex items-start gap-1">
                <div className="w-16 text-center">
                  <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-primary">
                    <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <p className="mt-3 text-[11px] font-semibold text-foreground">{t}</p>
                </div>
                {i < 3 && <ArrowRight className="mt-5 h-4 w-4 text-primary shrink-0" />}
              </div>
            ))}
          </div>

          <img
            src="/assets/tokyo.jpg"
            alt="Tokyo Skytree with cherry blossoms"
            width={800}
            height={912}
            loading="lazy"
            className="h-56 w-full rounded-tl-[60%] object-cover shadow-sm"
          />
        </section>

        {/* EXPERIENCE JAPAN */}
        <section id="stories" className="grid gap-4">
          {/* Experience Japan Card */}
          <div className="flex gap-3 rounded-3xl bg-muted p-5">
            <div className="flex-1">
              <Eyebrow>Experience Japan</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-foreground">
                Discover a New Lifestyle
              </h2>
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                Study, travel and experience the beauty of Japan , from cherry blossoms to modern cities.
              </p>
              <div className="mt-4">
                <OutlineBtn onClick={() => handleOpenApply("visa")}>Explore Japan</OutlineBtn>
              </div>
            </div>

            {["/assets/temple.jpg", "/assets/street.jpg", "/assets/hero.jpg"].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="Japan scene"
                width={80}
                height={150}
                loading="lazy"
                className="h-36 w-16 rounded-lg object-cover sm:w-20 shadow-xs"
              />
            ))}
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[3rem] bg-primary px-8 py-6 text-primary-foreground sm:flex-row shadow-lg">
          <img
            src="/assets/torii.jpg"
            alt="Miyajima Torii gate"
            width={1024}
            height={656}
            loading="lazy"
            className="absolute left-0 top-0 h-full w-1/3 object-cover opacity-70 [mask-image:linear-gradient(to_right,black,transparent)]"
          />
          <div className="relative flex-1 text-center sm:pl-[25%]">
            <h2 className="font-serif text-2xl">Ready to Start Your Journey?</h2>
            <p className="mt-1 text-xs opacity-90">
              Get in touch with us today. Our team is here to help you.
            </p>
          </div>
          <Link
            href="/register"
            className="relative inline-flex items-center gap-4 rounded-full bg-background px-8 py-3 text-xs font-semibold text-foreground hover:opacity-95 shadow-md transition-colors group"
          >
            <span>Register Now</span>
            <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Course Detail Interactive Modal */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-foreground/60 transition-opacity menu-backdrop-enter"
            onClick={() => setSelectedCourseDetail(null)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-background rounded-3xl shadow-lg border border-border p-6 sm:p-8 z-10 menu-panel-enter my-8">
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4">
                <h3 className="font-serif text-3xl font-bold text-foreground">
                  {selectedCourseDetail.course.name}
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted border border-border mb-5 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">
                    {selectedCourseDetail.details.duration}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate text-foreground">
                    {selectedCourseDetail.details.schedule}
                  </span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-5">
                {selectedCourseDetail.details.description}
              </p>

              <div className="mb-6">
                <h4 className="text-xs font-bold text-foreground mb-2">
                  Curriculum Highlights
                </h4>
                <div className="space-y-2">
                  {selectedCourseDetail.details.syllabus.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-foreground/90">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCourseDetail(null)}
                  className="px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                >
                  Close
                </button>
                <Link
                  href={`/register?course=${selectedCourseDetail.course.id}`}
                  onClick={() => setSelectedCourseDetail(null)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-sm hover:opacity-95 transition-colors"
                >
                  <span>Register for this Course</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application / Consultation Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        defaultCourse={selectedCourseId}
      />
    </div>
  );
}
