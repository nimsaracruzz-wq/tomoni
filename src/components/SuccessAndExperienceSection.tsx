"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SuccessAndExperienceSection() {
  const [currentStory, setCurrentStory] = useState(0);

  const stories = [
    {
      quote: "TOMONI helped me turn my dream into reality.",
      name: "Hashini Perera",
      role: "Former Student • Now in Japan",
      image: "/images/design/testimonial-student.jpg",
      avatar: "/images/design/hashini-avatar.jpg",
    },
    {
      quote: "The teachers prepared me perfectly for my university interview in Tokyo.",
      name: "Tharindu Silva",
      role: "JLPT N2 Graduate • Ritsumeikan University",
      image: "/images/student-testimonials.jpg",
      avatar: "/images/design/hashini-avatar.jpg",
    },
    {
      quote: "From zero Japanese to securing my visa and accommodation in Osaka.",
      name: "Dilani Jayawardena",
      role: "Visa Cohort 2025 • Senmon Gakko Student",
      image: "/images/student-life-japan.jpg",
      avatar: "/images/design/hashini-avatar.jpg",
    },
  ];

  const handlePrev = () => {
    setCurrentStory((prev) => (prev === 0 ? stories.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentStory((prev) => (prev === stories.length - 1 ? 0 : prev + 1));
  };

  const story = stories[currentStory];

  return (
    <section id="success-stories" className="py-12 lg:py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Card 1: Success Stories */}
          <div className="p-6 sm:p-8 rounded-3xl bg-paper-warm border border-rule shadow-xs hover:shadow-sm transition-colors duration-300 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* Student Photo + Navigation Arrows */}
              <div className="sm:col-span-5 relative">
                <div className="relative aspect-[4/4.5] w-full rounded-2xl overflow-hidden shadow-sm bg-white border border-rule">
                  <Image
                    src={story.image}
                    alt={story.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Left/Right Floating Navigation Buttons */}
                <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous story"
                    className="w-8 h-8 rounded-full bg-white border border-rule-strong text-foreground hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next story"
                    className="w-8 h-8 rounded-full bg-white border border-rule-strong text-foreground hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center transition-colors shadow-xs"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Story Content */}
              <div className="sm:col-span-7 space-y-4">
                <blockquote className="font-serif-heading text-xl sm:text-2xl font-bold text-foreground leading-snug">
                  “{story.quote}”
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden relative border-2 border-white shadow-xs shrink-0 bg-accent">
                    <Image
                      src={story.avatar}
                      alt={story.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-foreground leading-tight">
                      {story.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      {story.role}
                    </p>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex items-center gap-1.5 pt-2">
                  {stories.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrentStory(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-2 rounded-full transition-colors ${
                        currentStory === i
                          ? "w-6 bg-primary"
                          : "w-2 bg-muted hover:bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Experience Japan / Discover a New Lifestyle */}
          <div className="p-6 sm:p-8 rounded-3xl bg-paper-warm border border-rule shadow-xs hover:shadow-sm transition-colors duration-300 flex flex-col justify-between">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
              
              {/* Text Information on Left */}
              <div className="sm:col-span-6 space-y-4">
                <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
                  Discover a New Lifestyle
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Study, travel and experience the beauty of Japan , from cherry
                  blossoms to modern cities.
                </p>

                <div className="pt-2">
                  <Link
                    href="/register?category=visa"
                    className="group inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-rule-strong hover:border-primary bg-white text-foreground hover:text-primary text-xs font-semibold shadow-xs hover:shadow-sm transition-colors duration-200"
                  >
                    <span>Explore Japan</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>

              {/* 3 Vertical Capsule Photos on Right */}
              <div className="sm:col-span-6">
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {/* Capsule 1: Traditional Shrine */}
                  <div className="relative aspect-[1/2.2] rounded-full overflow-hidden shadow-xs border border-rule bg-white">
                    <Image
                      src="/images/design/lifestyle-shrine.jpg"
                      alt="Traditional Japanese shrine"
                      fill
                      sizes="(max-width: 768px) 30vw, 10vw"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Capsule 2: Neon Tokyo City */}
                  <div className="relative aspect-[1/2.2] rounded-full overflow-hidden shadow-xs border border-rule bg-white mt-3">
                    <Image
                      src="/images/design/lifestyle-neon.jpg"
                      alt="Modern neon Tokyo city lights"
                      fill
                      sizes="(max-width: 768px) 30vw, 10vw"
                      className="object-cover object-center"
                    />
                  </div>

                  {/* Capsule 3: Lake Fuji with Cherry Blossoms */}
                  <div className="relative aspect-[1/2.2] rounded-full overflow-hidden shadow-xs border border-rule bg-white">
                    <Image
                      src="/images/design/lifestyle-lake.jpg"
                      alt="Mount Fuji with cherry blossom lake"
                      fill
                      sizes="(max-width: 768px) 30vw, 10vw"
                      className="object-cover object-center"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

