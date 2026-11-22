"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "What Japanese language programs are available at Tomoni in Sri Lanka?",
      a: "We offer five specialized educational tracks: Japanese Visa + Class (comprehensive preparation for students going to Japan), O/L Class (Sri Lankan G.C.E. Ordinary Level syllabus), A/L Class (Sri Lankan G.C.E. Advanced Level syllabus), General Class (practical conversational Japanese for adults and professionals), and Kids Class (foundational Japanese for young learners).",
    },
    {
      q: "How does the institute support Sri Lankan O/L and A/L school students?",
      a: "Our school syllabus classes are strictly aligned with the Sri Lankan Ministry of Education Japanese curriculum. We provide detailed past paper discussions from previous years, model examination papers, grammar rule breakdowns, and prescribed literary text analysis to help students achieve Distinction (A) grades.",
    },
    {
      q: "What support is provided for students who want to study in Japan?",
      a: "Our Study in Japan advisory handles every phase of the transition: language preparation targeting JLPT N5–N4 or NAT-TEST, selection of accredited Japanese universities or vocational colleges (Senmon Gakko), drafting the Japanese Statement of Purpose, submitting documentation for the Certificate of Eligibility (COE) to Japanese Immigration, and conducting embassy mock interviews.",
    },
    {
      q: "Are classes conducted physically in Kuliyapitiya or online?",
      a: "We offer physical cohorts at our Kuliyapitiya institute and interactive online sessions for students across Sri Lanka. Online classes feature live instructor feedback, dialogue practice, and digital study resources.",
    },
    {
      q: "What documents are required to enroll?",
      a: "Standard registration requires a copy of your National Identity Card (NIC) or passport, recent academic records (school term reports or O/L/A/L result sheets), and the completed intake form. Students applying for the Visa Pathway will receive a separate documentation checklist for Japanese Immigration requirements.",
    },
    {
      q: "How are course fees structured?",
      a: "Course fees are established transparently with zero hidden costs, covering textbooks, model examination sheets, and admission advisory. Flexible installment plans are available for Sri Lankan students and families. Specific fee schedules are provided during your initial consultation.",
    },
    {
      q: "How can I contact the institute or visit the Kuliyapitiya center?",
      a: "Submit an inquiry through this website, email tomoniinstitute@gmail.com, call 071 491 9354 or 070 270 7624, or visit No. 355 A 1/1 Hettipola Road, Kuliyapitiya.",
    },
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-cream">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-red mb-3">Frequently Asked Questions</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
            Clear Answers for Students & Parents.
          </h2>

          <p className="text-base text-stone-dark leading-relaxed max-w-xl mx-auto">
            Find details about syllabi, visa pathways, schedules, and joining Tomoni in Sri Lanka.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border bg-white overflow-hidden transition-colors duration-300 ${
                  isOpen ? "border-border shadow-sm" : "border-border-light"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red rounded-2xl hover:bg-cream transition-colors"
                >
                  <span className="font-serif-heading text-base font-semibold text-navy pr-4">
                    {faq.q}
                  </span>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                      isOpen
                        ? "bg-red text-white rotate-180"
                        : "bg-cream text-stone-dark border border-border-light"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-6 pb-6 pt-1 text-sm text-stone-dark leading-relaxed"
                  >
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
