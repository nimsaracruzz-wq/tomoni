import type { Metadata } from "next";
import CoursesPageClient from "./CoursesPageClient";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Japanese Language Courses in Sri Lanka | JLPT N5, N4, N3 & JFT | Tomoni",
  description:
    "Explore certified Japanese courses in Sri Lanka: JLPT N5/N4/N3, JFT-Basic for SSW working visa, G.C.E. O/L & A/L school classes, and Student Visa pathways at Tomoni.",
  alternates: {
    canonical: `${SITE_URL}/courses`,
  },
  openGraph: {
    title: "Japanese Language Courses in Sri Lanka | JLPT N5, N4, N3 & JFT | Tomoni",
    description:
      "Explore comprehensive Japanese courses in Sri Lanka: JLPT N5/N4/N3, JFT-Basic, School O/L & A/L, and Study in Japan Visa pathways.",
    url: `${SITE_URL}/courses`,
    type: "website",
    images: [{ url: "/assets/classroom.jpg", width: 1200, height: 800, alt: "Japanese Courses at Tomoni" }],
  },
};

export default function CoursesPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Courses", url: "/courses" },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <CoursesPageClient />
    </>
  );
}
