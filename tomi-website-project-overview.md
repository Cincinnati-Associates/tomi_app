# Tomi Marketing Website - Project Overview

## Executive Summary

Tomi is a software platform enabling unmarried people to co-own homes together through tenants-in-common (TIC) structures. This document specifies the marketing website that introduces, educates, and converts visitors into qualified leads for the Tomi platform.

**Primary Goal**: Drive meaningful engagement while educating visitors about home co-ownership, ultimately converting them into qualified leads who enter the Tomi product ecosystem.

**Target Audience**: Millennials and Gen Z facing housing affordability challenges who are open to buying homes with people they're not married to (friends, family, investment partners).

---

## Technical Stack

### Core Framework
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion (for complex interactions)
- **Icons**: Lucide React

### Infrastructure
- **Hosting**: Vercel (recommended for Next.js optimization)
- **Analytics**: PostHog (already in Tomi's stack)
- **AI Integration**: Anthropic Claude API (for Homi chat agent)

### Development Standards
- Mobile-first responsive design
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- WCAG 2.1 AA accessibility compliance
- SEO optimized with proper meta tags, Open Graph, structured data

---

## Brand & Design System

### Brand Voice
- **Warm but credible**: Not corporate, not casual—trustworthy friend who knows their stuff
- **Empowering**: Focuses on what becomes possible, not what's wrong
- **Honest**: Acknowledges complexity and challenges; doesn't oversell
- **Forward-looking**: Building lasting wealth and relationships

### Color Palette

```css
/* Primary */
--tomi-primary: #2D5A4A;        /* Deep sage green - trust, growth, stability */
--tomi-primary-light: #4A7C6B;
--tomi-primary-dark: #1E3D32;

/* Secondary */
--tomi-secondary: #E8DDD4;      /* Warm cream - approachable, home-like */
--tomi-secondary-dark: #D4C4B5;

/* Accent */
--tomi-accent: #C4A35A;         /* Warm gold - aspiration, value */
--tomi-accent-light: #D4B76A;

/* Neutrals */
--tomi-text: #1A1A1A;
--tomi-text-muted: #6B6B6B;
--tomi-background: #FAFAF8;
--tomi-surface: #FFFFFF;
--tomi-border: #E5E5E5;

/* Semantic */
--tomi-success: #2D5A4A;
--tomi-warning: #C4A35A;
--tomi-error: #B54A4A;
```

### Typography

```css
/* Font Stack */
--font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;

/* Scale */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */
--text-5xl: 3rem;        /* 48px */
--text-6xl: 3.75rem;     /* 60px */
```

### Spacing System
Use Tailwind's default spacing scale. Key breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Component Styling Principles
1. Rounded corners: `rounded-lg` (8px) for cards, `rounded-full` for buttons
2. Shadows: Subtle, warm-toned (`shadow-sm` with slight warm tint)
3. Transitions: 200-300ms for interactions, ease-out
4. Hover states: Subtle lift or color shift, never jarring

---

## Site Architecture

### Page Structure

```
/ (Homepage)
├── /how-it-works
├── /stories
│   └── /stories/[slug]
├── /resources
│   └── /resources/[slug]
├── /about
├── /faq
├── /calculator (standalone tool, shareable)
├── /assessment (standalone tool, shareable)
└── /legal
    ├── /legal/privacy
    └── /legal/terms
```

### Navigation

**Desktop Navbar**
```
[Logo]                    How It Works | Stories | Resources | About     [Login]
```

**Mobile Navbar**
```
[Logo]                                                        [Hamburger Menu]
```

---

## Homepage Specification

### Section 1: Hero

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Navbar - sticky on scroll]                                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                                                                             │
│         What if you could afford                                            │
│         the home you actually want?                                         │
│                                                                             │
│         720,000 people buy homes with someone other than                    │
│         a spouse every year. Here's how they do it.                         │
│                                                                             │
│         ┌─────────────────────────────┐                                     │
│         │  See What You Could Afford  │  ← Primary CTA                      │
│         └─────────────────────────────┘                                     │
│                                                                             │
│         ┌───────────────────────────────────────────┐                       │
│         │  What if my co-buyer wants to sell early?█│  ← Typewriter CTA     │
│         └───────────────────────────────────────────┘                       │
│                                                                             │
│                         [Scroll indicator]                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Content
- **Headline**: "What if you could afford the home you actually want?"
- **Subheadline**: "720,000 people buy homes with someone other than a spouse every year. Here's how they do it."
- **Primary CTA**: "See What You Could Afford" → Links to /calculator or scrolls to Unlock Section
- **Secondary CTA**: Typewriter button with rotating questions (see Component Spec below)

