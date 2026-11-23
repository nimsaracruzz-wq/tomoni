import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { SITE_URL, DEFAULT_SEO_KEYWORDS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Japanese Language Classes in Sri Lanka | Tomoni Japanese Language Center",
  description:
    "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. Explore Japanese language courses, JLPT preparation (N5, N4, N3), JFT-Basic, and opportunities to study and work in Japan.",
  keywords: DEFAULT_SEO_KEYWORDS,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Japanese Language Classes in Sri Lanka | Tomoni Japanese Language Center",
    description:
      "Learn Japanese in Sri Lanka with Tomoni Japanese Language Center. Explore Japanese language courses, JLPT preparation, and opportunities to study and work in Japan.",
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/assets/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Tomoni Japanese Language Center in Sri Lanka - Japanese Classes & Visa Pathways",
      },
    ],
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
