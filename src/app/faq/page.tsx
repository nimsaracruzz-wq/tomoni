import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import FAQAccordion from "@/components/FAQAccordion";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema, getFAQPageSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQ) | Tomoni Japanese Language Center",
  description:
    "Find answers to frequently asked questions about Japanese language classes in Sri Lanka, JLPT N5/N4 prep, course fees, class schedules in Kuliyapitiya, and student visas to Japan.",
  alternates: {
    canonical: `${SITE_URL}/faq`,
  },
  openGraph: {
    title: "Frequently Asked Questions (FAQ) | Tomoni Japanese Language Center",
    description:
      "Find answers to frequently asked questions about learning Japanese in Sri Lanka and our student visa pathways.",
    url: `${SITE_URL}/faq`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "Tomoni Japanese Center FAQs" }],
  },
};

const FAQS_LIST = [
  {
    q: "What Japanese language programs are available at Tomoni in Sri Lanka?",
    a: "We offer specialized educational tracks: Japanese Visa + Class (comprehensive pathway for higher education in Japan), JLPT N5 & N4 preparation, JFT-Basic classes for Specified Skilled Worker (SSW) visas, Sri Lankan G.C.E. O/L and A/L school syllabus classes, General Japanese for adults, and foundational Kids Japanese.",
  },
  {
    q: "Where is Tomoni Japanese Language Center located?",
    a: "Our physical institute is located at No. 355 A 1/1 Hettipola Road, Kuliyapitiya, Sri Lanka. We also offer interactive live online cohorts for students across Sri Lanka and overseas.",
  },
  {
    q: "How does Tomoni support students planning to study in Japan?",
    a: "Our Study in Japan advisory handles every phase: certified language training targeting JLPT N5/N4 or NAT-TEST, direct matching with partner language academies and universities in Japan, drafting the Statement of Purpose (Shiyuusho), Certificate of Eligibility (COE) filing with Japanese Immigration, and mock embassy interview preparation.",
  },
  {
    q: "Are the classes held physically or online?",
    a: "Both! We offer physical classroom cohorts at our Kuliyapitiya campus and live, interactive online sessions with real-time teacher feedback for students unable to attend in person.",
  },
  {
    q: "What is the difference between JLPT and JFT-Basic?",
    a: "The JLPT (Japanese Language Proficiency Test) is held twice a year (July and December) and is the global standard for academic and employment qualification. The JFT-Basic (Japan Foundation Test for Basic Japanese) is computer-based (CBT) and held multiple times throughout the year specifically to qualify workers for the Specified Skilled Worker (SSW) residence status.",
  },
  {
    q: "How can I contact the institute or schedule a consultation?",
    a: "You can submit an online registration through this website, call or WhatsApp our Sri Lanka lines at 071 491 9354 / 070 270 7624, or contact our Japan direct line at +81 90-3841-0745.",
  },
];

export default function FAQPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "FAQ", url: "/faq" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <JsonLd data={getFAQPageSchema(FAQS_LIST)} />
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
              Clear & Honest Answers
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
              Everything you need to know about Japanese courses, JLPT exams, intake dates, and studying or working in Japan from Sri Lanka.
            </p>
          </div>
        </section>

        <div className="py-12">
          <FAQAccordion />
        </div>

        <ReadyCtaBanner />
      </main>

      <Footer />
    </div>
  );
}