#### Behavior
- Hero height: 100vh on desktop, 90vh on mobile (accounts for browser chrome)
- Background: Subtle gradient or abstract home-inspired pattern (not a stock photo)
- Scroll indicator: Animated chevron or line at bottom

---

### Section 2: Unlock Section ("The Aha Moment")

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    See what co-ownership unlocks                            │
│                                                                             │
│   ┌─────────────────────────────┐    ┌─────────────────────────────┐        │
│   │                             │    │                             │        │
│   │   [Modest home image]       │    │   [Aspirational home image] │        │
│   │                             │    │                             │        │
│   │   Buying alone              │    │   Buying together           │        │
│   │   $340,000                  │    │   $680,000                  │        │
│   │   Studio in the suburbs     │    │   3BR in the neighborhood   │        │
│   │                             │    │   you actually want         │        │
│   └─────────────────────────────┘    └─────────────────────────────┘        │
│                                                                             │
│                    ┌────────────────────────────┐                           │
│                    │   Calculate Your Numbers   │                           │
│                    └────────────────────────────┘                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Behavior
- Cards should have subtle animation on scroll-into-view (fade up, slight stagger)
- Numbers could animate/count up when in view
- Consider: Mini inline calculator instead of static numbers

---

### Section 3: How It Works

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         How Tomi works                                      │
│                                                                             │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐             │
│   │    01    │    │    02    │    │    03    │    │    04    │             │
│   │  [Icon]  │───▶│  [Icon]  │───▶│  [Icon]  │───▶│  [Icon]  │             │
│   │          │    │          │    │          │    │          │             │
│   │ Explore  │    │  Form    │    │  Build   │    │  Buy &   │             │
│   │          │    │  Your    │    │  Your    │    │  Manage  │             │
│   │          │    │  Group   │    │Agreement │    │          │             │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘             │
│                                                                             │
│        Discover if          Find your         Create your      Close with  │
│        co-ownership         co-buyers or      legal framework  confidence  │
│        fits your life       bring your own    together         and thrive  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Content for Each Step

**Step 1: Explore**
- Icon: Compass or magnifying glass
- Title: "Explore"
- Description: "Discover if co-ownership fits your life through guided exercises and AI-powered conversations."

**Step 2: Form Your Group**
- Icon: Users/people
- Title: "Form Your Group"
- Description: "Find compatible co-buyers or bring people you already know. We help you align on what matters."

**Step 3: Build Your Agreement**
- Icon: Document with checkmark
- Title: "Build Your Agreement"
- Description: "Create your legal framework together with our TIC Agreement Builder. Every hard question, answered."

**Step 4: Buy & Manage**
- Icon: Home with heart
- Title: "Buy & Manage"
- Description: "Close with confidence and manage your shared home with tools built for co-owners."

#### Behavior
- Horizontal scroll on mobile (with scroll snap)
- Steps connect with animated line/arrow
- Each step card expands on click/tap to show more detail

---

### Section 4: Trust Builder (Objection Cards)

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│              "But what about..."                                            │
│              Every concern you have, we've thought through.                 │
│                                                                             │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│   │                     │  │                     │  │                     │ │
│   │  What if we         │  │  What if someone    │  │  How do we split    │ │
│   │  disagree?          │  │  can't pay?         │  │  things fairly?     │ │
│   │                     │  │                     │  │                     │ │
│   │  [tap to reveal]    │  │  [tap to reveal]    │  │  [tap to reveal]    │ │
│   │                     │  │                     │  │                     │ │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                             │
│   ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│   │                     │  │                     │  │                     │ │
│   │  What if one of     │  │  Is this even       │  │  What about         │ │
│   │  us wants to sell?  │  │  legal?             │  │  my credit?         │ │
│   │                     │  │                     │  │                     │ │
│   └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Objection Content

**Card 1: "What if we disagree?"**
> Your TIC agreement includes a clear decision-making framework before you buy. Major decisions require consensus; day-to-day choices follow rules you set together. Tomi helps you have these conversations early—when they're hypothetical, not heated.

**Card 2: "What if someone can't pay?"**
> Your agreement defines grace periods, remedies, and buyout terms upfront. We help you plan for life's curveballs—job loss, medical issues, or just changing priorities—so everyone knows what to expect.

