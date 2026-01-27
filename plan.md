# Tomi User Signup & Group Management Implementation Plan

## Current Status: Phase 1-2 COMPLETE (Code Ready)

All code has been written and builds successfully. **Next step: Deploy the database schema to Supabase.**

---

## What's Been Built

### Files Created/Modified:

**New Files:**
- `supabase/migrations/001_auth_and_parties.sql` - Full database schema
- `src/middleware.ts` - Auth middleware for session handling
- `src/lib/supabase-server.ts` - Server-side Supabase client
- `src/types/user.ts` - TypeScript types for users, parties, invites
- `src/providers/AuthProvider.tsx` - Auth context provider
- `src/hooks/useProfile.ts` - Profile management hook
- `src/components/auth/AuthModal.tsx` - Sign in/up modal
- `src/app/auth/callback/route.ts` - OAuth callback handler
- `src/app/dashboard/page.tsx` - User dashboard
- `.env.local.example` - Environment variable template

**Modified Files:**
- `src/lib/supabase.ts` - Enhanced with fallback handling
- `src/hooks/useAuth.ts` - Added profile support, Google OAuth
- `src/components/layout/Navbar.tsx` - Auth state, user menu
- `src/components/layout/MobileMenu.tsx` - Auth state support
- `src/app/layout.tsx` - Added AuthProvider wrapper

---

## NEXT STEPS (To Complete Setup)

### Step 1: Add Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

Get values from: https://supabase.com/dashboard/project/_/settings/api

### Step 2: Deploy Database Schema

Run the migration in your Supabase SQL Editor:
1. Go to https://supabase.com/dashboard/project/_/sql
2. Open `supabase/migrations/001_auth_and_parties.sql`
3. Copy and paste the entire contents
4. Click "Run"

### Step 3: Configure Supabase Auth

In Supabase Dashboard > Authentication:

1. **URL Configuration** (Authentication > URL Configuration):
   - Site URL: `http://localhost:3000` (dev) or your production URL
   - Redirect URLs: Add `http://localhost:3000/auth/callback`

2. **Email Templates** (optional but recommended):
   - Customize the magic link email template

3. **Google OAuth** (when ready):
   - Go to Authentication > Providers > Google
   - Add your Google OAuth Client ID and Secret

### Step 4: Test Locally

```bash
npm run dev
```

Then:
1. Click "Sign In" in the navbar
2. Enter your email
3. Check email for magic link
4. Click link to sign in
5. You should land on `/dashboard`

---

## Remaining Phases (Future Work)

### Phase 3: Profile Settings Page
- Create `/settings/profile` page
- Avatar upload
- Name/email editing

### Phase 4: Buying Parties
- Create/list parties
- Invite members (email, SMS, link)
- Party detail page
- Member management

### Phase 5: Integration
- Connect calculator to parties
- Save shared calculator state

---

## Original Plan (Reference)

### Phase 1: Database Schema & Auth Infrastructure

#### 1.1 Create Supabase Database Schema

