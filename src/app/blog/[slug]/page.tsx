import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllPostSlugs,
  getPostBySlug,
  getPostContent,
  getRelatedPosts,
} from "@/lib/blog";
import { BlogPost } from "@/components/blog/BlogPost";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { NewsletterCTA } from "@/components/blog/NewsletterCTA";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

// Generate static paths for all posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each post
export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.image
        ? [
            {
              url: post.image,
              width: 1200,
              height: 630,
              alt: post.imageAlt || post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.image ? [post.image] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = getPostContent(slug);
  const relatedPosts = getRelatedPosts(slug, 3);

  return (
    <main className="min-h-screen bg-background">
      {/* Main post content */}
      <BlogPost post={post} content={content} />

      {/* Newsletter CTA */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <NewsletterCTA
            title="Enjoyed this article?"
            description="Get more co-ownership tips and guides delivered straight to your inbox."
          />
        </div>
      </section>

      {/* Related posts */}
      <RelatedPosts posts={relatedPosts} />
    </main>
  );
}
