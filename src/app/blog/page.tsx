import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import { BLOG_POSTS } from "@/data/blog-posts";
import { SITE_URL } from "@/lib/seo";
import { JsonLd, getBreadcrumbSchema } from "@/lib/schema";
import { BookOpen, Calendar, Clock, ArrowRight, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Japanese Learning & Study in Japan Blog | Tomoni Japanese Language Center",
  description:
    "Expert articles on learning Japanese in Sri Lanka, JLPT examination guides (N5, N4, N3), JFT-Basic tips, study in Japan student visa guides, and career opportunities.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Japanese Learning & Study in Japan Blog | Tomoni Japanese Language Center",
    description:
      "Expert articles on learning Japanese in Sri Lanka, JLPT preparation, and study in Japan guides for Sri Lankan students.",
    url: `${SITE_URL}/blog`,
    type: "website",
    images: [{ url: "/assets/hero.jpg", width: 1200, height: 630, alt: "Tomoni Japanese Center Blog" }],
  },
};

export default function BlogIndexPage() {
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-muted/40 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-4">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Educational Resources & Study Guides</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto">
              Japanese Learning & Japan Pathway Blog
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base text-muted-foreground leading-relaxed">
              In-depth guides, JLPT exam strategies, and practical advice written specifically for Sri Lankan students preparing to study, work, and thrive in Japan.
            </p>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.map((post) => (
                <article
                  key={post.slug}
                  className="group flex flex-col rounded-3xl border border-border bg-card overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:border-primary/40"
                >
                  <Link href={`/blog/${post.slug}`} className="relative h-48 w-full overflow-hidden bg-muted">
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 rounded-full bg-background/90 backdrop-blur-xs px-3 py-1 text-[11px] font-semibold text-primary shadow-xs">
                      {post.category}
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mb-3">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-primary" />
                          {post.publishedDate}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-primary" />
                          {post.readTime}
                        </span>
                      </div>

                      <h2 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>

                      <p className="mt-3 text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3 text-primary" />
                        {post.author}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Read Guide</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Ready CTA */}
        <ReadyCtaBanner />
      </main>

      <Footer />
    </div>
  );
}
