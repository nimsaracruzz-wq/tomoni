"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type GalleryImage = { id: string; image_data: string; alt_text: string };

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  useEffect(() => {
    fetch("/api/public/gallery")
      .then((response) => response.json())
      .then((data) => setImages(Array.isArray(data.images) ? data.images : []))
      .catch(() => setImages([]));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="border-b border-border bg-muted/45">
          <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
            <p className="text-sm font-semibold text-primary">Tomoni moments</p>
            <h1 className="mt-3 max-w-2xl font-serif text-4xl leading-tight sm:text-6xl">Our gallery</h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              A look inside our classrooms, learning community, and the milestones our students share.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-10 sm:py-16">
          {images.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {images.map((image, index) => (
                <figure
                  key={image.id}
                  className={`group relative overflow-hidden rounded-2xl bg-muted shadow-sm ${index % 5 === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-[4/5]"}`}
                >
                  <Image
                    src={image.image_data}
                    alt={image.alt_text || "Tomoni Institute gallery photo"}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out "
                  />
                  {image.alt_text && (
                    <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10 text-xs text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {image.alt_text}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-muted/40 px-6 py-20 text-center">
              <h2 className="font-serif text-2xl">Photos are coming soon</h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">Our team is preparing a look at life and learning at Tomoni.</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
