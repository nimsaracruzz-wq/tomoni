"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Calendar, Clock, ArrowRight } from "lucide-react";
import { ArticleData } from "./NewsSection";

interface ArticleModalProps {
  article: ArticleData | null;
  onClose: () => void;
  onOpenApply: () => void;
}

export default function ArticleModal({
  article,
  onClose,
  onOpenApply,
}: ArticleModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && article) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [article, onClose]);

  if (!article) return null;

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
          <div className="relative aspect-[16/9] w-full bg-navy">
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-navy/80 text-white hover:bg-red rounded-full transition-colors"
              aria-label="Close article"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-5 left-6 right-6 text-white">
              <span className="inline-block px-3 py-1 rounded-full bg-red text-white text-[10px] font-semibold mb-2">
                {article.category}
              </span>
              <h3 className="font-serif-heading text-xl sm:text-2xl font-semibold text-white leading-tight">
                {article.title}
              </h3>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 sm:p-8 space-y-6 bg-cream">
            
            {/* Meta Strip */}
            <div className="flex items-center gap-4 text-xs text-stone pb-4 border-b border-border-light">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{article.date}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
              <span>•</span>
              <span className="text-navy font-medium">Tomoni Academic Editorial</span>
            </div>

            {/* Article Content */}
            <div className="space-y-4 text-xs sm:text-sm text-stone-dark leading-relaxed">
              <p className="font-medium text-navy text-sm sm:text-base leading-snug">
                {article.excerpt}
              </p>
              <p>
                {article.content}
              </p>
              <div className="p-4 rounded-2xl bg-white border border-border-light text-xs text-stone-dark">
                <span className="font-semibold text-navy block mb-1">
                  Advisory Note for Sri Lankan Students:
                </span>
                Our academic counselors regularly review admission deadlines, past paper trends, and visa criteria with students during our weekly tutorials.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-border-light flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-medium text-stone-dark hover:text-navy hover:bg-cream-warm rounded-full transition-colors"
              >
                Close
              </button>

              <Link
                href="/register"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red hover:bg-red-hover text-white text-xs font-semibold rounded-full shadow-sm hover:shadow transition-colors"
              >
                <span>Enroll Online</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}