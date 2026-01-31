# Blog Post Command

Create a new blog post for the Tomi Co-Buy Academy.

## Overview

This command helps create new blog posts by:
1. Gathering post details (title, excerpt, tags, etc.)
2. Creating the markdown content file
3. Adding the post to the registry
4. Optionally generating a draft outline

## Arguments

- `$ARGUMENTS` - Optional: Post title in quotes (skips title prompt)

## Order of Operations

### Step 1: Gather Post Information

Collect the following from the user (or use provided arguments):

1. **Title** (required): The post headline
2. **Excerpt** (required): 1-2 sentence summary for SEO and previews
3. **Tags** (required): Choose from available tags or suggest new ones
4. **Author** (optional): Defaults to "Tomi Team"
5. **Featured** (optional): Whether to highlight on the blog index
6. **Draft** (optional): Save as draft (hidden from production)

**Available tags:**
- `getting-started` - Beginner-friendly introductions
- `legal` - Legal considerations and structures
- `tic` - Tenants in Common specific
- `ownership` - Ownership structures
- `agreements` - TIC agreements and contracts
- `exit-strategy` - Planning for exits and buyouts
- `tomi` - About Tomi's services
- `fees` - Costs and pricing
- `how-it-works` - Process explanations
- `financing` - Mortgages and lending
- `relationships` - Co-buyer relationships
- `tips` - Practical advice
- `success-stories` - Real co-buyer stories

### Step 2: Generate Slug

Convert the title to a URL-friendly slug:
- Lowercase
- Replace spaces and special characters with hyphens
- Remove consecutive hyphens

Example: "What If We Break Up?" → `what-if-we-break-up`

### Step 3: Create Markdown File

Create the file at `src/content/blog/posts/[slug].md` with this template:

```markdown
# [Title]

[Opening paragraph - hook the reader with the problem or question]

## [First Section]

[Content...]

### [Subsection if needed]

[More detail...]

## [Second Section]

[Content...]

> [Use blockquotes for important callouts or expert quotes]

## [Conclusion/Key Takeaways]

[Summarize key points and provide clear next steps]

---

**Ready to learn more?** [Talk to Homi](/) or [explore how Tomi works](/how-it-works).
```

### Step 4: Add to Registry

Add the post metadata to `src/content/blog/index.ts` in the `posts` array:

```typescript
{
  slug: "[slug]",
  title: "[title]",
  excerpt: "[excerpt]",
  publishedAt: "[YYYY-MM-DD]",  // Today's date
  author: "[author]",
  tags: ["tag1", "tag2"],
  image: "/blog/[slug].jpg",
  readingTime: 5,  // Estimate based on content
  featured: false,  // or true if specified
  draft: true,  // Start as draft, remove when ready
},
```

**Important:** Add new posts at the TOP of the array (after the opening bracket).

### Step 5: Report Success

Tell the user:
1. File created at `src/content/blog/posts/[slug].md`
2. Registry updated at `src/content/blog/index.ts`
3. Image needed at `public/blog/[slug].jpg` (1200x630px recommended)
4. Preview URL: `http://localhost:3000/blog/[slug]`
5. Post is in draft mode - remove `draft: true` to publish

## Optional: Generate Content Outline

If the user wants help with content, offer to generate an outline based on:
- Target audience (first-time co-buyers, experienced, etc.)
- Key questions to answer
- Tone (educational, conversational, authoritative)

## File Locations

- **Markdown posts:** `src/content/blog/posts/[slug].md`
- **Post registry:** `src/content/blog/index.ts`
- **Images:** `public/blog/[slug].jpg`
- **Documentation:** `docs/BLOG.md`

## Example Usage

```
/blog                                    # Interactive mode
/blog "How to Split Costs Fairly"        # With title provided
```

## Markdown Features

Remind users they can use:
- `## Headings` for sections
- `**bold**` and `*italic*` for emphasis
- `[text](url)` for links
- `> blockquote` for callouts
- `- bullet` and `1. numbered` lists
- `| table | syntax |` for comparison tables
- `---` for horizontal rules
- `![alt](/blog/image.jpg)` for inline images

## After Creation

Suggest the user:
1. Edit the markdown file to add real content
2. Add a featured image to `/public/blog/`
3. Run `npm run dev` and preview at `/blog/[slug]`
4. When ready, remove `draft: true` from the registry
5. Commit and push to deploy
