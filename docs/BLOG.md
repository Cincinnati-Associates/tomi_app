# Tomi Blog System Documentation

This document explains how to create, manage, and publish blog posts on livetomi.com.

## Quick Start: Adding a New Blog Post

### Option 1: Using the CLI Script (Recommended)

Run the interactive script:

```bash
npm run blog:new
```

The script will prompt you for:
- Post title
- URL slug (auto-generated from title)
- Short excerpt/description
- Tags
- Author name
- Image filename
- Featured/draft status

After completion, it creates:
1. A markdown file at `src/content/blog/posts/[slug].md`
2. An entry in the registry at `src/content/blog/index.ts`

### Option 2: Manual Creation

#### Step 1: Create the Markdown File

Create a new `.md` file in `src/content/blog/posts/`:

```markdown
# Your Post Title

Write your introduction here.

## Section Heading

Your content with **bold**, *italic*, and [links](/).

### Subsection

- Bullet point 1
- Bullet point 2

> Blockquote for callouts

## Conclusion

Wrap up and call to action.

---

**Learn more:** [Talk to Homi](/) or [see how it works](/how-it-works).
```

#### Step 2: Add to the Registry

Open `src/content/blog/index.ts` and add your post to the `posts` array:

```typescript
export const posts: BlogPost[] = [
  {
    slug: "your-post-slug",           // Must match filename (without .md)
    title: "Your Post Title",
    excerpt: "A brief 1-2 sentence summary for previews and SEO.",
    publishedAt: "2025-02-01",        // YYYY-MM-DD format
    author: "Tomi Team",
    tags: ["legal", "getting-started"], // See available tags below
    image: "/blog/your-post-slug.jpg", // Image in /public/blog/
    readingTime: 5,                    // Estimated minutes
    featured: true,                    // Optional: show in featured section
    draft: false,                      // Optional: hide from production
  },
  // ... other posts
];
```

#### Step 3: Add Your Image

Place your featured image in `/public/blog/`:
- Recommended size: 1200x630px (OG image ratio)
- Formats: .jpg, .webp, or .png
- Filename should match your slug

## File Structure

```
src/
├── content/
│   └── blog/
│       ├── index.ts              # Post registry with metadata
│       └── posts/
│           ├── tic-vs-joint-tenancy.md
│           ├── what-if-we-break-up.md
│           └── [your-new-post].md
├── app/
│   └── blog/
│       ├── page.tsx              # Blog index (/blog)
│       └── [slug]/
│           └── page.tsx          # Post page (/blog/[slug])
├── components/
│   └── blog/
│       ├── BlogCard.tsx          # Post preview card
│       ├── BlogPost.tsx          # Full post renderer
│       ├── NewsletterCTA.tsx     # Email capture
│       └── RelatedPosts.tsx      # Related articles section
└── lib/
    └── blog.ts                   # Utility functions
public/
└── blog/
    ├── tic-vs-joint-tenancy.jpg
    └── [your-images].jpg
```

## Markdown Features

### Supported Formatting

| Feature | Syntax | Result |
|---------|--------|--------|
| Headings | `## Heading` | Section headers |
| Bold | `**text**` | **text** |
| Italic | `*text*` | *text* |
| Links | `[text](url)` | Clickable link |
| Blockquotes | `> quote` | Styled callout |
| Bullet lists | `- item` | Bulleted list |
| Numbered lists | `1. item` | Numbered list |
| Code | `` `code` `` | Inline code |
| Code blocks | ``` ```code``` ``` | Code block |
| Tables | `\| col \| col \|` | Formatted table |
| Horizontal rule | `---` | Divider line |

### Images in Posts

Add images inline in your markdown:

```markdown
![Alt text description](/blog/my-image.jpg)
```

### Internal Links

Link to other pages on the site:

```markdown
[Talk to Homi](/)
[See how it works](/how-it-works)
[Try the calculator](/calc)
[Read another post](/blog/tic-vs-joint-tenancy)
```

## Available Tags

Use these tags for consistency:

