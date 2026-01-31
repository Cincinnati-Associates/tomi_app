// Blog post type definitions and content registry
// Add new posts to the `posts` array below - content lives in /posts/*.md

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO date format: YYYY-MM-DD
  updatedAt?: string;
  author: string;
  authorImage?: string;
  tags: string[];
  image: string; // Path relative to /public, e.g., "/blog/my-image.jpg"
  imageAlt?: string;
  readingTime: number; // Estimated minutes to read
  featured?: boolean;
  draft?: boolean; // Set to true to hide from production
}

// ============================================================================
// BLOG POST REGISTRY
// Add new posts here. The slug must match the filename in /posts/ (without .md)
// Posts are automatically sorted by publishedAt date (newest first)
// ============================================================================

export const posts: BlogPost[] = [
  {
    slug: "tic-vs-joint-tenancy",
    title: "Tenants in Common vs. Joint Tenancy: The 5-Minute Guide",
    excerpt:
      "Learn the key differences between TIC and Joint Tenancy ownership structures, and discover which one is right for your co-buying situation.",
    publishedAt: "2025-02-01",
    author: "Tomi Team",
    tags: ["legal", "tic", "ownership", "getting-started"],
    image: "/blog/tic-vs-joint-tenancy.jpg",
    imageAlt: "Two people reviewing property documents together",
    readingTime: 5,
    featured: true,
  },
  {
    slug: "what-if-we-break-up",
    title: "The 'What If We Break Up' Clause: How to Write a TIC Agreement",
    excerpt:
      "The conversation nobody wants to have, but everyone needs to plan for. Here's how to protect yourself and your co-owners with a solid exit strategy.",
    publishedAt: "2025-02-03",
    author: "Tomi Team",
    tags: ["legal", "tic", "agreements", "exit-strategy"],
    image: "/blog/what-if-we-break-up.jpg",
    imageAlt: "Friends having a serious conversation at a table",
    readingTime: 7,
    featured: true,
  },
  {
    slug: "zero-upfront-tomi-model",
    title: "How to Buy a Home with $0 Upfront Fees (The Tomi Model)",
    excerpt:
      "Traditional real estate is full of hidden fees. We believe you shouldn't pay until you succeed. Here's how our aligned-incentive model works.",
    publishedAt: "2025-02-05",
    author: "Tomi Team",
    tags: ["tomi", "fees", "how-it-works", "getting-started"],
    image: "/blog/zero-upfront-tomi-model.jpg",
    imageAlt: "Happy group of co-owners in front of their new home",
    readingTime: 4,
    featured: true,
  },
];

// ============================================================================
// HELPER: Get all unique tags from posts
// ============================================================================

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  posts.forEach((post) => {
    post.tags.forEach((tag) => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}
