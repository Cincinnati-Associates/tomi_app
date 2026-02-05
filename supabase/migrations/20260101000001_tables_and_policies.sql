-- ============================================
-- PART 1: TABLES, TYPES, AND POLICIES
-- Run this first
-- ============================================

-- Enable UUID extension (if not already enabled)
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

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- ============================================
-- BUYING PARTIES TABLE (groups)
-- ============================================
create type public.party_status as enum ('forming', 'active', 'under_contract', 'closed', 'archived');

create table public.buying_parties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  status public.party_status default 'forming' not null,
  created_by uuid references public.profiles(id) on delete set null,
  calculator_state jsonb,
  target_city text,
  target_budget numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.buying_parties enable row level security;

-- ============================================
-- PARTY MEMBERS TABLE (junction table)
-- ============================================
create type public.member_role as enum ('admin', 'member');
create type public.invite_status as enum ('pending', 'accepted', 'declined');

create table public.party_members (
  id uuid default gen_random_uuid() primary key,
  party_id uuid references public.buying_parties(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role public.member_role default 'member' not null,
  invite_status public.invite_status default 'accepted' not null,
  ownership_percentage numeric,
  down_payment_contribution numeric,
  monthly_contribution numeric,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(party_id, user_id)
);

alter table public.party_members enable row level security;

create policy "Members can view own membership" on public.party_members
  for select using (auth.uid() = user_id);

create policy "Members can view party members" on public.party_members
  for select using (
    party_id in (
      select party_id from public.party_members where user_id = auth.uid()
    )
  );

create policy "Users can add themselves via invite" on public.party_members
  for insert with check (auth.uid() = user_id);

create policy "Admins can add members" on public.party_members
  for insert with check (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
  );

create policy "Admins can update members" on public.party_members
  for update using (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_members.party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
  );

create policy "Admins can remove members" on public.party_members
  for delete using (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_members.party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
    or auth.uid() = user_id
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

create policy "Admins can delete parties" on public.buying_parties
  for delete using (
    id in (
      select party_id from public.party_members
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ============================================
-- PARTY INVITES TABLE (flexible invites)
-- ============================================
create type public.invite_type as enum ('email', 'sms', 'link');

create table public.party_invites (
  id uuid default gen_random_uuid() primary key,
  party_id uuid references public.buying_parties(id) on delete cascade not null,
  invite_type public.invite_type not null,
  invite_value text not null,
  invited_by uuid references public.profiles(id) on delete set null,
  role public.member_role default 'member' not null,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.party_invites enable row level security;

create policy "Anyone can view link invites by token" on public.party_invites
  for select using (invite_type = 'link');

create policy "Members can view party invites" on public.party_invites
  for select using (
    party_id in (select party_id from public.party_members where user_id = auth.uid())
  );

create policy "Admins can create invites" on public.party_invites
  for insert with check (
    exists (
      select 1 from public.party_members
      where party_id = party_invites.party_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Admins can delete invites" on public.party_invites
  for delete using (
    exists (
      select 1 from public.party_members
      where party_id = party_invites.party_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

create policy "Users can accept invites" on public.party_invites
  for update using (auth.uid() is not null and accepted_at is null);

-- ============================================
-- INDEXES
-- ============================================
create index idx_profiles_email on public.profiles(email);
create index idx_profiles_phone on public.profiles(phone);
create index idx_party_members_user_id on public.party_members(user_id);
create index idx_party_members_party_id on public.party_members(party_id);
create index idx_party_invites_party_id on public.party_invites(party_id);
create index idx_party_invites_value on public.party_invites(invite_value);
create index idx_party_invites_expires on public.party_invites(expires_at);
create index idx_buying_parties_status on public.buying_parties(status);
create index idx_buying_parties_created_by on public.buying_parties(created_by);
