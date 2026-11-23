import { BLOG_POSTS, BlogPost } from "@/data/blog-posts";

export interface DBBlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  read_time: string;
  featured_image: string;
  author: string;
  meta_title: string;
  meta_description: string;
  keywords: string;
  canonical_url: string;
  is_published: number;
  published_at: string;
  updated_at: string;
}

export async function getPublicBlogPosts(): Promise<BlogPost[]> {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3005";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${backendUrl}/api/public/blogs`, {
      signal: controller.signal,
      next: { revalidate: 30 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.posts) && data.posts.length > 0) {
        return data.posts.map((p: DBBlogPost) => ({
          slug: p.slug,
          title: p.title,
          metaTitle: p.meta_title || p.title,
          metaDescription: p.meta_description || p.summary,
          category: p.category || "General",
          readTime: p.read_time || "5 min read",
          publishedDate: p.published_at ? p.published_at.slice(0, 10) : "2025-01-01",
          updatedDate: p.updated_at ? p.updated_at.slice(0, 10) : "2025-01-01",
          author: p.author || "Tomoni Academic Faculty",
          featuredImage: p.featured_image || "/assets/hero.jpg",
          summary: p.summary,
          toc: [],
          content: typeof p.content === "string" ? p.content.split("\n\n").filter(Boolean) : [],
        }));
      }
    }
  } catch {
    // Use static seed fallback
  }
  return BLOG_POSTS;
}

export async function getPublicBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:3005";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${backendUrl}/api/public/blogs/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
      next: { revalidate: 30 },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.post) {
        const p: DBBlogPost = data.post;
        const paragraphs =
          typeof p.content === "string" ? p.content.split("\n\n").filter(Boolean) : [];
        return {
          slug: p.slug,
          title: p.title,
          metaTitle: p.meta_title || p.title,
          metaDescription: p.meta_description || p.summary,
          category: p.category || "General",
          readTime: p.read_time || "5 min read",
          publishedDate: p.published_at ? p.published_at.slice(0, 10) : "2025-01-01",
          updatedDate: p.updated_at ? p.updated_at.slice(0, 10) : "2025-01-01",
          author: p.author || "Tomoni Academic Faculty",
          featuredImage: p.featured_image || "/assets/hero.jpg",
          summary: p.summary,
          toc: [],
          content: paragraphs,
        };
      }
    }
  } catch {
    // Use static seed fallback
  }
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}
