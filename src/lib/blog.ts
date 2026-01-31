import fs from "fs";
import path from "path";
import { posts, BlogPost, getAllTags } from "@/content/blog";

const POSTS_DIR = path.join(process.cwd(), "src/content/blog/posts");

/**
 * Get all published blog posts, sorted by date (newest first)
 */
export function getAllPosts(): BlogPost[] {
  return posts
    .filter((p) => !p.draft)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

/**
 * Get a single post by its slug
 */
export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug && !p.draft);
}

/**
 * Get the markdown content for a post
 */
export function getPostContent(slug: string): string {
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    console.error(`Blog post content not found: ${slug}.md`);
    return "";
  }
}

/**
 * Get featured posts for homepage or sidebar
 */
export function getFeaturedPosts(limit?: number): BlogPost[] {
  const featured = getAllPosts().filter((p) => p.featured);
  return limit ? featured.slice(0, limit) : featured;
}

/**
 * Get posts filtered by tag
 */
export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((p) =>
    p.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

/**
 * Get related posts (same tags, excluding current post)
 */
export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const currentPost = getPostBySlug(currentSlug);
  if (!currentPost) return [];

  const otherPosts = getAllPosts().filter((p) => p.slug !== currentSlug);

  // Score posts by number of shared tags
  const scored = otherPosts.map((post) => {
    const sharedTags = post.tags.filter((tag) =>
      currentPost.tags.includes(tag)
    ).length;
    return { post, score: sharedTags };
  });

  // Sort by score (most shared tags first), then by date
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (
      new Date(b.post.publishedAt).getTime() -
      new Date(a.post.publishedAt).getTime()
    );
  });

  return scored.slice(0, limit).map((s) => s.post);
}

/**
 * Get all post slugs for static generation
 */
export function getAllPostSlugs(): string[] {
  return getAllPosts().map((p) => p.slug);
}

/**
 * Get posts for a specific page (pagination)
 */
export function getPaginatedPosts(
  page: number,
  perPage = 10
): { posts: BlogPost[]; totalPages: number; currentPage: number } {
  const allPosts = getAllPosts();
  const totalPages = Math.ceil(allPosts.length / perPage);
  const start = (page - 1) * perPage;
  const paginatedPosts = allPosts.slice(start, start + perPage);

  return {
    posts: paginatedPosts,
    totalPages,
    currentPage: page,
  };
}

// Re-export for convenience
export { getAllTags };
export type { BlogPost };
