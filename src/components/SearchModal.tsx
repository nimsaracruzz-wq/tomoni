"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, BookOpen, Compass, HelpCircle, Newspaper } from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApply: () => void;
}

export default function SearchModal({ isOpen, onClose, onOpenApply }: SearchModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: "Japanese Visa + Class , Study in Japan Track", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "General Class , Practical Japanese for Adults", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "JFT Class , Japan Foundation Test / SSW Worker Pathway", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "O/L Class , Sri Lankan Ordinary Level Support", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "A/L Class , Sri Lankan Advanced Level Support", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "Kids Class , Japanese for Young Learners", category: "Courses", href: "#courses", icon: BookOpen },
    { title: "COE & Japanese Immigration Advisory", category: "Study in Japan", href: "#study-in-japan", icon: Compass },
    { title: "University & Vocational College Matching", category: "Study in Japan", href: "#study-in-japan", icon: Compass },
    { title: "Student Pathway from Colombo to Tokyo", category: "Pathway", href: "#pathway", icon: Compass },
    { title: "What documents are required to apply?", category: "FAQ", href: "#faq", icon: HelpCircle },
    { title: "Essential Strategies for Mastering Kanji & Grammar", category: "Guides", href: "#news", icon: Newspaper },
  ];

  const filtered = query
    ? quickLinks.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy/80 transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-start justify-center p-4 pt-20">
        <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-lg border border-border-light overflow-hidden z-10 animate-fade-in">
          
          {/* Search Input Bar */}
          <div className="p-4 sm:p-5 border-b border-border-light flex items-center gap-3 bg-cream">
            <Search className="w-5 h-5 text-red shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, study in Japan, syllabi, or FAQ..."
              className="w-full bg-transparent text-sm text-navy placeholder-stone focus:outline-none"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-stone hover:text-navy p-1.5 rounded-full hover:bg-cream-warm transition-colors"
                aria-label="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-2.5 py-1 bg-border-light text-stone-dark hover:text-navy rounded-full font-sans ml-1"
            >
              ESC
            </button>
          </div>

          {/* Search Results List */}
          <div className="max-h-96 overflow-y-auto p-3 sm:p-4 space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-semibold text-stone ">
              {query ? `Search Results (${filtered.length})` : "Quick Navigation & Syllabi"}
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-dark">
                No matching topics found for “{query}”. Try searching for &quot;O/L&quot;, &quot;Visa&quot;, or &quot;COE&quot;.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-3 rounded-2xl hover:bg-cream transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-cream border border-border-light flex items-center justify-center text-stone-dark group-hover:bg-red-soft group-hover:border-red-border group-hover:text-red transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-navy group-hover:text-red transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-stone">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone group-hover:text-red transition-colors" />
                  </a>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-cream border-t border-border-light flex items-center justify-between text-xs text-stone-dark">
            <span>Need personalized course guidance?</span>
            <Link
              href="/register"
              onClick={onClose}
              className="text-red font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>Apply Online</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}