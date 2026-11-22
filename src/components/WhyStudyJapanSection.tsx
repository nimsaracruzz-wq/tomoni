"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Briefcase, Flower2, Gem, ChevronRight } from "lucide-react";

interface WhyStudyJapanSectionProps {
  onLearnMore?: () => void;
}

export default function WhyStudyJapanSection({ onLearnMore }: WhyStudyJapanSectionProps) {
  const cards = [
    {
      title: "World-Class Education",
      sub: "Globally recognized education system",
      icon: GraduationCap,
    },
    {
      title: "Great Career Opportunities",
      sub: "Build a global career in Japan",
      icon: Briefcase,
    },
    {
      title: "Unique Culture",
      sub: "Experience a rich and inspiring culture",
      icon: Flower2,
    },
    {
      title: "Safe & Developed Country",
      sub: "A safe and advanced society",
      icon: Gem,
    },
  ];

  return (
    <section id="why-japan" className="py-16 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Heading & Description */}
          <div className="lg:col-span-4 xl:col-span-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary ">
              <span className="w-5 h-[2px] bg-primary" />
              <span>WHY STUDY IN JAPAN?</span>
            </div>

            <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-tight text-foreground leading-tight">
              A Land of Opportunities
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md pt-1">
              Japanese education, advanced technology and a unique culture,
              Japan offers endless opportunities for your future.
            </p>

            <div className="pt-2">
              <Link
                href="/register?category=visa"
                className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-rule-strong hover:border-primary bg-white text-foreground hover:text-primary text-xs font-semibold shadow-xs hover:shadow-sm transition-colors duration-200"
              >
                <span>Learn More</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Rounded Cards */}
          <div className="lg:col-span-8 xl:col-span-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <div
                    key={i}
                    className="p-6 rounded-3xl bg-paper-warm border border-rule flex flex-col items-center text-center hover:bg-paper-warm hover:border-rule-strong transition-colors duration-200 shadow-xs hover:shadow-sm group"
                  >
                    {/* Circle Icon Badge */}
                    <div className="w-12 h-12 rounded-full bg-accent border border-signal-soft flex items-center justify-center text-primary mb-4 transition-transform ">
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>

                    <h3 className="font-sans font-bold text-sm text-foreground mb-1.5 leading-snug">
                      {c.title}
                    </h3>

                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {c.sub}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

