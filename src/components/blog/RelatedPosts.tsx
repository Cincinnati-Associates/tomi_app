"use client";

import { motion } from "framer-motion";
import { BlogPost } from "@/lib/blog";
import { BlogCard } from "./BlogCard";

interface RelatedPostsProps {
  posts: BlogPost[];
  title?: string;
}

export function RelatedPosts({
  posts,
  title = "Related Articles",
}: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="border-t border-border bg-secondary/20 py-12 md:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-foreground md:text-3xl">
          {title}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
