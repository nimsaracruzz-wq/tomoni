"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  MessageSquare,
  FileCheck2,
  ChevronRight,
  ArrowRight,
  Clock,
  Calendar,
  CheckCircle2,
  X,
} from "lucide-react";

export interface CourseItem {
  id: string;
  title: string;
  badge: string;
  level: string;
  duration: string;
  schedule: string;
  mode: string;
  description: string;
  syllabus: string[];
  intake: string;
}

export const detailedCourses: CourseItem[] = [
  {
    id: "beginner",
    title: "Beginner Japanese",
    badge: "Foundation Level",
    level: "JLPT N5 Starter • Zero Knowledge Required",
    duration: "3–4 Months (72 Hours)",
    schedule: "Weekend Morning (Sat/Sun 9:00 AM – 12:00 PM) or Weekday Evening",
    mode: "Physical in Kuliyapitiya / Live Interactive Online",
    description:
      "A complete foundational introduction to Japanese language and culture. Designed for absolute beginners to master reading, writing, and daily spoken expressions with confidence.",
    syllabus: [
      "Mastery of Hiragana and Katakana phonetic alphabets",
      "100+ essential Kanji characters with stroke order",
      "Everyday conversational greetings, asking directions, and shopping",
      "Core sentence patterns and grammatical particles",
      "Regular quizzes and personalized pronunciation coaching",
    ],
    intake: "Batches open monthly • Next intake enrolling now",
  },
  {
    id: "jlpt",
    title: "JLPT Preparation",
    badge: "Exam Focused",
    level: "Target: JLPT N5, N4, N3, N2, N1",
    duration: "4–6 Months per level",
    schedule: "Saturday / Sunday Intensive Batches (8:30 AM – 1:30 PM)",
    mode: "Physical in Kuliyapitiya & Online Hybrid",
    description:
      "Rigorous, structured test-preparation tailored for the official Japanese Language Proficiency Test. Focuses on timed past papers, listening comprehension drills, and high-yield grammar rules.",
    syllabus: [
      "Complete JLPT syllabus coverage according to Japan Foundation guidelines",
      "Timed mock examinations and question-by-question analysis",
      "Comprehensive Kanji, vocabulary, and grammar master-lists",
      "Choukai (Listening) audio simulations using authentic test acoustics",
      "Individual scoring feedback and targeted weak-area tutoring",
    ],
    intake: "July & December examination intake batches",
  },
  {
    id: "conversation",
    title: "Conversation Course",
    badge: "Fluency & Pronunciation",
    level: "Kaiwa & Everyday Spoken Fluency",
    duration: "3 Months (48 Hours)",
    schedule: "Weekday Evenings (Tue/Thu 6:30 PM – 8:30 PM) or Weekend Afternoons",
    mode: "Interactive Small Groups (Physical & Online)",
    description:
      "Break through speaking hesitation and achieve natural conversation flow. Interactive speaking practice mirroring authentic situations you will face living and studying in Japan.",
    syllabus: [
      "Overcoming speaking anxiety through guided dialogue circles",
      "Natural accent, intonation, and rhythm correction",
      "Handling real-life situations: restaurants, hospitals, banks, and immigration",
      "Contemporary colloquial phrases and youth expressions",
      "Interactive 1-on-1 paired discussions and roleplay exercises",
    ],
    intake: "Flexible rolling cohorts with small group limits",
  },
  {
    id: "business",
    title: "Business Japanese",
    badge: "Career & Workplace",
    level: "Keigo & Corporate Professional Japanese",
    duration: "3–4 Months (60 Hours)",
    schedule: "Weekday Evening Batches (Mon/Wed 6:30 PM – 8:30 PM)",
    mode: "Kuliyapitiya Classroom / Corporate Online",
    description:
      "Essential language skills and business etiquette for professionals working with Japanese companies, engineers, IT specialists, or students seeking employment in Japan.",
    syllabus: [
      "Mastery of respectful language: Sonkeigo, Kenjougo, and Teineigo",
      "Japanese corporate email writing, telephone etiquette, and greetings",
      "Japanese business card exchange (Meishi Koukan) and meeting manners",
      "Japanese resume (Rirekisho) writing and mock job interview training",
      "Cross-cultural workplace conflict resolution and team harmony",
    ],
    intake: "Quarterly corporate & professional cohorts",
  },
];

