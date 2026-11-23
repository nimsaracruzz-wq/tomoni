import type { Metadata } from "next";
import ContactPageClient from "./ContactPageClient";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact Us | Japanese Language Center in Kuliyapitiya | Tomoni",
  description:
    "Contact Tomoni Japanese Language Center in Kuliyapitiya, Sri Lanka. Inquire about JLPT courses, intake dates, student visa guidance, or reach our Japan direct line.",
  alternates: {
    canonical: `${SITE_URL}/contact`,
  },
  openGraph: {
    title: "Contact Us | Japanese Language Center in Kuliyapitiya | Tomoni",
    description:
      "Get in touch with Tomoni Japanese Language Center. Kuliyapitiya campus & Japan direct line.",
    url: `${SITE_URL}/contact`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "Contact Tomoni Japanese Center" }],
  },
};

export default function ContactPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Contact Us", url: "/contact" },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <ContactPageClient />
    </>
  );
}
