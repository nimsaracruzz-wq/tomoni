"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";

interface FinalCTAProps {
  onOpenApply?: () => void;
}

export default function FinalCTA({ onOpenApply }: FinalCTAProps) {
  return (
    <section className="relative py-24 lg:py-32 bg-navy text-white overflow-hidden">
      {/* Background photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/tomoni-footer-artwork.jpg"
          alt="Japanese educational landscape"
          fill
          sizes="100vw"
          className="object-cover object-center opacity-20 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        <p className="text-sm font-medium text-red-border mb-4">Begin Your Journey</p>

        <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mb-6 leading-tight">
          Your Future in Japan Begins at Tomoni.
        </h2>

        <p className="text-base text-white/70 leading-relaxed max-w-2xl mx-auto mb-10">
          Join a dedicated community of Sri Lankan learners. Whether your target is an A grade in O/L or A/L Japanese, or advancing to an accredited university in Tokyo, we are with you at every milestone.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-red hover:bg-red-hover text-white text-sm font-semibold rounded-full shadow-lg hover:shadow-lg transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-red"
          >
            Apply Online for 2026 Intake
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-sm font-medium rounded-full transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Mail className="w-4 h-4 text-red-border" />
            Contact Kuliyapitiya Institute
          </a>
        </div>

      </div>
    </section>
  );
}
