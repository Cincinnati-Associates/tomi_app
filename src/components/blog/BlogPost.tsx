"use client";

import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Twitter, Linkedin, Link2 } from "lucide-react";
import { BlogPost as BlogPostType } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BlogPostProps {
  post: BlogPostType;
  content: string;
}

export function BlogPost({ post, content }: BlogPostProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${post.title} - Tomi`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="min-h-screen">
      {/* Hero section */}
      <div className="relative bg-secondary/30">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 flex flex-wrap gap-2"
          >
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              >
                {tag}
              </Link>
            ))}
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl"
          >
            {post.title}
          </motion.h1>

          {/* Meta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>
            <span>By {post.author}</span>
          </motion.div>

          {/* Share buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="mt-6 flex items-center gap-2"
          >
            <span className="text-sm text-muted-foreground">Share:</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
                  "_blank"
                )
              }
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                window.open(
                  `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
                  "_blank"
                )
              }
            >
              <Linkedin className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={copyLink}
            >
              {copied ? (
                <span className="text-xs text-primary">Copied!</span>
              ) : (
                <Link2 className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Featured image */}
      {post.image && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8"
        >
          <div className="relative -mt-4 aspect-[2/1] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={post.image}
              alt={post.imageAlt || post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8"
      >
        <div className="prose prose-tomi">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="mt-10 mb-4 font-heading text-3xl font-bold text-foreground">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="mt-10 mb-4 font-heading text-2xl font-bold text-foreground">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mt-8 mb-3 font-heading text-xl font-semibold text-foreground">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 text-base leading-relaxed text-foreground/90">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 ml-6 list-disc space-y-2 text-foreground/90">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 ml-6 list-decimal space-y-2 text-foreground/90">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-4 border-primary pl-6 italic text-muted-foreground">
                  {children}
                </blockquote>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-primary underline decoration-primary/30 underline-offset-2 transition-colors hover:decoration-primary"
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-foreground">{children}</strong>
              ),
              code: ({ children }) => (
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="my-4 overflow-x-auto rounded-lg bg-muted p-4">
                  {children}
                </pre>
              ),
              hr: () => <hr className="my-8 border-border" />,
              img: ({ src, alt }) => (
                <span className="my-6 block">
                  <Image
                    src={src || ""}
                    alt={alt || ""}
                    width={800}
                    height={450}
                    className="rounded-lg"
                  />
                  {alt && (
                    <span className="mt-2 block text-center text-sm text-muted-foreground">
                      {alt}
                    </span>
                  )}
                </span>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </motion.div>
    </article>
  );
}