| Tag | Description |
|-----|-------------|
| `getting-started` | Beginner-friendly introductions |
| `legal` | Legal considerations and structures |
| `tic` | Tenants in Common specific |
| `ownership` | Ownership structures and options |
| `agreements` | TIC agreements and contracts |
| `exit-strategy` | Planning for exits and buyouts |
| `tomi` | About Tomi's services |
| `fees` | Costs and pricing |
| `how-it-works` | Process explanations |
| `financing` | Mortgages and lending |
| `relationships` | Co-buyer relationships |
| `tips` | Practical advice |
| `success-stories` | Real co-buyer stories |

## Post Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `slug` | Yes | URL-friendly identifier (lowercase, hyphens only) |
| `title` | Yes | Full post title |
| `excerpt` | Yes | 1-2 sentence summary for previews and SEO |
| `publishedAt` | Yes | Publication date (YYYY-MM-DD) |
| `author` | Yes | Author name (usually "Tomi Team") |
| `tags` | Yes | Array of tag strings |
| `image` | Yes | Path to featured image |
| `readingTime` | Yes | Estimated read time in minutes |
| `imageAlt` | No | Alt text for featured image |
| `updatedAt` | No | Last update date (YYYY-MM-DD) |
| `authorImage` | No | Path to author avatar |
| `featured` | No | `true` to highlight in featured section |
| `draft` | No | `true` to hide from production |

## Drafts and Publishing

### Saving as Draft

Add `draft: true` to your post metadata:

```typescript
{
  slug: "upcoming-post",
  // ... other fields
  draft: true,  // Post won't appear on the site
}
```

### Publishing

Remove the `draft: true` line or set it to `false`:

```typescript
{
  slug: "upcoming-post",
  // ... other fields
  // draft: false,  // Can omit entirely
}
```

### Scheduling Posts

Set `publishedAt` to a future date. Posts are sorted by this date, so future-dated posts will appear at the top when they become "current."

## SEO

Each post automatically generates:
- Page title: `{Post Title} | Tomi`
- Meta description from excerpt
- Keywords from tags
- Open Graph tags for social sharing
- Twitter card tags
- Article schema markup

### Image Requirements for Social Sharing

For best results on social media:
- Size: 1200x630px
- Format: JPG or PNG
- File size: Under 200KB
- Include relevant text overlay if desired

## URLs

| URL | Description |
|-----|-------------|
| `/blog` | Blog index (all posts) |
| `/blog?tag=legal` | Filtered by tag |
| `/blog/[slug]` | Individual post |

## Common Tasks

### Edit an Existing Post

1. Open `src/content/blog/posts/[slug].md`
2. Make your changes
3. Update `updatedAt` in the registry if significant changes

### Change Post Order

Posts are sorted by `publishedAt` date (newest first). To reorder, adjust the dates.

### Remove a Post

1. Delete the `.md` file from `src/content/blog/posts/`
2. Remove the entry from `src/content/blog/index.ts`
3. Delete the image from `public/blog/` (optional)

### Feature/Unfeature a Post

Toggle `featured: true/false` in the registry.

## Troubleshooting

### Post Not Appearing

1. Check that `draft` is not `true`
2. Verify the slug matches the filename
3. Ensure the markdown file exists
4. Run `npm run dev` and check for errors

### Image Not Loading

1. Verify the image exists in `/public/blog/`
2. Check the path in the registry (should start with `/blog/`)
3. Ensure filename matches exactly (case-sensitive)

### Build Errors

1. Check for TypeScript errors in `src/content/blog/index.ts`
2. Ensure all required fields are present
3. Verify date format is `YYYY-MM-DD`

## Newsletter Integration

The blog includes a newsletter signup component. To connect it:

1. Open `src/components/blog/NewsletterCTA.tsx`
2. Replace the TODO comment with your email provider integration
3. Example providers: Resend, ConvertKit, Mailchimp

```typescript
// In NewsletterCTA.tsx, replace:
await new Promise((resolve) => setTimeout(resolve, 1000));

// With your API call:
const res = await fetch('/api/newsletter', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email }),
});
if (!res.ok) throw new Error('Failed to subscribe');
```

## Questions?

- For technical issues: Check the console for errors
- For content questions: Review existing posts for examples
- For feature requests: Open a GitHub issue
