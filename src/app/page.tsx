"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Menu,
  X,
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
  type LucideIcon,
} from "lucide-react";
import ApplicationModal from "@/components/ApplicationModal";

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

function Logo({ small }: { small?: boolean }) {
  return (
    <div className={`relative ${small ? "h-12 w-40" : "h-16 w-52"}`}>
      <Image
        src="/images/tomoni_japanese_institute_logo.png"
        alt="TOMONI Japanese Language Institute"
        fill
        sizes="208px"
        className="object-contain object-left"
        priority
      />
    </div>
  );
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
  const [menuOpen, setMenuOpen] = useState(false);
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

  useEffect(() => {
    if (!menuOpen) return;

    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeMenu);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeMenu);
    };
  }, [menuOpen]);

  const nav = [
    { label: "Home", href: "/" },
    { label: "Courses", href: "/courses" },
    { label: "About Us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Register", href: "/register" },
    { label: "Contact", href: "/contact" },
  ];

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
          <header className="relative z-30 flex items-center justify-between py-5">
            <Link href="/" className="focus:outline-none">
              <Logo />
            </Link>
            
            <nav className="hidden gap-7 text-xs font-medium lg:flex">
              {nav.map((n, i) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={
                    i === 0
                      ? "border-b-2 border-primary pb-1 text-primary font-semibold"
                      : "text-foreground/80 hover:text-primary transition-colors"
                  }
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <Link
              href="/register"
              className="hidden items-center gap-3 rounded-full bg-primary py-1.5 pl-4 pr-1.5 text-xs font-semibold text-primary-foreground sm:inline-flex hover:opacity-95 transition-colors shadow-sm group"
            >
              <span>Get Consultation</span>
              <span className="grid h-6 w-6 place-items-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
                <ChevronRight className="h-4 w-4 text-primary" />
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              className="relative z-10 grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-primary text-primary-foreground lg:hidden"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </header>

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

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <button
            type="button"
            className="menu-backdrop-enter absolute inset-0 h-full w-full cursor-default bg-foreground/45"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-navigation"
            aria-label="Mobile Navigation"
            className="menu-panel-enter absolute inset-x-4 top-4 rounded-2xl border border-border bg-background p-4 shadow-lg"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">Menu</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="grid h-10 w-10 touch-manipulation place-items-center rounded-full bg-muted text-foreground"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {nav.map((n, i) => (
              <Link
                key={n.label}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className={`flex min-h-12 touch-manipulation items-center justify-between rounded-xl px-4 py-3 text-sm font-medium ${
                  i === 0 ? "bg-accent text-primary" : "hover:bg-muted"
                }`}
              >
                <span>{n.label}</span>
                <ChevronRight className="h-4 w-4 text-primary" />
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="relative z-10 mt-3 flex min-h-12 w-full touch-manipulation items-center justify-center gap-3 rounded-full bg-primary px-4 py-3 text-xs font-semibold text-primary-foreground shadow-sm"
            >
              <span>Get Consultation</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}

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

      {/* FOOTER */}
      <footer id="contact" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 pb-6 pt-2">
        <Logo small />
        <nav className="flex flex-wrap gap-6 text-[10px] font-medium text-muted-foreground">
          {nav.map((n) => (
            <Link key={n.label} href={n.href} className="hover:text-primary transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>
        
        {/* Social Icons */}
        <div className="flex gap-2">
          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Line / Message */}
          <a
            href="https://line.me"
            target="_blank"
            rel="noreferrer"
            aria-label="Line"
            className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-background hover:bg-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
            </svg>
          </a>
        </div>

        <p className="border-l border-primary/40 pl-6 text-[10px] text-primary">
          Study in Japan. Grow Your Future.
        </p>
      </footer>

      {/* Course Detail Interactive Modal */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-foreground/60 transition-opacity"
            onClick={() => setSelectedCourseDetail(null)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-xl bg-background rounded-3xl shadow-lg border border-border p-6 sm:p-8 z-10 animate-fade-in my-8">
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
