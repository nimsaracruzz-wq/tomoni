"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, FileCheck, ShieldCheck, Home, CheckCircle2 } from "lucide-react";

interface StudyInJapanSectionProps {
  onOpenApply?: () => void;
}

export default function StudyInJapanSection({ onOpenApply }: StudyInJapanSectionProps) {
  const [activeStep, setActiveStep] = useState(0);

  const supportPillars = [
    {
      title: "Institution Matching",
      icon: Compass,
      description:
        "Personalized counseling to identify the right universities, vocational colleges (Senmon Gakko), or Japanese language academies in Tokyo, Osaka, Kyoto, and Nagoya based on your academic background and career goals.",
      keyDeliverables: [
        "Curriculum matching & accreditation checks",
        "Direct communication with Japanese institution admission offices",
        "Scholarship availability assessment (JASSO, MEXT, institutional)",
      ],
    },
    {
      title: "Application & Documentation",
      icon: FileCheck,
      description:
        "Comprehensive assistance with Japanese application paperwork, certified translation of Sri Lankan academic records (O/L, A/L, degree transcripts), Japanese Statement of Purpose drafting, and recommendation validation.",
      keyDeliverables: [
        "Statement of Purpose (Shiyuusho) crafted in professional Japanese",
        "Certified translations of Sri Lankan educational certificates",
        "Document auditing against Japanese Immigration Bureau benchmarks",
      ],
    },
    {
      title: "COE & Visa Preparation",
      icon: ShieldCheck,
      description:
        "End-to-end guidance for securing the Certificate of Eligibility (COE) from Japanese Immigration, organizing financial sponsorship evidence, and conducting mock interviews for the Embassy of Japan in Sri Lanka.",
      keyDeliverables: [
        "Sponsorship documentation and banking guidance",
        "Immigration Bureau submission checklist verification",
        "Rigorous mock interviews conducted in Japanese and English",
      ],
    },
    {
      title: "Pre-Departure & Living in Japan",
      icon: Home,
      description:
        "Essential practical workshops covering student housing (dormitories vs. apartments), municipal resident registration (Juminhyo), National Health Insurance, Japanese bank account setup, and part-time work permit regulations.",
      keyDeliverables: [
        "Housing reservation assistance prior to departure from Colombo",
        "Guidance on the 28-hour/week student work permit system",
        "Community connections with Sri Lankan student alumni in Japan",
      ],
    },
  ];

  return (
    <section id="study-in-japan" className="bg-navy text-white py-20 lg:py-28 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <p className="text-sm font-medium text-red-border mb-3">Study in Japan Advisory</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-white mb-5">
            Your Pathway from Sri Lanka to Japanese Higher Education.
          </h2>

          <p className="text-base text-white/70 leading-relaxed">
            Studying in Japan opens doors to world-renowned academic standards, advanced technological industries, and rewarding international careers. Tomoni provides end-to-end institutional support tailored specifically for Sri Lankan students.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

          {/* Left: Interactive Navigation */}
          <div className="lg:col-span-5 space-y-3">
            {supportPillars.map((p, idx) => {
              const Icon = p.icon;
              const isActive = activeStep === idx;
              return (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  className={`w-full text-left p-5 rounded-2xl transition-colors duration-300 border flex items-start gap-4 ${
                    isActive
                      ? "bg-white/10 border-red text-white shadow-lg"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isActive
                        ? "bg-red text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-white block mb-0.5">
                      {p.title}
                    </span>
                    <p className="text-xs text-white/55 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </button>
              );
            })}

            <div className="pt-4">
              <Link
                href="/register?category=visa"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-red hover:bg-red-hover text-white text-sm font-semibold rounded-full transition-colors duration-300"
              >
                Consult with our Admissions Team
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-7">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 shadow-lg">

              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div>
                  <span className="text-xs font-medium text-red-border block mb-1">
                    Phase {activeStep + 1} of {supportPillars.length}
                  </span>
                  <h3 className="font-serif-heading text-2xl font-semibold text-white">
                    {supportPillars[activeStep].title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                {supportPillars[activeStep].description}
              </p>

              {/* Deliverables */}
              <div className="space-y-3 mb-8">
                <span className="text-xs font-semibold text-white/50 block">
                  Key Support Deliverables
                </span>
                {supportPillars[activeStep].keyDeliverables.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-white/90">
                    <CheckCircle2 className="w-4 h-4 text-red shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              {/* Photo */}
              <div className="relative aspect-[16/8] w-full rounded-2xl overflow-hidden border border-white/10 bg-navy">
                <Image
                  src="/images/study-in-japan.jpg"
                  alt="Educational life in Japan"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-xs text-white/80">
                  Student Visa Counseling Desk
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
