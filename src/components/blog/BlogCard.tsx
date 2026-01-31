"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/lib/blog";
import { cn } from "@/lib/utils";

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  index?: number;
}

export function BlogCard({ post, featured = false, index = 0 }: BlogCardProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg",
        featured && "md:flex-row"
      )}
    >
      {/* Image */}
      <Link
        href={`/blog/${post.slug}`}
        className={cn(
          "relative block overflow-hidden bg-muted",
          featured
            ? "aspect-[16/9] md:aspect-auto md:w-1/2"
            : "aspect-[16/9]"
        )}
      >
        {post.image ? (
          <Image
            src={post.image}
            alt={post.imageAlt || post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="text-4xl">📝</span>
          </div>
        )}
        {/* Featured badge */}
        {post.featured && (
          <div className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Featured
          </div>
        )}
      </Link>

      {/* Content */}
      <div
        className={cn(
          "flex flex-1 flex-col p-5",
          featured && "md:p-8 md:justify-center"
        )}
      >
        {/* Tags */}
        <div className="mb-3 flex flex-wrap gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              key={tag}
              href={`/blog?tag=${tag}`}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {tag}
            </Link>
          ))}
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3
            className={cn(
              "font-heading font-bold text-foreground transition-colors group-hover:text-primary",
              featured ? "text-xl md:text-2xl lg:text-3xl" : "text-lg"
            )}
          >
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p
          className={cn(
            "mt-2 text-muted-foreground line-clamp-2",
            featured ? "text-base md:text-lg md:line-clamp-3" : "text-sm"
          )}
        >
          {post.excerpt}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.readingTime} min read
          </span>
        </div>

        {/* Read more link */}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          Read more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </motion.article>
  );
}
