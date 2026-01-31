#!/usr/bin/env node

/**
 * Blog Post Generator Script
 *
 * Usage:
 *   npm run blog:new
 *   node scripts/new-blog-post.mjs
 *
 * This script interactively creates a new blog post with:
 * - A markdown file in src/content/blog/posts/
 * - An entry in the posts registry (src/content/blog/index.ts)
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, "..");

const POSTS_DIR = path.join(ROOT, "src/content/blog/posts");
const REGISTRY_PATH = path.join(ROOT, "src/content/blog/index.ts");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) =>
  new Promise((resolve) => rl.question(prompt, resolve));

// Convert title to slug
function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Calculate reading time (rough estimate: 200 words per minute)
function estimateReadingTime(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Get today's date in ISO format
function getToday() {
  return new Date().toISOString().split("T")[0];
}

// Available tags (you can extend this list)
const SUGGESTED_TAGS = [
  "getting-started",
  "legal",
  "tic",
  "ownership",
  "agreements",
  "exit-strategy",
  "tomi",
  "fees",
  "how-it-works",
  "financing",
  "mortgage",
  "relationships",
  "tips",
  "success-stories",
];

async function main() {
  console.log("\n🏠 Tomi Blog Post Generator\n");
  console.log("This script will help you create a new blog post.\n");

  // Get title
  const title = await question("📝 Post title: ");
  if (!title.trim()) {
    console.log("❌ Title is required. Exiting.");
    rl.close();
    process.exit(1);
  }

  // Generate slug from title (allow override)
  const suggestedSlug = slugify(title);
  const slugInput = await question(`🔗 URL slug (${suggestedSlug}): `);
  const slug = slugInput.trim() || suggestedSlug;

  // Check if slug already exists
  const mdPath = path.join(POSTS_DIR, `${slug}.md`);
  if (fs.existsSync(mdPath)) {
    console.log(`❌ A post with slug "${slug}" already exists. Exiting.`);
    rl.close();
    process.exit(1);
  }

  // Get excerpt
  const excerpt = await question("📄 Short excerpt/description (1-2 sentences): ");

  // Get tags
  console.log(`\n🏷️  Available tags: ${SUGGESTED_TAGS.join(", ")}`);
  const tagsInput = await question("Tags (comma-separated): ");
  const tags = tagsInput
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  // Get author
  const authorInput = await question("✍️  Author (Tomi Team): ");
  const author = authorInput.trim() || "Tomi Team";

  // Get image path
  console.log("\n🖼️  Image should be placed in /public/blog/");
  const imageInput = await question(`Image filename (${slug}.jpg): `);
  const imageFilename = imageInput.trim() || `${slug}.jpg`;
  const image = `/blog/${imageFilename}`;

  // Featured?
  const featuredInput = await question("⭐ Featured post? (y/N): ");
  const featured = featuredInput.toLowerCase() === "y";

  // Draft?
  const draftInput = await question("📝 Save as draft? (y/N): ");
  const draft = draftInput.toLowerCase() === "y";

  // Confirm
  console.log("\n--- Preview ---");
  console.log(`Title: ${title}`);
  console.log(`Slug: ${slug}`);
  console.log(`Excerpt: ${excerpt}`);
  console.log(`Tags: ${tags.join(", ")}`);
  console.log(`Author: ${author}`);
  console.log(`Image: ${image}`);
  console.log(`Featured: ${featured}`);
  console.log(`Draft: ${draft}`);
  console.log("---------------\n");

  const confirm = await question("Create this post? (Y/n): ");
  if (confirm.toLowerCase() === "n") {
    console.log("❌ Cancelled.");
    rl.close();
    process.exit(0);
  }

  // Create markdown file
  const mdContent = `# ${title}

Write your introduction here. This paragraph sets up what the reader will learn.

## First Section

Your content goes here. Use markdown formatting:

- Bullet points for lists
- **Bold text** for emphasis
- *Italic text* for softer emphasis

### Subsection

Add more details here.

## Second Section

Continue building your article.

> Use blockquotes for important callouts or quotes from experts.

## Conclusion

Wrap up your key points and include a call to action.

---

**Ready to learn more?** [Talk to Homi](/) or [see how Tomi works](/how-it-works).
`;

  fs.writeFileSync(mdPath, mdContent);
  console.log(`✅ Created: ${mdPath}`);

  // Update registry
  const registryContent = fs.readFileSync(REGISTRY_PATH, "utf-8");

  // Find the posts array and add new entry
  const newEntry = `  {
    slug: "${slug}",
    title: "${title.replace(/"/g, '\\"')}",
    excerpt: "${excerpt.replace(/"/g, '\\"')}",
    publishedAt: "${getToday()}",
    author: "${author}",
    tags: [${tags.map((t) => `"${t}"`).join(", ")}],
    image: "${image}",
    readingTime: 5,${featured ? "\n    featured: true," : ""}${draft ? "\n    draft: true," : ""}
  },`;

  // Insert after the first entry in the posts array
  const insertPoint = registryContent.indexOf("export const posts: BlogPost[] = [") + "export const posts: BlogPost[] = [".length;
  const updatedRegistry =
    registryContent.slice(0, insertPoint) +
    "\n" +
    newEntry +
    registryContent.slice(insertPoint);

  fs.writeFileSync(REGISTRY_PATH, updatedRegistry);
  console.log(`✅ Updated: ${REGISTRY_PATH}`);

  console.log("\n🎉 Blog post created successfully!\n");
  console.log("Next steps:");
  console.log(`1. Edit your post: src/content/blog/posts/${slug}.md`);
  console.log(`2. Add your image: public/blog/${imageFilename}`);
  console.log(`3. Preview at: http://localhost:3000/blog/${slug}`);
  console.log(`4. When ready, remove 'draft: true' from the registry\n`);

  rl.close();
}

main().catch((err) => {
  console.error("Error:", err);
  rl.close();
  process.exit(1);
});
