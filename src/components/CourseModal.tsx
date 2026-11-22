"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Clock, CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { CourseData } from "./CourseSection";

interface CourseModalProps {
  course: CourseData | null;
  onClose: () => void;
  onApplyForCourse: (courseLevel: string) => void;
}

export default function CourseModal({
  course,
  onClose,
  onApplyForCourse,
}: CourseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && course) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [course, onClose]);

  if (!course) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-border-light overflow-hidden z-10 animate-fade-in my-8">
          
          {/* Header Image */}
          <div className="relative aspect-[16/8] w-full bg-navy">
            <Image
              src={course.image}
              alt={course.title}
              fill
              className="object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-navy/80 text-white hover:bg-red rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-5 left-6 right-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-3 py-1 rounded-full bg-red text-white text-[11px] font-semibold ">
                  {course.badge}
                </span>
              </div>
              <h3 className="font-serif-heading text-2xl sm:text-3xl font-semibold text-white">
                {course.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                {course.subTitle}
              </p>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-cream">
            
            {/* Duration and Class info strip */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pb-5 border-b border-border-light text-xs text-stone-dark">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red shrink-0" />
                <span className="font-medium text-navy">Duration: {course.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-red shrink-0" />
                <span>{course.schedule}</span>
              </div>
            </div>

            {/* Overview */}
            <div>
              <h4 className="font-serif-heading text-base font-semibold text-navy mb-2">
                Course Syllabus & Objectives
              </h4>
              <p className="text-xs sm:text-sm text-stone-dark leading-relaxed">
                {course.description} Designed specifically for Sri Lankan students seeking high-quality Japanese language education, structured exam readiness, and personal academic growth.
              </p>
            </div>

            {/* Target Audience */}
            <div className="p-4 rounded-2xl bg-white border border-border-light text-xs text-stone-dark">
              <span className="font-semibold text-navy block mb-1">Target Candidates:</span>
              <span>{course.target}</span>
            </div>

            {/* Core Competencies */}
            <div>
              <h4 className="text-xs font-semibold text-navy mb-3">
                Key Curriculum Milestones
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-navy">
                    <CheckCircle2 className="w-4 h-4 text-red shrink-0 mt-0.5" />
                    <span className="leading-snug">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border-light flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-medium text-stone-dark hover:text-navy hover:bg-cream-warm rounded-full transition-colors"
              >
                Close
              </button>

              <Link
                href={`/register?course=${course.level}`}
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 bg-red hover:bg-red-hover text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-colors"
              >
                <span>Enroll in {course.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}