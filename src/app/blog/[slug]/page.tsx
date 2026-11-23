import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReadyCtaBanner from "@/components/ReadyCtaBanner";
import { BLOG_POSTS, BlogPost } from "@/data/blog-posts";
import { COURSE_CATALOG } from "@/data/courses-data";
import { getPublicBlogPosts, getPublicBlogPostBySlug } from "@/lib/blogs";
import { SITE_URL, SITE_NAME } from "@/lib/seo";
import { JsonLd, getArticleSchema, getBreadcrumbSchema } from "@/lib/schema";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Share2,
  CheckCircle2,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getPublicBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/blog/${post.slug}`,
    },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: `${SITE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedDate,
      authors: [post.author],
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.metaTitle,
      description: post.metaDescription,
      images: [post.featuredImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublicBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPublicBlogPosts();
  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ];

  const relatedCourse = post.relatedCourseSlug ? COURSE_CATALOG[post.relatedCourseSlug] : null;
  const otherPosts = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <JsonLd
        data={getArticleSchema({
          title: post.title,
          description: post.metaDescription,
          slug: post.slug,
          datePublished: post.publishedDate,
          dateModified: post.updatedDate,
          authorName: post.author,
          imageUrl: `${SITE_URL}${post.featuredImage}`,
        })}
      />
      <JsonLd data={getBreadcrumbSchema(breadcrumbs)} />
      <Header />

      <main className="flex-1 py-10 sm:py-16">
        <article className="mx-auto max-w-4xl px-5">
          {/* Back link & breadcrumb */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to all guides</span>
            </Link>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
              {post.category}
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl font-bold leading-tight text-foreground">
            {post.title}
          </h1>

          {/* Metadata bar */}
          <div className="mt-6 flex flex-wrap items-center gap-5 border-y border-border py-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <User className="h-3.5 w-3.5 text-primary" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Published: {post.publishedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {post.readTime}
            </span>
          </div>

          {/* Featured Image */}
          <div className="relative mt-8 h-64 sm:h-96 w-full overflow-hidden rounded-3xl bg-muted border border-border shadow-xs">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          {/* Lead paragraph */}
          <div className="mt-8 rounded-2xl bg-muted/40 p-6 border border-border text-sm sm:text-base leading-relaxed text-foreground font-medium">
            {post.summary}
          </div>

          {/* Table of contents */}
          {post.toc && post.toc.length > 0 && (
            <div className="mt-8 rounded-2xl border border-border p-6 bg-card">
              <h2 className="font-serif text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <span>Table of Contents</span>
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm">
                {post.toc.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary font-semibold">{idx + 1}.</span>
                    <a href={`#${item.id}`} className="text-foreground/80 hover:text-primary transition-colors">
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Article Body */}
          <div className="mt-10 space-y-6 text-sm sm:text-base leading-relaxed text-foreground/90">
            {post.content.map((paragraph, index) => {
              const matchingSection = post.toc && post.toc[index];
              return (
                <div key={index} className="space-y-3">
                  {matchingSection && (
                    <h2
                      id={matchingSection.id}
                      className="font-serif text-2xl font-bold text-foreground pt-4 scroll-mt-24 border-t border-border/60"
                    >
                      {matchingSection.text}
                    </h2>
                  )}
                  <p className="leading-relaxed">{paragraph}</p>
                </div>
              );
            })}
          </div>

          {/* Related Course Callout Banner */}
          {relatedCourse && (
            <div className="mt-12 rounded-3xl bg-primary/10 border border-primary/20 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Recommended Course for You
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {relatedCourse.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 max-w-lg">
                  {relatedCourse.summary}
                </p>
              </div>
              <Link
                href={`/courses/${relatedCourse.slug}`}
                className="shrink-0 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs font-semibold text-primary-foreground shadow hover:opacity-95 transition-opacity"
              >
                <span>View Course Details</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* Internal links to related articles */}
          <div className="mt-16 pt-10 border-t border-border">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-6">
              Related Japanese Guides
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {otherPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="group rounded-2xl border border-border p-4 bg-card hover:border-primary/50 transition-all shadow-xs"
                >
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                    {related.category}
                  </p>
                  <h4 className="font-serif text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-1 line-clamp-2">
                    {related.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {related.readTime}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
