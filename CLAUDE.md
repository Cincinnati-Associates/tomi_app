# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tomi is a marketing site for a co-ownership/co-buying home platform. It helps users understand tenants-in-common (TIC) structures and calculate affordability with co-buyers. The site features an AI chat assistant ("Homi") powered by streaming LLM responses.

## Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npx tsc --noEmit # Type check without emitting
```

## Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with CSS custom properties for theming
- **Animations:** Framer Motion for scroll-based and interactive animations
- **AI:** Vercel AI SDK with multi-provider support (Google/OpenAI/Anthropic)
- **Analytics:** PostHog
- **Backend:** Supabase (auth/db ready but not heavily used yet)

### Key Patterns

**Theme System:** Colors use HSL CSS variables defined in `globals.css`. Both light and dark modes are supported. Light mode uses sage green (`--primary: 153 37% 26%`) as primary; dark mode uses yellow (`--primary: 52 65% 70%`).

**Component Organization:**
- `components/home/` - Homepage sections (Hero, HowItWorks, UnlockSection, etc.)
- `components/calculator/` - Smart calculator with AI chat integration
- `components/calc/` - Ownership calculator (detailed proforma-style)
- `components/shared/` - Reusable components (HomiChat, ThemeToggle, etc.)
- `components/ui/` - Primitive UI components (shadcn/ui style)
- `components/layout/` - Navbar, Footer, MobileMenu

**AI Chat:** The `/api/chat` route handles streaming responses. It supports two input formats:
1. Homepage chat: `{ messages: [{role, content}...] }`
2. Calculator context: `{ message, history, calculatorContext }`

Provider is controlled by `AI_PROVIDER` env var (google/openai/anthropic). See `lib/ai-provider.ts`.

**Content Data:** Static content lives in `src/content/questions.ts` (heroQuestions, objectionCards, howItWorksSteps, tomiDifferenceFeatures).

**Hooks:**
- `useHomiChat` - Chat with streaming, wraps Vercel AI SDK's `useChat`
- `useSmartCalculator` - Calculator state + AI integration
- `useTypewriter` - Text typing animation effect
- `useAnimatedValue` - Smooth number animations

### Scroll Animations

Several components use Framer Motion's `useScroll` + `useTransform` for scroll-triggered effects (e.g., HowItWorks horizontal panels, UnlockSection reveals). The pattern:
```tsx
const { scrollYProgress } = useScroll({ target: containerRef, offset: [...] });
const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);
```

### CSS Utilities

Custom glow effects in `globals.css`: `.glow`, `.glow-hover`, `.glow-pulse`, `.glow-intense`. Button component has a `glow` variant.

## Environment Variables

Required in `.env.local`:
- `AI_PROVIDER` - "google" | "openai" | "anthropic"
- Provider-specific API key (GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## PostHog Guidelines

From `.cursor/rules/posthog-integration.mdc`:
- Never hardcode API keys; use `.env.local`
- Minimize feature flag usage across callsites
- Use enums/const objects for flag names (UPPERCASE_WITH_UNDERSCORE)
- Consult existing naming conventions before creating new event/property names
