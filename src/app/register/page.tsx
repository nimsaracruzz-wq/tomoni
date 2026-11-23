import type { Metadata } from "next";
import RegisterPageClient from "./RegisterPageClient";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Online Student Registration | Tomoni Japanese Language Center",
  description:
    "Register online for Japanese language classes in Sri Lanka. Enroll in JLPT N5, N4, N3, JFT-Basic, School O/L & A/L, or the Study in Japan Visa Pathway at Tomoni.",
  alternates: {
    canonical: `${SITE_URL}/register`,
  },
  openGraph: {
    title: "Online Student Registration | Tomoni Japanese Language Center",
    description:
      "Register online for Japanese language classes and Japan visa programs at Tomoni in Kuliyapitiya.",
    url: `${SITE_URL}/register`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "Register at Tomoni Japanese Center" }],
  },
};

export default function RegisterPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Online Registration", url: "/register" },
  ];

  return (
    <>
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <RegisterPageClient />
    </>
  );
}
