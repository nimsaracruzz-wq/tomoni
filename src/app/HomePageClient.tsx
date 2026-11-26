"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQAccordion from "@/components/FAQAccordion";
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
  jft: {
    description: "Targeted training for the Japan Foundation Test for Basic Japanese (JFT-Basic) required for the Specified Skilled Worker (SSW / Tokutei Ginou) visa in Japan.",
    duration: "4–5 Months Intensive",
    schedule: "Weekday & Weekend Batches",
    syllabus: [
      "Irodori: Japanese for Life in Japan curriculum (Can-Do based learning)",
      "Computer-based testing (CBT) practice questions and simulation",
      "Everyday workplace conversations and health/safety instructions in Japan",
      "Specified Skilled Worker (SSW) visa application support and document guidance",
    ],
  },
  ol: {
    description: "Structured curriculum tailored directly to the Sri Lankan G.C.E. Ordinary Level Japanese syllabus, model papers, and past questions.",
    duration: "1–2 Academic Years",
    schedule: "Weekend & After-School Batches",
    syllabus: [
      "Complete coverage of the National Curriculum syllabus",
      "Past paper discussions and marking schemes",
      "Grammar rule mastery and sentence translation techniques",
      "Timed term test simulations to guarantee an 'A' distinction",
    ],
  },
  al: {
    description: "In-depth coaching for the Sri Lankan G.C.E. Advanced Level Japanese examination to ensure competitive Z-scores and university entrance.",
    duration: "2 Academic Years",
    schedule: "Weekend & Flexible Batches",
    syllabus: [
      "Advanced grammar breakdowns and essay composition",
      "Kanji mastery required for the G.C.E. A/L benchmark",
      "Prescribed Japanese literature and reading comprehension",
      "In-depth analysis of past A/L examination questions",
    ],
  },
  kids: {
    description: "Interactive, joyful introduction to Japanese language, songs, greetings, and Japanese cultural traditions for young learners.",
    duration: "Ongoing / Term-based",
    schedule: "Weekend Mornings",
    syllabus: [
      "Hiragana and Katakana character recognition through fun visual games",
      "Daily polite greetings and practical family vocabulary",
      "Japanese origami, songs, folklore, and cultural stories",
      "Confidence-building verbal communication practice",
    ],
  },
};

const defaultMainstreamCourses: BackendCourse[] = [
  { id: "visa", name: "Japanese Visa + Class", active: 1 },
  { id: "general", name: "General Japanese Class", active: 1 },
  { id: "jft", name: "JFT Class", active: 1 },
  { id: "ol", name: "School O/L Class", active: 1 },
  { id: "al", name: "School A/L Class", active: 1 },
  { id: "kids", name: "Kids Japanese Class", active: 1 },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-wider text-primary uppercase">
      {children}
    </p>
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
      className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
    >
      <span>{children}</span>
      <ArrowRight className="h-3.5 w-3.5 text-primary" />
    </button>
  );
}

