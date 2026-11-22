import React from "react";
import Image from "next/image";

const galleryItems = [
  {
    title: "Dedicated Language Classrooms in Kuliyapitiya",
    caption: "Equipped with interactive audio-visual resources and quiet study spaces.",
    image: "/images/tomoni-classroom.jpg",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Living and Studying Across Japan",
    caption: "Academic immersion in Tokyo and regional university cities.",
    image: "/images/student-life-japan.jpg",
    className: "",
  },
  {
    title: "Supportive Faculty Guidance",
    caption: "Individual pronunciation correction and exam paper counseling.",
    image: "/images/tomoni-instructor.jpg",
    className: "",
  },
  {
    title: "Cultural Context & Traditions",
    caption: "Appreciating seasonal customs, etiquette, and social values.",
    image: "/images/news-japanese-culture.jpg",
    className: "",
  },
  {
    title: "The Architecture of Japan",
    caption: "Experiencing centuries-old heritage alongside modern innovation.",
    image: "/images/study-in-japan.jpg",
    className: "",
  },
];

export default function GallerySection() {
  return (
    <section id="gallery" className="bg-cream py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-medium text-red mb-3">Campus & Life</p>

          <h2 className="font-serif-heading text-3xl sm:text-4xl font-medium tracking-tight text-navy mb-4">
            A Glimpse into the Tomoni Environment.
          </h2>

          <p className="text-base text-stone-dark leading-relaxed">
            Explore our Kuliyapitiya learning spaces, dedicated classroom instruction, and the educational environment awaiting students in Japan.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-[230px]">
          {galleryItems.map((item) => (
            <figure
              key={item.title}
              className={`group relative overflow-hidden rounded-2xl bg-border-light ${item.className}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover object-center transition-transform duration-700 "
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-navy/15 to-transparent" />

              <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="font-serif-heading text-base sm:text-lg font-medium leading-snug text-white/95">
                  {item.title}
                </p>
                <p className="text-xs text-white/70 mt-1 line-clamp-1">
                  {item.caption}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

      </div>
    </section>
  );
}
