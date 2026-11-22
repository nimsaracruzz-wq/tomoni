"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AboutSectionProps {
  onOpenApply?: () => void;
}

export default function AboutSection({ onOpenApply }: AboutSectionProps) {
  const commitments = [
    {
      title: "Sri Lankan Academic Alignment",
      description:
        "Specifically structured classes for the Sri Lankan G.C.E. O/L and A/L Japanese syllabi, combining intensive grammar analysis with model exam series.",
    },
    {
      title: "Authentic Communicative Pedagogy",
      description:
        "Focus on natural spoken Japanese, listening comprehension, correct pronunciation, and essential Japanese business and social etiquette (Keigo).",
    },
    {
      title: "End-to-End Higher Education Pathways",
      description:
        "Personalized advisory for school and university selection in Japan, Certificate of Eligibility (COE) preparation, and embassy interview coaching.",
    },
  ];

  return (
    <section id="about" className="py-20 lg:py-28 bg-cream relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <p className="text-sm font-medium text-red mb-3">About Tomoni Institute</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-6 leading-tight">
            An Educational Partner Dedicated to Your Aspirations in Japan.
          </h2>

          <p className="text-base text-stone-dark leading-relaxed">
            “Tomoni” means "Together." Founded with a singular vision, our institute exists to provide Sri Lankan students with the language proficiency, academic discipline, and cultural understanding needed to build meaningful lives and careers in Japan.
          </p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left: Photos */}
          <div className="lg:col-span-6 relative">
            <div className="grid grid-cols-12 gap-4">

              {/* Classroom Photo */}
              <div className="col-span-8 relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-white">
                <Image
                  src="/images/tomoni-classroom.jpg"
                  alt="Modern language classroom at Tomoni"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <p className="text-sm font-medium text-white/90">
                    Focused small-group instruction in Kuliyapitiya
                  </p>
                </div>
              </div>

              {/* Instructor + philosophy card */}
              <div className="col-span-4 flex flex-col gap-4">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md bg-white">
                  <Image
                    src="/images/tomoni-instructor.jpg"
                    alt="Instructor assisting students"
                    fill
                    sizes="(max-width: 768px) 50vw, 20vw"
                    className="object-cover object-center"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border-light shadow-sm flex flex-col justify-center">
                  <div className="text-sm font-semibold text-navy leading-tight mb-1">
                    Together on Every Step
                  </div>
                  <div className="text-xs text-stone leading-snug">
                    From your first lesson to arriving in Tokyo.
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Right: Commitments */}
          <div className="lg:col-span-6 space-y-5">
            {commitments.map((item) => (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white border border-border-light hover:border-border hover:shadow-sm transition-colors duration-300"
              >
                <h3 className="font-serif-heading text-lg font-semibold text-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-stone-dark leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}

            {/* Call to Action */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-navy hover:bg-navy-mid text-white text-sm font-semibold rounded-full transition-colors duration-300"
              >
                Consult an Admissions Advisor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#courses"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium text-navy hover:text-red transition-colors"
              >
                View All Course Tracks
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
