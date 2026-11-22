import React from "react";
import { BookOpen, Compass, GraduationCap, MessageCircle } from "lucide-react";

export default function FeatureStrip() {
  const pillars = [
    {
      title: "School Syllabus Excellence",
      description: "Dedicated preparation for Sri Lankan G.C.E. O/L & A/L examinations with in-depth past paper analysis.",
      icon: BookOpen,
      href: "#courses",
    },
    {
      title: "Direct Pathways to Japan",
      description: "Complete guidance for university admissions, vocational colleges, COE documentation, and student visas.",
      icon: Compass,
      href: "#study-in-japan",
    },
    {
      title: "Experienced Educators",
      description: "Learn with educators fluent in both Japanese linguistic nuance and Sri Lankan student needs.",
      icon: GraduationCap,
      href: "#about",
    },
    {
      title: "Communicative Fluency",
      description: "Interactive classroom dialogues, listening drills, and practical Japanese etiquette for everyday confidence.",
      icon: MessageCircle,
      href: "#courses",
    },
  ];

  return (
    <section className="bg-white py-10 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <a
                key={pillar.title}
                href={pillar.href}
                className="group p-5 rounded-2xl hover:bg-cream transition-colors duration-300"
              >
                <Icon aria-hidden="true" className="mb-4 h-5 w-5 text-red" strokeWidth={1.7} />
                <h3 className="text-sm font-semibold text-navy group-hover:text-red transition-colors mb-1.5">
                  {pillar.title}
                </h3>

                <p className="text-xs text-stone leading-relaxed">
                  {pillar.description}
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