**Card 3: "How do we split things fairly?"**
> Equity splits can reflect different down payments, ongoing contributions, or sweat equity. Your agreement captures what "fair" means to your group specifically—not a one-size-fits-all formula.

**Card 4: "What if one of us wants to sell?"**
> Your agreement includes exit procedures: rights of first refusal for other owners, required notice periods, valuation methods, and buyout terms. No surprises.

**Card 5: "Is this even legal?"**
> Absolutely. Tenancy-in-common has been a recognized ownership structure for centuries. We help you create a legally sound agreement reviewed by attorneys who specialize in co-ownership.

**Card 6: "What about my credit?"**
> Co-buyers typically apply for a mortgage together, so everyone's credit matters. We help you understand requirements early and can connect you with lenders experienced in co-buyer transactions.

#### Behavior
- Cards flip or expand to reveal answer
- Expanded state shows "Learn more →" link to relevant FAQ/resource
- Only one card expanded at a time on mobile
- Consider: Link these directly to Homi for follow-up questions

---

### Section 5: Story Preview

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                                                                     │   │
│   │   [Photo: Two people in front of their home]                        │   │
│   │                                                                     │   │
│   │         "We bought a $650K home on $75K salaries"                   │   │
│   │                                                                     │   │
│   │         Alex & Jordan were priced out of their city—until           │   │
│   │         they discovered they didn't have to buy alone.              │   │
│   │                                                                     │   │
│   │         ┌─────────────────────┐                                     │   │
│   │         │  Read Their Story   │                                     │   │
│   │         └─────────────────────┘                                     │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Notes
- Use a real or realistic-feeling story (can be composite/anonymized)
- Photo should feel authentic, not stock
- The quote should create curiosity gap
- Link to full /stories/alex-and-jordan page

---

### Section 6: The Tomi Difference

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    Why Tomi?                                                │
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │   ┌─────────┐                                                         │ │
│   │   │  Icon   │   AI-Guided Journey                                     │ │
│   │   └─────────┘   Homi, your personal guide, helps you navigate         │ │
│   │                 every decision—from "is this right for me?" to        │ │
│   │                 "what should our guest policy be?"                    │ │
│   │                                                                       │ │
│   ├───────────────────────────────────────────────────────────────────────┤ │
│   │                                                                       │ │
│   │   ┌─────────┐                                                         │ │
│   │   │  Icon   │   We Only Win When You Win                              │ │
│   │   └─────────┘   No upfront fees. We take 1% when you eventually       │ │
│   │                 sell—because we're building for the long haul,        │ │
│   │                 not a quick transaction.                              │ │
│   │                                                                       │ │
│   ├───────────────────────────────────────────────────────────────────────┤ │
│   │                                                                       │ │
│   │   ┌─────────┐                                                         │ │
│   │   │  Icon   │   Built for Lasting Partnerships                        │ │
│   │   └─────────┘   We're not just helping you buy—we're helping you      │ │
│   │                 build something that lasts. Your home. Your way.      │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Icons
- AI-Guided: Sparkles or brain icon
- No Fees: Handshake or circular arrows
- Lasting: Temple or infinite loop

---

### Section 7: Final CTA

#### Layout
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │                                                                       │ │
│   │              Ready to see what's possible?                            │ │
│   │                                                                       │ │
│   │   ┌──────────────────────────┐   ┌──────────────────────────┐         │ │
│   │   │  Start Your Journey      │   │  Talk to Homi            │         │ │
│   │   └──────────────────────────┘   └──────────────────────────┘         │ │
│   │                                                                       │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Behavior
- "Start Your Journey" → /assessment or /calculator
- "Talk to Homi" → Opens Homi chat
- Background: Distinct from rest of page (could use primary color)

---

### Section 8: Footer

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│   [Logo]                                                                    │
│                                                                             │
│   Product          Resources        Company          Legal                  │
│   How It Works     Blog             About            Privacy               │
│   Calculator       FAQ              Careers          Terms                 │
│   Stories          Guides           Contact                                │
│                                                                             │
│   ─────────────────────────────────────────────────────────────────────    │
│                                                                             │
│   © 2025 Tomi. All rights reserved.        [Twitter] [LinkedIn] [Instagram]│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### TypewriterButton Component

**Purpose**: A button that displays rotating questions with typewriter animation. Clicking the button at any point opens the Homi chat with the current (partial or complete) question as context.

**Location**: `src/components/home/TypewriterButton.tsx`

