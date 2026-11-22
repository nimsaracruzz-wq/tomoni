"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";

export interface ArticleData {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  content: string;
}

export const articlesData: ArticleData[] = [
  {
    id: "kanji-mastery-tips",
    title: "Essential Strategies for Mastering Kanji & Grammar in Sri Lanka",
    category: "Linguistic Strategy",
    date: "October 18, 2026",
    readTime: "5 min read",
    excerpt:
      "Proven learning methods combining spaced repetition, radical mnemonics, and sentence context to prepare effectively for JLPT and school exams without memorization fatigue.",
    image: "/images/news-learning-japanese.jpg",
    content:
      "Mastering Kanji is a foundational milestone for Sri Lankan students learning Japanese. Rather than mechanical rote repetition of disconnected characters, successful learners analyze structural radicals, link them with visual mnemonics, and immediately put new vocabulary to use within authentic sentences. At Tomoni, our interactive drills emphasize contextual usage across both written essays and conversational prompts to guarantee lasting memory retention.",
  },
  {
    id: "study-in-japan-checklist",
    title: "Admissions Checklist: Preparing for Japanese Universities & Colleges",
    category: "Study in Japan",
    date: "September 24, 2026",
    readTime: "7 min read",
    excerpt:
      "Crucial timelines, Certificate of Eligibility (COE) requirements, and financial documentation benchmarks for Sri Lankan students targeting upcoming intakes.",
    image: "/images/news-studying-in-japan.jpg",
    content:
      "Navigating the admission requirements for Japanese universities, vocational colleges (Senmon Gakko), and Japanese language institutions requires meticulous planning. From certifying Sri Lankan G.C.E. O/L and A/L certificates to drafting a coherent Statement of Purpose in Japanese, preparation must begin 6 to 9 months before your intended intake. Review our step-by-step roadmap to fulfill immigration criteria without stress.",
  },
  {
    id: "japanese-cultural-etiquette",
    title: "Everyday Etiquette & Workplace Manners for Living in Japan",
    category: "Cultural Preparation",
    date: "August 30, 2026",
    readTime: "6 min read",
    excerpt:
      "A practical guide to polite phrasing (Keigo), neighborhood garbage sorting rules, commuter etiquette, and adapting smoothly to Japanese daily life.",
    image: "/images/news-japanese-culture.jpg",
    content:
      "Life in Japan is defined by social harmony, punctuality, and mutual respect. Learning everyday social expectations , from greeting convenience store clerks politely to mastering the municipal recycling regulations and observing commuter quiet zones on trains , ensures that your transition is welcoming, dignified, and mutually enriching.",
  },
];

interface NewsSectionProps {
  onSelectArticle?: (article: ArticleData) => void;
}

export default function NewsSection({ onSelectArticle }: NewsSectionProps) {
  return (
    <section id="news" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-red mb-3">Academic Insights</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
            Guidance & Announcements.
          </h2>

          <p className="text-base text-stone-dark leading-relaxed">
            Curated articles on Japanese examination methods, higher education admissions in Japan, and cultural integration for Sri Lankan learners.
          </p>
        </div>

        {/* Articles , feature card + two smaller */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured article , larger */}
          {articlesData.slice(0, 1).map((article) => (
            <article
              key={article.id}
              className="group bg-cream rounded-3xl border border-border-light overflow-hidden shadow-sm hover:shadow-md transition-colors duration-300 flex flex-col lg:row-span-2"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-border-light rounded-t-3xl">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-500 "
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 rounded-full text-xs font-semibold text-navy">
                  {article.category}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs text-stone mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {article.date}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h3 className="font-serif-heading text-xl font-semibold text-navy group-hover:text-red transition-colors leading-snug mb-3">
                  {article.title}
                </h3>

                <p className="text-sm text-stone-dark leading-relaxed flex-1">
                  {article.excerpt}
                </p>

                <button
                  type="button"
                  onClick={() => onSelectArticle && onSelectArticle(article)}
                  className="mt-4 self-start inline-flex items-center gap-1.5 text-sm font-semibold text-red hover:underline"
                >
                  Read article
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}

          {/* Two smaller articles */}
          <div className="flex flex-col gap-6">
            {articlesData.slice(1).map((article) => (
              <article
                key={article.id}
                className="group bg-cream rounded-2xl border border-border-light overflow-hidden shadow-sm hover:shadow-md transition-colors duration-300 flex flex-col sm:flex-row"
              >
                <div className="relative sm:w-48 aspect-[16/10] sm:aspect-auto overflow-hidden bg-border-light rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none shrink-0">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 200px"
                    className="object-cover object-center transition-transform duration-500 "
                  />
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs font-semibold text-red mb-1">{article.category}</span>
                  <div className="flex items-center gap-2 text-xs text-stone mb-2">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-navy group-hover:text-red transition-colors leading-snug mb-2">
                    {article.title}
                  </h3>
                  <p className="text-xs text-stone-dark leading-relaxed line-clamp-2 flex-1">
                    {article.excerpt}
                  </p>
                  <button
                    type="button"
                    onClick={() => onSelectArticle && onSelectArticle(article)}
                    className="mt-3 self-start inline-flex items-center gap-1 text-xs font-semibold text-red hover:underline"
                  >
                    Read article
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
