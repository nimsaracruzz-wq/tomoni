"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Check, BookOpen } from "lucide-react";

export interface CourseData {
  level: string;
  badge: string;
  title: string;
  subTitle: string;
  duration: string;
  description: string;
  image: string;
  highlights: string[];
  schedule: string;
  target: string;
  jlptTarget?: string;
}

export const coursesData: CourseData[] = [
  {
    level: "visa",
    badge: "Study in Japan",
    title: "Japanese Visa + Class",
    subTitle: "Higher Education & Visa Pathway Track",
    duration: "6–12 months",
    schedule: "Full-Time & Flexible Cohorts • Morning & Evening",
    target: "Sri Lankan students preparing to study at universities or vocational colleges in Japan",
    jlptTarget: "Target: JLPT N5 / N4 / NAT-TEST",
    description:
      "Comprehensive Japanese language training combined with complete advisory for students aspiring to study in Japan. Includes institutional matching, Certificate of Eligibility (COE) documentation, and visa interview preparation.",
    image: "/images/study-in-japan.jpg",
    highlights: [
      "Language proficiency for Japanese student visa requirements",
      "Guidance for COE paperwork, financial documentation & embassy interviews",
      "Practical conversational fluency for living independently in Japan",
      "Direct university and Senmon Gakko admissions counseling",
    ],
  },
  {
    level: "general",
    badge: "Adult & Career",
    title: "General Class",
    subTitle: "Practical Japanese for Adults & Professionals",
    duration: "4–6 months",
    schedule: "Weekday Evening & Weekend Batches",
    target: "Beginners, working professionals, and lifelong learners building authentic communication skills",
    jlptTarget: "Foundation: Hiragana, Katakana, Kanji, JLPT N5–N4",
    description:
      "Develop practical, everyday Japanese communication skills for career advancement, international commerce, or personal enrichment. Covers foundational script, grammar structures, vocabulary, and social etiquette.",
    image: "/images/tomoni-classroom.jpg",
    highlights: [
      "Mastery of Hiragana, Katakana, and everyday essential Kanji",
      "Spoken dialogue drills, authentic listening, and correct pronunciation",
      "Japanese workplace communication manners and Keigo fundamentals",
      "Zero prior knowledge required , designed for absolute beginners",
    ],
  },
  {
    level: "ol",
    badge: "National Syllabus",
    title: "O/L Class",
    subTitle: "Sri Lankan G.C.E. Ordinary Level Examination Support",
    duration: "6–10 months",
    schedule: "Weekend & After-School Classes",
    target: "School students in Sri Lanka preparing for the G.C.E. O/L Japanese examination",
    jlptTarget: "Aligned with Sri Lankan National Curriculum",
    description:
      "Structured curriculum specifically created to support Sri Lankan school students in excelling at the G.C.E. Ordinary Level Japanese examination. Combines syllabus mastery with comprehensive past paper review.",
    image: "/images/course-n5.jpg",
    highlights: [
      "Complete coverage of the official Sri Lankan G.C.E. O/L Japanese syllabus",
      "Systematic past paper analysis, model paper discussions, and essay techniques",
      "Grammar formulas, essential kanji lists, and reading comprehension",
      "Continuous mock exams and individual performance feedback",
    ],
  },
  {
    level: "al",
    badge: "National Syllabus",
    title: "A/L Class",
    subTitle: "Sri Lankan G.C.E. Advanced Level Examination Support",
    duration: "1–2 years",
    schedule: "Structured Cohorts • Weekend & Evening Sessions",
    target: "Advanced Level students sitting for Japanese as a main examination subject",
    jlptTarget: "Advanced Grammar, Literature & High Z-Score Focus",
    description:
      "Rigorous Japanese instruction designed for students sitting for the Sri Lankan Advanced Level examination. Emphasizes prescribed literary texts, complex syntax, kanji mastery, and scoring distinction grades.",
    image: "/images/course-n4.jpg",
    highlights: [
      "In-depth analysis of prescribed literary texts and advanced syntax",
      "Intensive past paper practice and timed model examination series",
      "Strategies to secure distinction (A) grades for university admissions",
      "Instruction by experienced educators familiar with Sri Lankan marking schemes",
    ],
  },
  {
    level: "kids",
    badge: "Young Learners",
    title: "Kids Class",
    subTitle: "Engaging Japanese for Young Learners",
    duration: "Ongoing / Term-based",
    schedule: "Weekend Mornings • Small Group Format",
    target: "Children and young students beginning their journey in Japanese language and culture",
    jlptTarget: "Early Bilingual Foundations",
    description:
      "An interactive and engaging program that introduces children to spoken Japanese, phonetic kana, songs, stories, and cultural traditions in an encouraging and supportive environment.",
    image: "/images/course-n3.jpg",
    highlights: [
      "Fun phonetic introduction to Hiragana and spoken vocabulary",
      "Interactive cultural storytelling, origami, and Japanese customs",
      "Nurturing, child-friendly instructors with small cohort attention",
      "Builds early linguistic confidence and cross-cultural curiosity",
    ],
  },
];

