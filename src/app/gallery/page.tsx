import type { Metadata } from "next";
import GalleryPageClient from "./GalleryPageClient";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Student Gallery & Campus Life | Tomoni Japanese Language Center",
  description:
    "Explore photos and moments from Tomoni Japanese Language Center in Kuliyapitiya: classroom learning, cultural workshops, JLPT exam successes, and students departing for Japan.",
  alternates: {
    canonical: `${SITE_URL}/gallery`,
  },
  openGraph: {
    title: "Student Gallery & Campus Life | Tomoni Japanese Language Center",
    description:
      "A look inside our classrooms, cultural workshops, and student journeys to Japan.",
    url: `${SITE_URL}/gallery`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "Tomoni Gallery" }],
  },
};

export default function GalleryPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Gallery", url: "/gallery" },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <GalleryPageClient />
    </>
  );
}