#### Props
```typescript
interface TypewriterButtonProps {
  questions: string[];
  typeSpeed?: number;        // ms per character, default 50
  deleteSpeed?: number;      // ms per character, default 30
  pauseAfterType?: number;   // ms to pause after complete, default 2500
  pauseAfterDelete?: number; // ms before next question, default 500
  onQuestionClick: (question: string, isComplete: boolean) => void;
  className?: string;
}
```

#### Questions Array
```typescript
const heroQuestions = [
  "What if my co-buyer wants to sell early?",
  "How do we split equity fairly?",
  "Can I co-own with a friend?",
  "What happens if someone can't pay?",
  "Is co-ownership right for me?",
  "How do we handle disagreements?",
  "What does the legal agreement cover?",
  "How do we find the right co-buyer?",
];
```

#### Animation State Machine
```
States: 'typing' | 'paused' | 'deleting' | 'switching'

TYPING:
  - Increment displayed text by one character every typeSpeed ms
  - When complete → transition to PAUSED

PAUSED:
  - Wait pauseAfterType ms
  - Transition to DELETING

DELETING:
  - Remove one character every deleteSpeed ms
  - When empty → transition to SWITCHING

SWITCHING:
  - Wait pauseAfterDelete ms
  - Advance to next question (loop to start if at end)
  - Transition to TYPING
```

#### Visual Behavior
1. **Cursor**: Blinking `|` character at end of text
   - Blinks every 530ms
   - Solid (not blinking) during delete phase
   
2. **Button width**: Animates smoothly with content
   - Use `transition-all duration-200 ease-out`
   - Set min-width to prevent collapse
   
3. **Hover state**: 
   - Pauses animation
   - Subtle background color change
   - Cursor stops blinking, stays visible
   
4. **Click state**:
   - Captures current text (even if partial)
   - Triggers onQuestionClick callback
   - Brief press animation

#### Styling
```typescript
// Base button styles
const baseStyles = `
  inline-flex items-center justify-center
  px-6 py-3
  border-2 border-tomi-primary
  rounded-full
  bg-transparent
  text-tomi-primary
  font-medium
  transition-all duration-200 ease-out
  hover:bg-tomi-primary/5
  cursor-pointer
  min-w-[200px]
`;

// Cursor styles
const cursorStyles = `
  inline-block
  w-[2px]
  h-[1.2em]
  bg-tomi-primary
  ml-[2px]
  animate-blink
`;
```

#### Accessibility
- Role: button
- aria-label: Dynamically updated with full current question
- Keyboard: Enter/Space triggers click
- Reduced motion: Skip typing animation, show static rotating text

---

### HomiChat Component

**Purpose**: Modal/drawer interface for conversing with Homi AI agent.

**Location**: `src/components/shared/HomiChat.tsx`

#### Props
```typescript
interface HomiChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;  // Pre-populate from TypewriterButton
  context?: 'hero' | 'faq' | 'calculator' | 'general';
}
```

#### Behavior
- Opens as slide-up drawer on mobile, side panel or modal on desktop
- If initialMessage provided, auto-sends it on open
- Shows typing indicator while waiting for response
- Persists conversation in session (not across visits, initially)
- Close button and click-outside to dismiss

#### AI Integration Notes
The Homi chat will use Claude API. System prompt should include:
- Tomi's mission and value proposition
- Common questions and answers
- Qualification questions to naturally gather:
  - Timeline for buying
  - Whether they have co-buyers in mind
  - Location preferences
  - Current homeownership status
- Warm, knowledgeable, never pushy tone

For MVP, this can be a simple chat interface. Later phases can add:
- Suggested questions
- Rich responses with embedded links/calculators
- Handoff to human when qualified

---

### AffordabilityCalculator Component

**Purpose**: Interactive calculator showing solo vs. co-buying purchasing power.

**Location**: `src/components/calculator/AffordabilityCalculator.tsx`

#### Inputs
```typescript
interface CalculatorInputs {
  annualIncome: number;
  savings: number;
  monthlyDebts: number;
  targetCity: string;
  numberOfCoBuyers: 1 | 2 | 3 | 4;
}
```

#### Calculation Logic (Simplified)
```typescript
// Basic affordability calculation
const calculateMaxHome = (income: number, savings: number, debts: number) => {
  const monthlyIncome = income / 12;
  const dti = 0.43; // Debt-to-income ratio limit
  const maxMonthlyPayment = (monthlyIncome * dti) - debts;
  
  // Assume 7% rate, 30yr, 20% down
  const rate = 0.07 / 12;
  const periods = 360;
  const loanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + rate, -periods)) / rate);
  const maxHome = loanAmount / 0.8; // Account for 20% down
  
  // Factor in available down payment
  const downPaymentHome = savings / 0.2;
  
  return Math.min(maxHome, downPaymentHome);
};
```