export default function HomePageClient() {
  const [courses, setCourses] = useState<BackendCourse[]>(defaultMainstreamCourses);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<{
    course: BackendCourse;
    details: CourseMetadata;
  } | null>(null);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("visa");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Body scroll lock when course detail modal is open ── */
  useEffect(() => {
    if (!selectedCourseDetail) return;
    const scrollY = window.scrollY;
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedCourseDetail(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedCourseDetail]);

  useEffect(() => {
    fetch("/api/public/config")
      .then((res) => {
        if (!res.ok) throw new Error("Config request failed");
        return res.json();
      })
      .then((data) => {
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const mapped: BackendCourse[] = data.categories.map((cat: { id: string; name: string }) => ({
            id: cat.id,
            name: cat.name,
            active: 1,
          }));
          setCourses(mapped);
        }
      })
      .catch((err) => {
        console.warn("Using default mainstream course tracks:", err);
      });
  }, []);

  const handleOpenApply = (courseId: string = "visa") => {
    setSelectedCourseId(courseId);
    setIsApplyModalOpen(true);
  };

  const handleCourseClick = (course: BackendCourse) => {
    const details = courseDetailsMap[course.id] || {
      description: "Comprehensive Japanese language curriculum designed to take you from foundational basics to fluent communication.",
      duration: "4–6 Months",
      schedule: "Weekday & Weekend Options Available",
      syllabus: [
        "Interactive Hiragana, Katakana & Kanji training",
        "Listening comprehension and dialogue drills",
        "Examination coaching and mock papers",
        "Cultural context and native etiquette",
      ],
    };
    setSelectedCourseDetail({ course, details });
  };

  const getCourseIcon = (courseId: string): LucideIcon => {
    switch (courseId) {
      case "visa":
        return Plane;
      case "general":
        return BookOpen;
      case "jft":
        return Briefcase;
      case "ol":
      case "al":
        return GraduationCap;
      case "kids":
        return Flower2;
      default:
        return BookOpen;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <Header onOpenApply={() => handleOpenApply("visa")} />

      {/* HERO SECTION WITH ENHANCED SEO HEADINGS */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <Image
          src="/assets/hero.jpg"
          alt="Japanese Language Classes in Sri Lanka at Tomoni Japanese Language Center"
          priority
          width={1600}
          height={912}
          className="absolute right-0 top-0 h-full w-full object-cover md:w-[62%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent md:via-background/40" />

        <div className="relative mx-auto max-w-6xl px-5">
          <div className="max-w-xl pb-16 pt-12 sm:pt-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-3">
              <span>Leading Japanese Language Center in Sri Lanka</span>
            </div>

            <h1 className="font-serif text-4xl leading-[1.08] sm:text-5xl md:text-6xl font-bold">
              Japanese Language Classes in <span className="text-primary">Sri Lanka</span>
            </h1>

            <p className="mt-4 text-base sm:text-lg font-medium text-foreground/90">
              Learn Japanese with Tomoni Japanese Language Center
            </p>

            <p className="mt-3 max-w-md text-[14px] sm:text-[15px] leading-relaxed text-muted-foreground">
              Master JLPT N5/N4/N3, JFT-Basic, and School O/L & A/L Japanese. Transparent, ethical guidance for student visas, universities, and career pathways in Japan.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register?course=visa"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3 text-xs font-semibold text-primary-foreground shadow-lg hover:opacity-95 transition-colors"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur-xs px-5 py-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <span>Explore Courses</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-6">
        {/* WHY STUDY IN JAPAN */}
        <section id="why" className="grid gap-6 py-6 md:grid-cols-[280px_1fr]">
          <div>
            <Eyebrow>Why Study in Japan?</Eyebrow>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl leading-tight font-bold">
              A Land of Unmatched Opportunities
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Japan offers Sri Lankan students world-class education, safe living environments, and lucrative career pathways with legal part-time work permissions.
            </p>
            <div className="mt-4">
              <OutlineBtn onClick={() => handleOpenApply("visa")}>Learn More</OutlineBtn>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {([
              [GraduationCap, "World-Class Education", "Globally recognized degrees & vocational diplomas"],
              [Briefcase, "Career & Job Growth", "High-demand sectors: IT, engineering, nursing & hospitality"],
              [Flower2, "Rich Culture & Safety", "Experience a safe, welcoming, and technologically advanced society"],
              [ShieldCheck, "Legal Student Work", "Work part-time up to 28 hours per week to support your stay"],
            ] as [LucideIcon, string, string][]).map(([Icon, t, d]) => (
              <div
                key={t}
                className="rounded-2xl bg-muted px-4 py-6 text-center shadow-xs hover:shadow-md transition-shadow"
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
          <Image
            src="/assets/classroom.jpg"
            alt="Japanese language students learning in classroom at Tomoni Institute"
            width={1200}
            height={800}
            loading="lazy"
            className="h-64 w-full rounded-r-[50%_100%] border-r-8 border-primary object-cover md:h-full"
          />

          <div className="p-6 sm:p-8">
            <Eyebrow>Japanese Language Courses</Eyebrow>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl leading-tight font-bold">
              Learn Japanese Your Way in Sri Lanka
            </h2>
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
              From absolute beginner JLPT N5 through N4/N3, JFT-Basic for SSW jobs, and national school O/L and A/L syllabi, our experienced faculty guides you to distinction.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-colors shadow-xs"
              >
                <span>View All Courses</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/courses/jlpt-n5"
                className="text-xs font-semibold text-primary hover:underline"
              >
                JLPT N5 Details →
              </Link>
            </div>
          </div>

          {/* Backend Courses Pill Stack */}
          <div className="space-y-2.5 p-5">
            {courses.map((course) => {
              const Icon = getCourseIcon(course.id);
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() => handleCourseClick(course)}
                  className="w-full flex items-center gap-3 rounded-full bg-background px-4 py-2.5 text-[11px] font-medium shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all text-left text-foreground group"
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
            <Eyebrow>Your Journey</Eyebrow>
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl leading-tight font-bold">
              From Sri Lanka to Japan
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              We stand beside you at every step—from certified language instruction to COE documentation, embassy interviews, and pre-departure life skills.
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

          <Image
            src="/assets/tokyo.jpg"
            alt="Tokyo Skytree with cherry blossoms - Study and work in Japan destination"
            width={800}
            height={912}
            loading="lazy"
            className="h-56 w-full rounded-tl-[60%] object-cover shadow-xs"
          />
        </section>

        {/* EXPERIENCE JAPAN */}
        <section id="stories" className="grid gap-4">
          <div className="flex flex-col sm:flex-row gap-5 rounded-3xl bg-muted p-6">
            <div className="flex-1">
              <Eyebrow>Experience Japan</Eyebrow>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-foreground font-bold">
                Discover a New Lifestyle & Career in Japan
              </h2>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Study, work, travel, and immerse yourself in Japanese hospitality, safety, and modern infrastructure. Start your preparation with Tomoni in Kuliyapitiya.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <OutlineBtn onClick={() => handleOpenApply("visa")}>Explore Japan</OutlineBtn>
                <Link href="/blog" className="text-xs font-semibold text-primary hover:underline">
                  Read Study Guides →
                </Link>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <Image
                src="/assets/temple.jpg"
                alt="Traditional Japanese temple in Kyoto - Japanese cultural exploration"
                width={80}
                height={150}
                loading="lazy"
                className="h-36 w-20 rounded-lg object-cover shadow-xs"
              />
              <Image
                src="/assets/street.jpg"
                alt="Tokyo city street - Employment and career opportunities in Japan"
                width={80}
                height={150}
                loading="lazy"
                className="h-36 w-20 rounded-lg object-cover shadow-xs"
              />
              <Image
                src="/assets/hero.jpg"
                alt="Tomoni Japanese Language Center students preparing for JLPT"
                width={80}
                height={150}
                loading="lazy"
                className="h-36 w-20 rounded-lg object-cover shadow-xs"
              />
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS - DIRECTLY ON HOMEPAGE */}
        <FAQAccordion />

        {/* CTA BANNER */}
        <section className="relative flex flex-col items-center gap-4 overflow-hidden rounded-[3rem] bg-primary px-8 py-8 text-primary-foreground sm:flex-row shadow-lg">
          <Image
            src="/assets/torii.jpg"
            alt="Historic Miyajima floating Torii gate in Hiroshima, Japan"
            width={1024}
            height={656}
            loading="lazy"
            className="absolute left-0 top-0 h-full w-1/3 object-cover opacity-70 [mask-image:linear-gradient(to_right,black,transparent)]"
          />
          <div className="relative flex-1 text-center sm:pl-[25%]">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold">
              Your Journey to Japan Starts Here
            </h2>
            <p className="mt-1 text-xs opacity-90 max-w-lg mx-auto">
              Enroll today in our Kuliyapitiya physical batches or live interactive online classes.
            </p>
          </div>
          <Link
            href="/register"
            className="relative inline-flex items-center gap-3 rounded-full bg-background px-8 py-3 text-xs font-semibold text-foreground hover:opacity-95 shadow-md transition-colors group shrink-0"
          >
            <span>Register Now</span>
            <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
          </Link>
        </section>
      </main>

      {/* Shared Footer */}
      <Footer />

      {/* Course Detail Interactive Modal via Portal */}
      {mounted && selectedCourseDetail && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="course-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-foreground/60 backdrop-blur-xs transition-opacity menu-backdrop-enter"
            onClick={() => setSelectedCourseDetail(null)}
            aria-hidden="true"
          />

          {/* Dialog Container - Centered, fixed, with internal scroll */}
          <div className="relative z-10 flex flex-col w-full max-w-xl max-h-[90dvh] bg-background rounded-3xl shadow-2xl border border-border overflow-hidden menu-panel-enter">
            {/* Header (docked at top of modal) */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0 border-b border-border/50">
              <h3 id="course-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-foreground pr-8">
                {selectedCourseDetail.course.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="p-2 -mr-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer touch-manipulation"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4 space-y-5">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted border border-border text-xs">
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

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedCourseDetail.details.description}
              </p>

              <div>
                <h4 className="text-xs font-bold text-foreground mb-2.5 uppercase tracking-wider text-muted-foreground">
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
            </div>

            {/* Footer Actions (docked at bottom of modal) */}
            <div className="px-6 py-4 border-t border-border bg-muted/40 shrink-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="px-5 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer touch-manipulation"
              >
                Close
              </button>
              <Link
                href={`/register?course=${selectedCourseDetail.course.id}`}
                onClick={() => setSelectedCourseDetail(null)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-xs hover:opacity-95 transition-colors cursor-pointer touch-manipulation"
              >
                <span>Register for this Course</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>,
        document.body
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
