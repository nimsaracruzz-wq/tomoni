"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ApplicationModal from "@/components/ApplicationModal";
import {
  BookOpen,
  GraduationCap,
  Plane,
  Home as HomeIcon,
  Flower2,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface BackendCourse {
  id: string;
  name: string;
  active: number;
}

interface CourseFullInfo {
  id: string;
  name: string;
  category: string;
  badge: string;
  level: string;
  duration: string;
  schedule: string;
  mode: string;
  description: string;
  highlights: string[];
  intakeDates: string;
}

const detailedCourseCatalog: Record<string, CourseFullInfo> = {
  visa: {
    id: "visa",
    name: "Japanese Visa + Class",
    category: "visa",
    badge: "Higher Education in Japan",
    level: "Target: JLPT N5 / N4 • University & College Pathway",
    duration: "6–12 Months Intensive",
    schedule: "Full-Time & Flexible Cohorts (Morning & Evening Batches)",
    mode: "Physical in Kuliyapitiya & Live Interactive Online",
    description:
      "Comprehensive Japanese language instruction coupled with complete student visa guidance. From preparing for the official JLPT examinations to Certificate of Eligibility (COE) filing, university matching, and embassy mock interviews.",
    highlights: [
      "JLPT N5 and N4 examination preparation for Japanese Immigration compliance",
      "Drafting and proofreading of the Japanese Statement of Purpose (Shiyuusho)",
      "Financial sponsorship documentation auditing and embassy interview simulations",
      "Direct university and specialized vocational college (Senmon Gakko) counseling",
      "Pre-departure orientation: Japanese student housing, Part-time work permits (28 hrs/week)",
    ],
    intakeDates: "April 2027, June 2027 & October 2027 Intakes",
  },
  general: {
    id: "general",
    name: "General Class",
    category: "general",
    badge: "Practical & Professional",
    level: "Foundational to Intermediate Conversational Japanese",
    duration: "4–6 Months",
    schedule: "Weekday Evening & Weekend Batches",
    mode: "Kuliyapitiya Institute / Online Nationwide",
    description:
      "Designed for adults, working professionals, and language enthusiasts looking to build authentic Japanese communication skills for career advancement, commerce, or personal enrichment.",
    highlights: [
      "Mastery of Hiragana, Katakana, and essential everyday Kanji",
      "Natural conversational dialogues, pronunciation drills, and listening comprehension",
      "Workplace communication etiquette and Japanese business manners (Keigo)",
      "Zero prior knowledge required , designed specifically for beginners",
    ],
    intakeDates: "Monthly enrollment cohorts",
  },
  ol: {
    id: "ol",
    name: "O/L Class",
    category: "school",
    badge: "National Syllabus",
    level: "Sri Lankan G.C.E. Ordinary Level Examination",
    duration: "6–10 Months",
    schedule: "Weekend & After-School Cohorts",
    mode: "Kuliyapitiya Classroom / Interactive Online",
    description:
      "Rigorous, syllabus-aligned preparation for Sri Lankan school students sitting for the G.C.E. Ordinary Level Japanese examination. Combines core grammar mastery with continuous past paper review.",
    highlights: [
      "Complete coverage of the official Sri Lankan G.C.E. O/L syllabus",
      "Comprehensive past paper analysis and timed model exam papers",
      "Systematic grammar formulas, Kanji lists, and reading comprehension",
      "Continuous mock exams with individual performance diagnostics",
    ],
    intakeDates: "Ongoing support for upcoming national exam series",
  },
  al: {
    id: "al",
    name: "A/L Class",
    category: "school",
    badge: "National Syllabus",
    level: "Sri Lankan G.C.E. Advanced Level Examination",
    duration: "1–2 Years Comprehensive",
    schedule: "Weekend & Evening Sessions",
    mode: "Kuliyapitiya Center / Online Batches",
    description:
      "Advanced Japanese training specifically designed for students taking Japanese as an A/L subject to achieve Distinction (A) grades and secure top university entrance Z-scores in Sri Lanka.",
    highlights: [
      "In-depth analysis of prescribed literary texts and advanced syntax",
      "Intensive past paper discussions and timed model examination series",
      "Techniques for scoring distinction grades in essay and structured questions",
      "Taught by certified educators with deep expertise in Sri Lankan marking schemes",
    ],
    intakeDates: "New cohort enrollment open for upcoming A/L academic years",
  },
  kids: {
    id: "kids",
    name: "Kids Class",
    category: "kids",
    badge: "Young Learners",
    level: "Phonetics, Basic Vocabulary & Cultural Appreciation",
    duration: "Term-Based (Ongoing)",
    schedule: "Weekend Mornings (Small Group Format)",
    mode: "Kuliyapitiya Learning Studio",
    description:
      "An engaging, joyful environment introducing young learners to spoken Japanese, phonetic scripts, origami, songs, and cultural traditions in an encouraging setting.",
    highlights: [
      "Fun phonetic introduction to Hiragana and spoken vocabulary",
      "Cultural storytelling, origami, calligraphy, and Japanese customs",
      "Nurturing, child-friendly instructors with small cohort attention",
      "Fosters early linguistic confidence and global curiosity",
    ],
    intakeDates: "Rolling weekend enrollment",
  },
};

export default function CoursesPage() {
  const [filter, setFilter] = useState<string>("all");
  const [courses, setCourses] = useState<BackendCourse[]>([]);
  const [intakes, setIntakes] = useState<Array<{ id: string; name: string }>>([]);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("general");

  useEffect(() => {
    let active = true;
    fetch("/api/public/config")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(data.courses.filter((c: BackendCourse) => c.active !== 0));
        }
        if (data && Array.isArray(data.intakes)) {
          setIntakes(data.intakes.filter((intake: { active?: number }) => intake.active !== 0));
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const openEnroll = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsApplyOpen(true);
  };

  const managedCourseIds = new Set(courses.map((course) => course.id));
  const courseList =
    courses.length > 0
      ? courses.map((managedCourse) => {
          const details = detailedCourseCatalog[managedCourse.id];
          return (
            details
              ? { ...details, name: managedCourse.name }
              : {
              id: managedCourse.id,
              name: managedCourse.name,
              category: "general",
              badge: "Japanese Language Program",
              level: "Ask our team about the right level for you",
              duration: "Flexible",
              schedule: "Contact us for current batches",
              mode: "Kuliyapitiya Institute / Online",
              description:
                "A Japanese language program from TOMONI Japanese Language Institute. Contact our team for the current syllabus, schedule, and admission guidance.",
              highlights: [
                "Japanese language instruction with practical conversation",
                "Guidance on the right level and learning pathway",
                "Support from TOMONI teaching staff",
              ],
              intakeDates: "Contact us for upcoming intakes",
            }
          );
        })
      : Object.values(detailedCourseCatalog);
  const displayedCourseList = courseList.filter(
    (course) => managedCourseIds.size === 0 || managedCourseIds.has(course.id),
  );
  const intakeSummary =
    intakes.length > 0
      ? intakes.map((intake) => intake.name).join(" • ")
      : "Contact us for upcoming intakes";

  const filteredCourses =
    filter === "all"
      ? displayedCourseList
      : displayedCourseList.filter((c) => c.category === filter);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col selection:bg-accent selection:text-primary">
      <Header onOpenConsultation={() => openEnroll("general")} />

      <main className="flex-grow pb-16">
        {/* Banner Section */}
        <section className="bg-muted py-14 lg:py-20 border-b border-border">
          <div className="mx-auto max-w-6xl px-5">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-2xl">
              Structured Japanese Courses for Every Milestone.
            </h1>

            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Whether you are preparing for Sri Lankan national examinations (G.C.E. O/L & A/L), building conversational fluency, or aiming for higher education in Japan, TOMONI provides accredited training tailored for Sri Lankan students.
            </p>

            {/* Filter Pills */}
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {[
                { id: "all", label: `All Programs (${displayedCourseList.length})` },
                { id: "visa", label: "Study in Japan Visa" },
                { id: "school", label: "School O/L & A/L" },
                { id: "general", label: "General & Adults" },
                { id: "kids", label: "Kids Japanese" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-5 py-2 text-xs font-semibold rounded-full transition-colors ${
                    filter === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background text-foreground hover:bg-accent/60 border border-border"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Course Catalog */}
        <section className="mx-auto max-w-6xl px-5 pt-12 space-y-8">
          <div className="grid grid-cols-1 gap-8">
            {filteredCourses.filter((course) => displayedCourseList.some((item) => item.id === course.id)).map((course) => (
              <div
                key={course.id}
                className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border mb-5">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-accent text-primary text-[11px] font-bold ">
                        {course.badge}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {course.id === "visa" ? intakeSummary : course.intakeDates}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>{course.mode}</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {course.name}
                  </h2>
                  <p className="text-xs text-primary font-semibold mb-4">
                    {course.level}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs font-bold text-foreground mb-2">
                      Curriculum Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {course.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-foreground/90">
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span>Schedule: {course.schedule}</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => openEnroll(course.id)}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:opacity-95 text-xs font-semibold rounded-full shadow-sm transition-colors"
                    >
                      <span>Enroll in {course.name}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Consultation Strip */}
          <div className="rounded-3xl bg-muted p-8 text-center space-y-4 border border-border">
            <h3 className="font-serif text-2xl font-bold text-foreground">
              Unsure Which Course Best Matches Your Goals?
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Our academic counselors in Kuliyapitiya provide personalized evaluations to help you choose the ideal level, exam syllabus, and schedule.
            </p>
            <div>
              <button
                type="button"
                onClick={() => openEnroll("general")}
                className="inline-flex items-center gap-2 whitespace-nowrap px-7 py-3 bg-primary text-primary-foreground text-xs font-semibold rounded-full shadow-md hover:opacity-95 transition-colors"
              >
                <span>Book Free Academic Counseling</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <ApplicationModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        defaultCourse={selectedCourseId}
        availableCourses={courses}
        availableIntakes={intakes}
      />
    </div>
  );
}
