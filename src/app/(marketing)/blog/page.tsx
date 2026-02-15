import { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, getFeaturedPosts, getAllTags } from "@/lib/blog";
import { BlogCard } from "@/components/blog/BlogCard";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";

export const metadata: Metadata = {
  title: "Blog | Co-Ownership Guides & Tips",
  description:
    "Learn everything about co-buying a home with friends and family. Expert guides on TIC agreements, legal considerations, and making shared homeownership work.",
  openGraph: {
    title: "Tomi Blog | Co-Ownership Guides & Tips",
    description:
      "Learn everything about co-buying a home with friends and family. Expert guides on TIC agreements, legal considerations, and making shared homeownership work.",
    type: "website",
  },
};

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const selectedTag = params.tag;
  const allPosts = getAllPosts();
  const allTags = getAllTags();

  // Filter posts by tag if selected
  const filteredPosts = selectedTag
    ? allPosts.filter((post) =>
        post.tags.map((t) => t.toLowerCase()).includes(selectedTag.toLowerCase())
      )
    : allPosts;

  // Get featured posts (only show on main blog page, not filtered)
  const featuredPosts = !selectedTag ? getFeaturedPosts(1) : [];
  const remainingPosts = !selectedTag
    ? filteredPosts.filter((p) => !featuredPosts.some((fp) => fp.slug === p.slug))
    : filteredPosts;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="border-b border-border bg-secondary/30 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            The Co-Buy Academy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to know about buying a home with friends and
            family. Legal guides, financial tips, and real success stories.
          </p>
        </div>
      </section>

      {/* Tag filter */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <Link
              href="/blog"
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                !selectedTag
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                No posts found{selectedTag && ` for "${selectedTag}"`}.
              </p>
              <Link
                href="/blog"
                className="mt-4 inline-block text-primary hover:underline"
              >
                View all posts
              </Link>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Featured post (large card) */}
              {featuredPosts.length > 0 && (
                <div>
                  <BlogCard post={featuredPosts[0]} featured index={0} />
                </div>
              )}

              {/* Remaining posts grid */}
              {remainingPosts.length > 0 && (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {remainingPosts.map((post, index) => (
                    <BlogCard
                      key={post.slug}
                      post={post}
                      index={index + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <NewsletterCTA />
        </div>
      </section>
    </main>
  );
}
