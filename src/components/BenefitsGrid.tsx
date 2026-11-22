import React from "react";
import {
  BookOpen,
  MessageCircle,
  FileCheck2,
  GraduationCap,
  MapPin,
  Users2,
} from "lucide-react";
export default function BenefitsGrid() {
  const benefits = [
    {
      title: "Sri Lankan Curriculum Integration",
      description:
        "Structured learning mapped directly to the Sri Lankan G.C.E. O/L and A/L syllabi, providing the exact grammar, literature analysis, and model paper practice needed for top results.",
      icon: BookOpen,
    },
    {
      title: "Authentic Communicative Pedagogy",
      description:
        "Emphasis on conversational fluency from your first week. Students practice authentic dialogues, listening comprehension, and essential Japanese business and social etiquette (Keigo).",
      icon: MessageCircle,
    },
    {
      title: "Immigration & COE Advisory",
      description:
        "Accurate, up-to-date guidance for Japanese student visa requirements, financial sponsorship auditing, and Certificate of Eligibility processing with zero ambiguity.",
      icon: FileCheck2,
    },
    {
      title: "Qualified & Empathetic Educators",
      description:
        "Instruction by certified Japanese linguists and educators who understand the phonetic and grammatical transition from Sinhala and English into Japanese.",
      icon: GraduationCap,
    },
    {
      title: "Kuliyapitiya Institute",
      description:
        "Focused Japanese language classes for JLPT N5/N4, O/L, A/L, Kids, and Student Visa pathways.",
      icon: MapPin,
    },
    {
      title: "Mentorship & Lifelong Community",
      description:
        "True to our name, Tomoni supports each student as an individual , offering one-on-one counseling, study strategy reviews, and alumni networking in Japan.",
      icon: Users2,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Heading */}
        <div className="max-w-3xl mb-14">
          <p className="text-sm font-medium text-red mb-3">Why Students Choose Tomoni</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
            Why Sri Lankan Students Trust Tomoni.
          </h2>

          <p className="text-base text-stone-dark leading-relaxed">
            Our deliberate focus on academic rigor, communicative confidence, and ethical pathway guidance establishes Tomoni as a premier educational partner.
          </p>
        </div>

        {/* Benefits Grid , varied card style to avoid repetition */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            // Alternate between white bg and warm bg for visual rhythm
            const isWarm = idx % 3 === 1;
            return (
              <div
                key={b.title}
                className={`p-7 rounded-2xl border transition-colors duration-300 flex flex-col group ${
                  isWarm
                    ? "bg-surface-warm border-border-light hover:border-border hover:shadow-sm"
                    : "bg-white border-border-light hover:border-border hover:shadow-sm"
                }`}
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-full border border-red-border bg-red-soft text-red">
                  <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="font-serif-heading text-base font-semibold text-navy group-hover:text-red transition-colors mb-2">
                  {b.title}
                </h3>

                <p className="text-sm text-stone-dark leading-relaxed">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