#### Output Display
- Side-by-side comparison of solo vs. group purchasing power
- Visual representation (home icons sized proportionally, or map showing neighborhoods)
- Clear "unlock" messaging: "With a co-buyer, you unlock $X more"

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout with fonts, providers
│   ├── page.tsx                   # Homepage
│   ├── how-it-works/
│   │   └── page.tsx
│   ├── stories/
│   │   ├── page.tsx               # Stories index
│   │   └── [slug]/
│   │       └── page.tsx           # Individual story
│   ├── resources/
│   │   ├── page.tsx
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── about/
│   │   └── page.tsx
│   ├── faq/
│   │   └── page.tsx
│   ├── calculator/
│   │   └── page.tsx               # Standalone calculator page
│   ├── assessment/
│   │   └── page.tsx               # Readiness assessment
│   └── legal/
│       ├── privacy/
│       │   └── page.tsx
│       └── terms/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── MobileMenu.tsx
│   │   └── Footer.tsx
│   ├── home/
│   │   ├── Hero.tsx
│   │   ├── TypewriterButton.tsx
│   │   ├── UnlockSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ObjectionCards.tsx
│   │   ├── StoryPreview.tsx
│   │   ├── TomiDifference.tsx
│   │   └── FinalCta.tsx
│   ├── calculator/
│   │   ├── AffordabilityCalculator.tsx
│   │   └── CalculatorResult.tsx
│   ├── assessment/
│   │   └── ReadinessAssessment.tsx
│   ├── shared/
│   │   ├── HomiChat.tsx
│   │   ├── HomiChatTrigger.tsx    # Floating button
│   │   └── SectionWrapper.tsx     # Consistent section padding/max-width
│   └── ui/                        # shadcn components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── drawer.tsx
│       ├── input.tsx
│       └── ...
├── hooks/
│   ├── useTypewriter.ts           # Typewriter animation logic
│   ├── useHomiChat.ts             # Chat state management
│   └── useIntersectionObserver.ts # Scroll animations
├── lib/
│   ├── utils.ts                   # cn() helper, etc.
│   ├── calculator.ts              # Calculation logic
│   └── homi.ts                    # AI chat utilities
├── styles/
│   └── globals.css                # Tailwind base + custom properties
├── content/
│   ├── questions.ts               # Typewriter questions, FAQ content
│   ├── stories/                   # Story content (could be MDX)
│   └── resources/                 # Resource content
└── types/
    └── index.ts                   # Shared TypeScript types