interface LearnCoursesSectionProps {
  onSelectCourse?: (course: CourseItem) => void;
}

export default function LearnCoursesSection({ onSelectCourse }: LearnCoursesSectionProps) {
  const [selectedModalCourse, setSelectedModalCourse] = useState<CourseItem | null>(null);

  const courseCards = [
    {
      id: "beginner",
      title: "Beginner Japanese",
      icon: BookOpen,
      badge: "JLPT N5",
    },
    {
      id: "jlpt",
      title: "JLPT Preparation",
      icon: GraduationCap,
      badge: "N5 to N1",
    },
    {
      id: "conversation",
      title: "Conversation Course",
      icon: MessageSquare,
      badge: "Spoken Fluency",
    },
    {
      id: "business",
      title: "Business Japanese",
      icon: FileCheck2,
      badge: "Career Track",
    },
  ];

  const handleOpenCourse = (id: string) => {
    const found = detailedCourses.find((c) => c.id === id);
    if (found) {
      if (onSelectCourse) {
        onSelectCourse(found);
      } else {
        setSelectedModalCourse(found);
      }
    }
  };

  return (
    <>
      <section id="courses" className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left: Classroom Photo with Organic Pill Curve */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-3xl lg:rounded-r-[4rem] overflow-hidden shadow-md bg-white border border-rule">
                <Image
                  src="/images/design/classroom-ganbatte.jpg"
                  alt="Japanese teacher helping students in classroom with whiteboard"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center"
                />
                {/* Subtle soft gradient border */}
                <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-3xl lg:rounded-r-[4rem]" />
              </div>
            </div>

            {/* Center: Headline & Explore Button */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Learn Japanese Your Way
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                From beginner to advanced, we offer comprehensive Japanese
                language courses with expert guidance.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleOpenCourse("beginner")}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-signal-hover text-white text-xs font-semibold rounded-full shadow-sm hover:shadow-md transition-colors duration-200"
                >
                  <span>Explore Courses</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Right: 4 Pill-Shaped Course Cards */}
            <div className="lg:col-span-4 space-y-3">
              {courseCards.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleOpenCourse(c.id)}
                    className="w-full text-left p-4 rounded-2xl bg-white hover:bg-paper-raised border border-rule hover:border-rule-strong shadow-xs hover:shadow-sm transition-colors duration-200 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-accent border border-signal-soft flex items-center justify-center text-primary shrink-0 transition-transform ">
                        <Icon className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="font-sans font-bold text-sm text-foreground group-hover:text-primary transition-colors block">
                          {c.title}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {c.badge}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Class Details Modal */}
      {selectedModalCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 transition-opacity"
            onClick={() => setSelectedModalCourse(null)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-rule p-6 sm:p-8 z-10 animate-fade-in my-8">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedModalCourse(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-paper-warm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="pr-10 mb-6">
                <div className="inline-block px-3 py-1 rounded-full bg-accent text-primary text-xs font-semibold mb-2">
                  {selectedModalCourse.badge}
                </div>
                <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-foreground">
                  {selectedModalCourse.title}
                </h3>
                <p className="text-xs sm:text-sm text-primary font-medium mt-1">
                  {selectedModalCourse.level}
                </p>
              </div>

              {/* Class Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-background border border-rule mb-6 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>{selectedModalCourse.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{selectedModalCourse.mode}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Physical & Online</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-1.5">
                    Course Overview
                  </h4>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {selectedModalCourse.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-foreground mb-2">
                    Key Syllabus Modules
                  </h4>
                  <div className="space-y-2">
                    {selectedModalCourse.syllabus.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-muted-foreground">
                  {selectedModalCourse.intake}
                </span>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedModalCourse(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-rule-strong text-xs font-semibold text-muted-foreground hover:bg-paper-warm"
                  >
                    Close
                  </button>
                  <Link
                    href={`/register?course=${selectedModalCourse.id}`}
                    onClick={() => setSelectedModalCourse(null)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-signal-hover text-white text-xs font-semibold rounded-full shadow-sm"
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