Create migration file: `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  phone text,
  full_name text,
  avatar_url text,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Users can view their own profile
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile (on signup)
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- BUYING PARTIES TABLE (groups)
-- ============================================
create type party_status as enum ('forming', 'active', 'under_contract', 'closed', 'archived');

create table public.buying_parties (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  status party_status default 'forming' not null,
  created_by uuid references public.profiles(id) on delete set null,
  calculator_state jsonb, -- stores the shared calculator/financial model
  target_city text,
  target_budget numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.buying_parties enable row level security;

-- ============================================
-- PARTY MEMBERS TABLE (junction table)
-- ============================================
create type member_role as enum ('admin', 'member');
create type invite_status as enum ('pending', 'accepted', 'declined');

create table public.party_members (
  id uuid default uuid_generate_v4() primary key,
  party_id uuid references public.buying_parties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role member_role default 'member' not null,
  invite_status invite_status default 'accepted' not null,
  ownership_percentage numeric,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(party_id, user_id)
);

alter table public.party_members enable row level security;

-- Members can view their own parties
create policy "Members can view their parties" on public.party_members
  for select using (auth.uid() = user_id);

-- Members can view other members in their parties
create policy "Members can view party members" on public.party_members
  for select using (
    party_id in (
      select party_id from public.party_members where user_id = auth.uid()
    )
  );

-- Party admins can insert new members
create policy "Admins can add members" on public.party_members
  for insert with check (
    exists (
      select 1 from public.party_members
      where party_id = party_members.party_id
      and user_id = auth.uid()
      and role = 'admin'
    )
    or auth.uid() = user_id -- users can add themselves via invite
  );

-- Party admins can update members
create policy "Admins can update members" on public.party_members
  for update using (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_members.party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
  );

-- RLS for buying_parties based on membership
create policy "Members can view their parties" on public.buying_parties
  for select using (
    id in (select party_id from public.party_members where user_id = auth.uid())
  );

create policy "Admins can update their parties" on public.buying_parties
  for update using (
    id in (
      select party_id from public.party_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can create parties" on public.buying_parties
  for insert with check (auth.uid() = created_by);

-- ============================================
-- PARTY INVITES TABLE (flexible invites)
-- ============================================
create type invite_type as enum ('email', 'sms', 'link');

create table public.party_invites (
  id uuid default uuid_generate_v4() primary key,
  party_id uuid references public.buying_parties(id) on delete cascade not null,
  invite_type invite_type not null,
  invite_value text not null, -- email, phone, or token for links
  invited_by uuid references public.profiles(id) on delete set null,
  role member_role default 'member' not null,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.party_invites enable row level security;

-- Anyone can view link-based invites (for accepting)
create policy "Anyone can view link invites" on public.party_invites
  for select using (invite_type = 'link');

-- Members can view invites for their parties
create policy "Members can view party invites" on public.party_invites
  for select using (
    party_id in (select party_id from public.party_members where user_id = auth.uid())
  );

-- Admins can create invites
create policy "Admins can create invites" on public.party_invites
  for insert with check (
    exists (
      select 1 from public.party_members
      where party_id = party_invites.party_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Authenticated users can accept invites
create policy "Users can accept invites" on public.party_invites
  for update using (auth.uid() is not null);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone, full_name)
  values (
    new.id,
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger buying_parties_updated_at
  before update on public.buying_parties
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- INDEXES
-- ============================================
create index idx_party_members_user_id on public.party_members(user_id);
create index idx_party_members_party_id on public.party_members(party_id);
create index idx_party_invites_party_id on public.party_invites(party_id);
create index idx_party_invites_value on public.party_invites(invite_value);
create index idx_buying_parties_status on public.buying_parties(status);
```

### 1.2 Update Supabase Client Setup

Create server-side client for API routes: `src/lib/supabase-server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

### 1.3 Add Auth Middleware

Create `src/middleware.ts` for session handling:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Phase 2: Enhanced Auth with Social Logins

### 2.1 Update useAuth Hook

Enhance `src/hooks/useAuth.ts` to support social logins and profile data:

```typescript
// Add to existing hook:
- signInWithGoogle(): Promise<{ error: Error | null }>
- signInWithApple(): Promise<{ error: Error | null }>
- profile: Profile | null
- updateProfile(data: Partial<Profile>): Promise<{ error: Error | null }>
```

### 2.2 Configure OAuth Providers in Supabase Dashboard

Manual steps (documented for reference):
1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Google OAuth with Client ID/Secret
3. Enable Apple OAuth with Service ID/Key
4. Set redirect URLs to `https://yourdomain.com/auth/callback`

### 2.3 Create Auth Callback Route

