"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Plane,
  Flag,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

interface StudentJourneySectionProps {
  onOurSupport?: () => void;
}

export default function StudentJourneySection({ onOurSupport }: StudentJourneySectionProps) {
  const steps = [
    {
      title: "Learn Japanese",
      icon: BookOpen,
    },
    {
      title: "Prepare Documents",
      icon: FileText,
    },
    {
      title: "Get Your Visa",
      icon: Plane,
    },
    {
      title: "Fly to Japan",
      icon: Flag,
    },
  ];

  return (
    <section id="student-life" className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left: Heading & Description */}
          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
              From Sri Lanka to Japan
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We are with you at every step , from language learning to visa
              support and pre-departure guidance.
            </p>

            <div className="pt-2">
              <Link
                href="/register?category=visa"
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-rule-strong hover:border-primary bg-white text-foreground hover:text-primary text-xs font-semibold shadow-xs hover:shadow-sm transition-colors duration-200"
              >
                <span>Our Support</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Center: 4 Circle Icons with Arrows */}
          <div className="lg:col-span-5">
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 sm:gap-2">
              {steps.map((st, idx) => {
                const Icon = st.icon;
                const isLast = idx === steps.length - 1;
                return (
                  <React.Fragment key={st.title}>
                    <div className="flex flex-col items-center text-center group min-w-[75px] sm:min-w-[85px]">
                      {/* Circle Badge */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent border border-signal-soft flex items-center justify-center text-primary mb-2.5 shadow-xs transition-transform ">
                        <Icon className="w-6 h-6 stroke-[1.8]" />
                      </div>
                      <span className="font-sans font-semibold text-xs text-foreground leading-tight max-w-[80px]">
                        {st.title}
                      </span>
                    </div>

                    {!isLast && (
                      <div className="hidden sm:flex items-center justify-center text-muted-foreground pb-6 shrink-0">
                        <ArrowRight className="w-4 h-4 text-primary/40 stroke-[2.5]" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Right: Skytree Arched Window / Dome Image */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[320px] aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-t-[7rem] rounded-b-2xl shadow-md border border-rule bg-white">
              <Image
                src="/images/design/skytree-arch.jpg"
                alt="Tokyo Skytree with city skyline and cherry blossoms"
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-t-[7rem] rounded-b-2xl" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

