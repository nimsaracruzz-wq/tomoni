"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

interface HeroSectionProps {
  onOpenConsultation?: () => void;
  onOpenVideo?: () => void;
}

export default function HeroSection({
  onOpenConsultation,
  onOpenVideo,
}: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-4 pb-16 lg:pt-8 lg:pb-24 bg-background"
    >
      {/* Background Graphic: Fuji, Pagoda & Cherry Blossoms on the Right */}
      <div className="absolute top-0 right-0 w-full lg:w-[62%] h-[400px] lg:h-[620px] pointer-events-none select-none z-0">
        <div className="relative w-full h-full">
          <Image
            src="/images/tomoni-hero-japan.jpg"
            alt="Mount Fuji and Chureito Pagoda with cherry blossoms"
            fill
            priority
            className="object-cover object-right-top lg:object-center opacity-90 lg:opacity-100"
          />
          {/* Subtle blend gradients to melt image into the background seamlessly */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent w-full lg:w-[45%]" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background to-transparent" />
        </div>
      </div>

      {/* Floating Cherry Blossom Petals decoration */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Soft floating sakura petal SVGs */}
        <span
          className="absolute top-16 left-[46%] w-3.5 h-2.5 rounded-full bg-accent opacity-60 rotate-45 transform blur-[0.3px]"
          style={{ clipPath: "ellipse(50% 35% at 50% 50%)" }}
        />
        <span
          className="absolute top-28 left-[38%] w-4 h-3 rounded-full bg-accent opacity-50 -rotate-12 transform blur-[0.4px]"
          style={{ clipPath: "ellipse(50% 35% at 50% 50%)" }}
        />
        <span
          className="absolute top-44 left-[52%] w-3 h-2 rounded-full bg-accent opacity-70 rotate-[35deg] transform"
          style={{ clipPath: "ellipse(50% 35% at 50% 50%)" }}
        />
        <span
          className="absolute top-72 left-[32%] w-3.5 h-2.5 rounded-full bg-accent opacity-40 -rotate-45 transform"
          style={{ clipPath: "ellipse(50% 35% at 50% 50%)" }}
        />
        <span
          className="absolute top-96 left-[48%] w-4 h-2.5 rounded-full bg-accent opacity-60 rotate-12 transform"
          style={{ clipPath: "ellipse(50% 35% at 50% 50%)" }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <div className="max-w-xl lg:max-w-2xl pt-8 sm:pt-12 lg:pt-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary mb-4 sm:mb-5">
            <span>STUDY JAPAN</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>BUILD YOUR FUTURE</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-[4.25rem] font-bold tracking-tight text-foreground leading-[1.12] mb-6">
            Your Journey to{" "}
            <span className="text-primary inline-block">Japan</span>{" "}
            Starts Here.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8 sm:mb-10 font-sans">
            TOMONI Japanese Institute in Sri Lanka helps you learn Japanese,
            achieve your dreams and explore a brighter future in Japan.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary Action Button */}
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-primary hover:bg-signal-hover text-white text-xs sm:text-sm font-semibold rounded-full shadow-md hover:shadow-lg transition-colors duration-200"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>

            {/* Video Action Button */}
            <button
              type="button"
              onClick={onOpenVideo}
              className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/80 hover:bg-white text-foreground border border-rule text-xs sm:text-sm font-semibold rounded-full shadow-xs hover:shadow-sm transition-colors duration-200"
            >
              <span className="w-7 h-7 rounded-full bg-accent border border-signal-soft text-primary flex items-center justify-center pl-0.5">
                <Play className="w-3.5 h-3.5 fill-primary" />
              </span>
              <span>Watch Video</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