```

---

## Implementation Priority

### Phase 1: Foundation (Week 1)
1. Project setup (Next.js, Tailwind, shadcn)
2. Design tokens and global styles
3. Navbar and Footer
4. Basic page routing structure

### Phase 2: Hero Section (Week 1-2)
1. `useTypewriter` hook
2. `TypewriterButton` component
3. `Hero` composition
4. Basic `HomiChat` modal (UI only, no AI yet)

### Phase 3: Homepage Sections (Week 2)
1. `UnlockSection` with animations
2. `HowItWorks` stepper
3. `ObjectionCards` with flip animation
4. `StoryPreview` card
5. `TomiDifference` features
6. `FinalCta` section

### Phase 4: Calculator (Week 3)
1. `AffordabilityCalculator` component
2. `/calculator` standalone page
3. Integration with Hero CTA

### Phase 5: AI Integration (Week 3-4)
1. Claude API integration
2. Homi system prompt and conversation handling
3. Connect `TypewriterButton` → `HomiChat`
4. Floating Homi trigger

### Phase 6: Polish & Launch (Week 4)
1. Animations and micro-interactions
2. SEO optimization
3. Performance audit
4. Accessibility audit
5. Mobile testing

---

## Content Needed

Before development can complete, the following content is needed:

### Copy
- [ ] Final headline and subheadline for Hero
- [ ] How It Works step descriptions
- [ ] Objection card answers (drafts provided above)
- [ ] Tomi Difference descriptions
- [ ] About page content
- [ ] FAQ content (can start with objection card content)

### Assets
- [ ] Tomi logo (SVG, multiple variants)
- [ ] Home imagery for Unlock Section (or decide to use illustrations)
- [ ] Story photo(s) and content
- [ ] Icons (can use Lucide, but confirm style preference)
- [ ] Open Graph image (1200x630)
- [ ] Favicon and app icons

### Integrations
- [ ] PostHog project ID
- [ ] Claude API key (for Homi)
- [ ] Any form handling (for newsletter, contact)

---

## Success Metrics

Track via PostHog:

### Engagement
- Calculator interactions (started, completed)
- Typewriter button clicks
- Homi chat opens and message count
- Objection card reveals
- Time on page
- Scroll depth

### Conversion
- Assessment starts and completions
- Newsletter signups
- "Start Your Journey" clicks
- Homi → qualified lead indicators

### Quality
- Core Web Vitals
- Bounce rate
- Return visits

---

## Notes for Development

1. **Mobile-first**: Build for mobile, enhance for desktop. Not the other way around.

2. **Progressive enhancement**: Site should work without JS for core content. Interactions enhance.

3. **Performance budget**: Total homepage JS < 200KB gzipped. Lazy load below-fold sections.

4. **Image optimization**: Use Next.js Image component. Provide WebP with fallbacks.

5. **Animation accessibility**: Respect `prefers-reduced-motion`. Provide static alternatives.

6. **Testing**: Focus on:
   - TypewriterButton edge cases (rapid clicking, focus management)
   - HomiChat on various devices
   - Calculator with edge inputs
   - Mobile navigation

7. **SEO**: Each page needs unique title, description, and OG tags. Implement JSON-LD for organization schema.

---

## Questions to Resolve

1. **Homi chat backend**: Serverless function? Separate API? Need to define architecture.

2. **Story content**: Real stories or hypothetical/composite? Need final decision and content.

3. **Calculator accuracy**: How precise should calculations be? Disclaimers needed?

4. **Lead capture**: Where does data go? Supabase? Email integration?

5. **Login integration**: Does "Login" link to the main Tomi app? What's the URL?

---

## Appendix: Typewriter Hook Implementation

For reference, here's a starting point for the `useTypewriter` hook:

```typescript
// src/hooks/useTypewriter.ts

import { useState, useEffect, useCallback, useRef } from 'react';

type TypewriterState = 'typing' | 'paused' | 'deleting' | 'switching';

interface UseTypewriterOptions {
  texts: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseAfterType?: number;
  pauseAfterDelete?: number;
  loop?: boolean;
}

interface UseTypewriterReturn {
  displayText: string;
  currentTextIndex: number;
  isComplete: boolean;
  state: TypewriterState;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export function useTypewriter({
  texts,
  typeSpeed = 50,
  deleteSpeed = 30,
  pauseAfterType = 2500,
  pauseAfterDelete = 500,
  loop = true,
}: UseTypewriterOptions): UseTypewriterReturn {
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [state, setState] = useState<TypewriterState>('typing');
  const [isPaused, setIsPaused] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const currentFullText = texts[currentTextIndex];
  const isComplete = displayText === currentFullText;
  
  const clearCurrentTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const pause = useCallback(() => {
    setIsPaused(true);
    clearCurrentTimeout();
  }, [clearCurrentTimeout]);
  
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  useEffect(() => {
    if (isPaused) return;
    
    switch (state) {
      case 'typing':
        if (displayText.length < currentFullText.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(currentFullText.slice(0, displayText.length + 1));
          }, typeSpeed);
        } else {
          setState('paused');
        }
        break;
        
      case 'paused':
        timeoutRef.current = setTimeout(() => {
          setState('deleting');
        }, pauseAfterType);
        break;
        
      case 'deleting':
        if (displayText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(displayText.slice(0, -1));
          }, deleteSpeed);
        } else {
          setState('switching');
        }
        break;
        
      case 'switching':
        timeoutRef.current = setTimeout(() => {
          const nextIndex = (currentTextIndex + 1) % texts.length;
          if (!loop && nextIndex === 0) {
            // Stop if not looping and we've gone through all texts
            return;
          }
          setCurrentTextIndex(nextIndex);
          setState('typing');
        }, pauseAfterDelete);
        break;
    }
    
    return clearCurrentTimeout;
  }, [
    state,
    displayText,
    currentFullText,
    currentTextIndex,
    texts.length,
    typeSpeed,
    deleteSpeed,
    pauseAfterType,
    pauseAfterDelete,
    loop,
    isPaused,
    clearCurrentTimeout,
  ]);
  
  return {
    displayText,
    currentTextIndex,
    isComplete,
    state,
    pause,
    resume,
    isPaused,
  };
}
```

---

*End of Project Overview*
