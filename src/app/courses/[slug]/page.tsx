import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import { COURSE_CATALOG, CourseDetail } from "@/data/courses-data";
import { SITE_URL } from "@/lib/seo";
import {
  JsonLd,
  getCourseSchema,
  getBreadcrumbSchema,
  getFAQPageSchema,
} from "@/lib/schema";
import {
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight,
  HelpCircle,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(COURSE_CATALOG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const course = COURSE_CATALOG[slug];
  if (!course) return {};

  return {
    title: course.metaTitle,
    description: course.metaDescription,
    keywords: course.keywords,
    alternates: {
      canonical: `${SITE_URL}/courses/${course.slug}`,
    },
    openGraph: {
      title: course.metaTitle,
      description: course.metaDescription,
      url: `${SITE_URL}/courses/${course.slug}`,
      type: "website",
      images: [
        {
          url: "/assets/hero.jpg",
          width: 1200,
          height: 630,
          alt: `${course.name} - Tomoni Japanese Center`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.metaTitle,
      description: course.metaDescription,
      images: ["/assets/hero.jpg"],
    },
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;
  const course = COURSE_CATALOG[slug];

  if (!course) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Courses", url: "/courses" },
    { name: course.name, url: `/courses/${course.slug}` },
  ];

  const courseSchema = getCourseSchema({
    name: course.name,
    description: course.summary,
    slug: course.slug,
    duration: course.duration,
    educationalLevel: course.levelBadge,
  });

  const otherCourses = Object.values(COURSE_CATALOG).filter((c) => c.slug !== course.slug);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <JsonLd data={courseSchema} />
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      {course.faqs && course.faqs.length > 0 && (
        <JsonLd data={getFAQPageSchema(course.faqs)} />
      )}
      <Header />

      <main className="flex-1">
        {/* Course Header Banner */}
        <section className="border-b border-border bg-muted/40 py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              <Award className="h-3.5 w-3.5" />
              <span>{course.levelBadge}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl">
              {course.name}
            </h1>

            <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              {course.summary}
            </p>

            {/* Quick Specs Pill Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Duration</p>
                  <p className="text-xs font-bold text-foreground">{course.duration}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Schedule</p>
                  <p className="text-xs font-bold text-foreground">{course.schedule}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Learning Mode</p>
                  <p className="text-xs font-bold text-foreground">Physical & Online</p>
                </div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={`/register?course=${course.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-xs font-semibold text-primary-foreground shadow hover:opacity-95 transition-opacity"
              >
                <span>Enroll in this Course</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <span>Ask a Question</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Course Details Sections */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left 2 Cols: Curriculum, Outcomes, FAQs */}
            <div className="lg:col-span-2 space-y-12">
              {/* Target Audience */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                  Who Is This Course For?
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {course.targetAudience}
                </p>
              </div>

              {/* Curriculum */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Curriculum & Syllabus Breakdown
                </h2>
                <div className="space-y-3">
                  {course.curriculum.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-xs"
                    >
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-foreground/90 font-medium">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outcomes */}
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-4">
                  Key Learning Outcomes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {course.outcomes.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl bg-muted/40 border border-border p-4 text-xs font-medium text-foreground flex items-center gap-2.5"
                    >
                      <Sparkles className="h-4 w-4 text-primary shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQs */}
              {course.faqs && course.faqs.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>Frequently Asked Questions</span>
                  </h2>
                  <div className="space-y-4">
                    {course.faqs.map((faq, idx) => (
                      <div key={idx} className="rounded-2xl border border-border bg-card p-5">
                        <h3 className="font-serif text-base font-bold text-foreground">
                          {faq.q}
                        </h3>
                        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Sidebar: Quick Enrollment Card & Other Courses */}
            <div className="space-y-8">
              {/* Enrollment Box */}
              <div className="rounded-3xl border border-border bg-card p-6 shadow-md sticky top-24">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  Ready to Start?
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  Join our upcoming cohort in Kuliyapitiya or online. Limited seats per batch to maintain personalized teacher attention.
                </p>

                <div className="mt-6 space-y-3 text-xs text-foreground/80">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Mode</span>
                    <span className="font-semibold text-foreground">Physical / Online</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Certification</span>
                    <span className="font-semibold text-foreground">JLPT / NAT / JFT</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span>Institute Location</span>
                    <span className="font-semibold text-foreground">Kuliyapitiya, Sri Lanka</span>
                  </div>
                </div>

                <Link
                  href={`/register?course=${course.slug}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground shadow hover:opacity-95 transition-opacity"
                >
                  <span>Register Online Now</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <p className="mt-3 text-center text-[11px] text-muted-foreground">
                  Call or WhatsApp: +94 71 491 9354 / +81 90-3841-0745
                </p>
              </div>

              {/* Other Courses List */}
              <div className="rounded-3xl border border-border bg-card p-6">
                <h3 className="font-serif text-lg font-bold text-foreground mb-4">
                  Explore Other Programs
                </h3>
                <div className="space-y-2">
                  {otherCourses.slice(0, 4).map((other) => (
                    <Link
                      key={other.slug}
                      href={`/courses/${other.slug}`}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-muted transition-colors text-xs"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {other.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ready Banner */}
        <ReadyCtaBanner />
      </main>

      <Footer />
    </div>
  );
}
