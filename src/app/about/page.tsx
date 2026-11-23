import type { Metadata } from "next";
import AboutPageClient from "./AboutPageClient";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Us | Leading Japanese Language Center in Sri Lanka | Tomoni",
  description:
    "Learn about Tomoni Japanese Language Center in Kuliyapitiya, Sri Lanka. Our mission, expert faculty, high COE acceptance rates, and dedicated support for studying and working in Japan.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About Us | Leading Japanese Language Center in Sri Lanka | Tomoni",
    description:
      "Learn about Tomoni Japanese Language Center: mission, faculty, ethical visa processing, and student success stories.",
    url: `${SITE_URL}/about`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "About Tomoni Japanese Center" }],
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <AboutPageClient />
    </>
  );
}