Create `src/app/auth/callback/route.ts` to handle OAuth redirects:

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
```

---

## Phase 3: User Profile & Dashboard

### 3.1 Create Profile Types

Add to `src/types/user.ts`:

```typescript
export interface Profile {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface BuyingParty {
  id: string
  name: string
  status: 'forming' | 'active' | 'under_contract' | 'closed' | 'archived'
  created_by: string | null
  calculator_state: Record<string, unknown> | null
  target_city: string | null
  target_budget: number | null
  created_at: string
  updated_at: string
  members?: PartyMember[]
}

export interface PartyMember {
  id: string
  party_id: string
  user_id: string
  role: 'admin' | 'member'
  invite_status: 'pending' | 'accepted' | 'declined'
  ownership_percentage: number | null
  joined_at: string
  profile?: Profile
}

export interface PartyInvite {
  id: string
  party_id: string
  invite_type: 'email' | 'sms' | 'link'
  invite_value: string
  invited_by: string | null
  role: 'admin' | 'member'
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
}
```

### 3.2 Create useProfile Hook

Create `src/hooks/useProfile.ts`:

```typescript
// Provides:
- profile: Profile | null
- isLoading: boolean
- updateProfile(data: Partial<Profile>): Promise<void>
- uploadAvatar(file: File): Promise<string> // returns URL
```

### 3.3 Create Dashboard Page

Create `src/app/dashboard/page.tsx`:

- Shows user profile summary
- Lists buying parties user belongs to
- Quick actions: Create party, Edit profile
- Shows pending invites

### 3.4 Create Profile Settings Page

Create `src/app/settings/profile/page.tsx`:

- Edit name, email, phone
- Upload/change avatar
- Notification preferences (future)

---

## Phase 4: Buying Parties (Groups)

### 4.1 Create useBuyingParties Hook

Create `src/hooks/useBuyingParties.ts`:

```typescript
// Provides:
- parties: BuyingParty[]
- isLoading: boolean
- createParty(name: string): Promise<BuyingParty>
- archiveParty(partyId: string): Promise<void>
- updateParty(partyId: string, data: Partial<BuyingParty>): Promise<void>
```

### 4.2 Create usePartyMembers Hook

Create `src/hooks/usePartyMembers.ts`:

```typescript
// Provides:
- members: PartyMember[]
- isLoading: boolean
- inviteMember(partyId: string, method: 'email' | 'sms' | 'link', value?: string): Promise<PartyInvite>
- removeMember(partyId: string, userId: string): Promise<void>
- updateMemberRole(partyId: string, userId: string, role: 'admin' | 'member'): Promise<void>
```

### 4.3 Create Party Management Pages

**Party List**: `src/app/parties/page.tsx`
- List all user's parties
- Create new party button
- Filter by status

**Party Detail**: `src/app/parties/[id]/page.tsx`
- Party overview with members
- Calculator state (linked to existing calculator)
- Invite members section
- Admin controls (if admin)

**Accept Invite**: `src/app/invite/[token]/page.tsx`
- Public page for link-based invites
- Shows party name and inviter
- Prompts signup/login if not authenticated
- Adds user to party on acceptance

### 4.4 Invite System Implementation

Create `src/lib/invites.ts`:

```typescript
// Functions:
- generateInviteLink(partyId: string): string
- sendEmailInvite(partyId: string, email: string): Promise<void>
- sendSmsInvite(partyId: string, phone: string): Promise<void>
- acceptInvite(token: string): Promise<void>
- getInviteByToken(token: string): Promise<PartyInvite | null>
```

API routes:
- `POST /api/invites/send` - Send email/SMS invite
- `GET /api/invites/[token]` - Get invite details
- `POST /api/invites/[token]/accept` - Accept invite

---

## Phase 5: Integration & Polish

### 5.1 Connect Calculator to Parties

Update calculator to:
- Save calculator state to party when user is in a party
- Load shared calculator state from party
- Real-time sync via Supabase Realtime (optional enhancement)

### 5.2 Auth Provider Context

Create `src/providers/AuthProvider.tsx`:

- Wraps app with auth context
- Provides user, profile, loading state globally
- Handles auth state changes

Update `src/app/layout.tsx` to include AuthProvider.

### 5.3 Protected Routes

Create `src/components/auth/ProtectedRoute.tsx`:

- Redirects to login if not authenticated
- Shows loading state while checking auth
- Passes user/profile to children

### 5.4 Update Navigation

Update `src/components/layout/Navbar.tsx`:

- Show user avatar/name when logged in
- Dropdown menu: Dashboard, Settings, Sign Out
- Show Sign In/Sign Up when logged out

---

## Implementation Order

| Order | Task | Estimated Effort |
|-------|------|------------------|
| 1 | Database schema (Phase 1.1) | 1 hour |
| 2 | Server client & middleware (Phase 1.2-1.3) | 1 hour |
| 3 | Enhanced useAuth with social logins (Phase 2) | 2 hours |
| 4 | Auth callback & OAuth config (Phase 2.2-2.3) | 1 hour |
| 5 | User types (Phase 3.1) | 30 min |
| 6 | useProfile hook (Phase 3.2) | 1 hour |
| 7 | AuthProvider context (Phase 5.2) | 1 hour |
| 8 | Dashboard page (Phase 3.3) | 2 hours |
| 9 | Profile settings page (Phase 3.4) | 1.5 hours |
| 10 | useBuyingParties hook (Phase 4.1) | 1.5 hours |
| 11 | usePartyMembers hook (Phase 4.2) | 1.5 hours |
| 12 | Party list page (Phase 4.3) | 1.5 hours |
| 13 | Party detail page (Phase 4.3) | 2 hours |
| 14 | Invite system (Phase 4.4) | 3 hours |
| 15 | Accept invite page (Phase 4.3) | 1.5 hours |
| 16 | Navbar updates (Phase 5.4) | 1 hour |
| 17 | Protected routes (Phase 5.3) | 1 hour |
| 18 | Calculator-party integration (Phase 5.1) | 2 hours |

**Total: ~24 hours of implementation**

---

## Files to Create/Modify

### New Files
```
supabase/
  migrations/
    001_initial_schema.sql

src/
  middleware.ts
  lib/
    supabase-server.ts
    invites.ts
  types/
    user.ts
  hooks/
    useProfile.ts
    useBuyingParties.ts
    usePartyMembers.ts
  providers/
    AuthProvider.tsx
  components/
    auth/
      ProtectedRoute.tsx
      AuthModal.tsx (enhanced signup/login modal)
  app/
    auth/
      callback/
        route.ts
    dashboard/
      page.tsx
    settings/
      profile/
        page.tsx
    parties/
      page.tsx
      [id]/
        page.tsx
    invite/
      [token]/
        page.tsx
    api/
      invites/
        send/
          route.ts
        [token]/
          route.ts
```

### Modified Files
```
src/
  hooks/
    useAuth.ts (add social logins, profile integration)
  components/
    layout/
      Navbar.tsx (add auth state UI)
    calc/
      SignupOverlay.tsx (add social login buttons)
  app/
    layout.tsx (add AuthProvider)
```

---

## Environment Variables Needed

Add to `.env.local`:
```
# Supabase (already documented)
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # for server-side admin ops

# OAuth (configured in Supabase dashboard, not in env)
# Google and Apple OAuth credentials are set in Supabase Dashboard
```

---

## Supabase Dashboard Configuration

After deploying the schema, manually configure:

1. **Authentication > Providers**
   - Enable Email (already enabled)
   - Enable Phone (requires Twilio setup)
   - Enable Google OAuth
   - Enable Apple OAuth

2. **Authentication > URL Configuration**
   - Site URL: `https://livetomi.com` (or localhost for dev)
   - Redirect URLs: Add `/auth/callback`

3. **Storage** (for Phase 2+ - avatars, documents)
   - Create `avatars` bucket (public)
   - Create `documents` bucket (private, RLS)

---

## Success Criteria

Phase 1-2 Complete:
- [ ] Users can sign up via email OTP
- [ ] Users can sign up via phone OTP
- [ ] Users can sign up via Google
- [ ] Users can sign up via Apple
- [ ] User profile auto-created on signup

Phase 3 Complete:
- [ ] Users can view/edit their profile
- [ ] Users can upload avatar
- [ ] Dashboard shows user's parties

Phase 4 Complete:
- [ ] Users can create buying parties
- [ ] Users can invite via email
- [ ] Users can invite via SMS
- [ ] Users can invite via shareable link
- [ ] Invited users can accept and join parties
- [ ] Party admins can manage members

Phase 5 Complete:
- [ ] Calculator state syncs with party
- [ ] Navbar shows auth state
- [ ] Protected routes work correctly

---

## Questions Before Starting

1. **Supabase Project**: Do you have a Supabase project created? If not, I can guide you through setup.

2. **OAuth Credentials**: Do you have Google/Apple developer accounts for OAuth setup, or should we start with email/phone only and add social later?

3. **SMS Provider**: Supabase uses Twilio for SMS. Do you have a Twilio account, or should we defer phone auth to later?

4. **Domain**: What domain should OAuth redirect to? (localhost:3000 for dev is fine to start)

5. **Priority**: Would you prefer I start with the full schema + core auth (Phases 1-2), or jump straight to a minimal viable signup flow and iterate?