interface CourseSectionProps {
  onSelectCourse?: (course: CourseData) => void;
  onOpenApply?: (courseLevel?: string) => void;
}

export default function CourseSection({
  onSelectCourse,
  onOpenApply,
}: CourseSectionProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredCourses =
    filter === "all"
      ? coursesData
      : filter === "school"
      ? coursesData.filter((c) => c.level === "ol" || c.level === "al")
      : filter === "japan"
      ? coursesData.filter((c) => c.level === "visa")
      : coursesData.filter((c) => c.level === "general" || c.level === "kids");

  return (
    <section id="courses" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-red mb-3">Academic Programs</p>

            <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
              Japanese Courses for Every Aspiration.
            </h2>

            <p className="text-base text-stone-dark leading-relaxed">
              Whether you are preparing for Sri Lankan national examinations, building practical language skills, or preparing for student visa approval in Japan, Tomoni offers structured curricula taught with academic rigor.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-cream rounded-full border border-border-light self-start md:self-end">
            {[
              { id: "all", label: "All Programs" },
              { id: "school", label: "O/L & A/L" },
              { id: "japan", label: "Study in Japan" },
              { id: "general", label: "Adult & Kids" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 text-xs font-medium rounded-full transition-colors duration-200 ${
                  filter === tab.id
                    ? "bg-navy text-white shadow-sm"
                    : "text-stone-dark hover:text-navy hover:bg-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.level}
              className="group bg-cream rounded-2xl border border-border-light hover:border-border transition-colors duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md"
            >
              <div>
                {/* Course Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-border-light rounded-t-2xl">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center transition-transform duration-500 "
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 rounded-full text-[11px] font-semibold text-navy">
                    {course.badge}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="font-serif-heading text-lg font-semibold text-navy group-hover:text-red transition-colors mb-1">
                    {course.title}
                  </h3>

                  <p className="text-xs font-medium text-stone mb-3">
                    {course.subTitle}
                  </p>

                  <p className="text-xs text-stone-dark leading-relaxed line-clamp-3 mb-5">
                    {course.description}
                  </p>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-border-light space-y-2 text-xs text-stone-dark">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-stone shrink-0" />
                      <span>Duration: {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-stone shrink-0" />
                      <span className="truncate">{course.schedule}</span>
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="mt-4 pt-4 border-t border-border-light space-y-1.5">
                    {course.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-stone-dark">
                        <Check className="w-3.5 h-3.5 text-red shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-6 pt-0 flex items-center gap-3">
                {onSelectCourse && (
                  <button
                    type="button"
                    onClick={() => onSelectCourse(course)}
                    className="flex-1 py-2.5 px-3 bg-white hover:bg-cream-warm text-navy border border-border text-xs font-semibold rounded-xl transition-colors duration-200 text-center"
                  >
                    View Details
                  </button>
                )}

                <Link
                  href={`/register?category=${course.level}`}
                  className="flex-1 py-2.5 px-3 bg-navy hover:bg-red text-white text-xs font-semibold rounded-xl transition-colors duration-200 text-center inline-flex items-center justify-center gap-1.5"
                >
                  <span>Enroll</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Advisory Strip */}
        <div className="mt-12 p-6 rounded-2xl bg-cream border border-border-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-stone-dark">
            <BookOpen className="w-5 h-5 text-red shrink-0" />
            <span>
              Unsure which program fits your academic stage? Consult directly with our Colombo counseling desk.
            </span>
          </div>
          <Link
            href="/register"
            className="shrink-0 text-sm font-semibold text-red hover:underline inline-flex items-center gap-1"
          >
            Request Course Counseling
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
}
