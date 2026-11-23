import { BLOG_POSTS, BlogPost } from "@/data/blog-posts";
import fs from "node:fs";
import path from "node:path";

export function getPublicBlogPosts(): BlogPost[] {
  try {
    const dbPath = process.env.DB_PATH || path.join(process.cwd(), "data", "tomoni.sqlite");
    if (fs.existsSync(dbPath)) {
      // Dynamic require so bundlers without native sqlite bindings don't choke during build
      const { DatabaseSync } = require("node:sqlite");
      const db = new DatabaseSync(dbPath, { readOnly: true });
      const rows = db
        .prepare("SELECT * FROM blog_posts WHERE is_published=1 ORDER BY published_at DESC")
        .all();
      db.close();
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((p: any) => ({
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
    // Fallback to static seed
  }
  return BLOG_POSTS;
}

export function getPublicBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getPublicBlogPosts();
  return posts.find((p) => p.slug === slug) || null;
}
