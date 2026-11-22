"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, FileCheck, Plane, GraduationCap, CheckCircle2 } from "lucide-react";

export default function TestimonialsSection() {
  const pathwaySteps = [
    {
      stage: "Step 1",
      title: "Linguistic Foundation in Sri Lanka",
      duration: "Months 1–4",
      description:
        "Mastering Hiragana, Katakana, everyday Kanji radicals, and basic sentence construction. Students in school tracks focus on O/L syllabi; visa candidates target JLPT N5 / NAT-TEST requirements.",
      highlights: [
        "Phonetic pronunciation drills",
        "Foundational 100+ Kanji mastery",
        "Elementary spoken dialogue exercises",
      ],
      icon: BookOpen,
    },
    {
      stage: "Step 2",
      title: "Proficiency & Examination Mastery",
      duration: "Months 5–8",
      description:
        "Advancing into compound grammar patterns, reading comprehension, and natural conversational cadence. Intensive past paper practice for Sri Lankan A/L or JLPT N4 / N3 preparation.",
      highlights: [
        "Interactive situational roleplay",
        "Prescribed literary text analysis (A/L)",
        "JLPT / NAT-TEST mock examination series",
      ],
      icon: GraduationCap,
    },
    {
      stage: "Step 3",
      title: "Institution Matching & Visa (COE)",
      duration: "Months 7–11",
      description:
        "Collaborative advisory to select accredited Japanese universities, vocational colleges (Senmon Gakko), or language schools. Auditing sponsorship paperwork and Certificate of Eligibility (COE) filing.",
      highlights: [
        "Japanese Statement of Purpose drafting",
        "Embassy of Japan interview simulations",
        "Financial documentation verification",
      ],
      icon: FileCheck,
    },
    {
      stage: "Step 4",
      title: "Arrival, Housing & Life in Japan",
      duration: "Pre-departure & Beyond",
      description:
        "Pre-departure orientation in Colombo covering student housing options, airport reception, municipal registration (Juminhyo), and student part-time work permit regulations.",
      highlights: [
        "Pre-arrival dormitory/apartment placement",
        "National Health Insurance & bank setup briefing",
        "Connection with Sri Lankan alumni network in Japan",
      ],
      icon: Plane,
    },
  ];

  return (
    <section id="pathway" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-red mb-3">Study Pathway</p>

            <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
              The Journey from Colombo to Japan.
            </h2>

            <p className="text-base text-stone-dark leading-relaxed">
              A transparent, step-by-step roadmap designed to guide Sri Lankan students through every milestone of language acquisition, examination success, and visa transition.
            </p>
          </div>

          <Link
            href="/register?category=visa"
            className="inline-flex items-center gap-2 px-5 py-3 bg-navy hover:bg-red text-white text-sm font-semibold rounded-full transition-colors duration-300 shrink-0"
          >
            Begin Your Pathway
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Pathway Steps , connected timeline look */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pathwaySteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stage}
                className="relative p-6 rounded-2xl bg-cream border border-border-light hover:border-border hover:shadow-sm transition-colors duration-300 flex flex-col justify-between"
              >
                {/* Step indicator + icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-red">
                      {step.stage}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white border border-border-light flex items-center justify-center text-navy">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-serif-heading text-base font-semibold text-navy mb-1">
                    {step.title}
                  </h3>

                  <span className="inline-block text-xs font-medium text-stone mb-3">
                    Typical timeline: {step.duration}
                  </span>

                  <p className="text-xs text-stone-dark leading-relaxed mb-5">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-border-light space-y-1.5">
                  {step.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-dark">
                      <CheckCircle2 className="w-3 h-3 text-red shrink-0 mt-0.5" />
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
