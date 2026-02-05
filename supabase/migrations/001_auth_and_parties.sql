-- ============================================
-- TOMI AUTH & BUYING PARTIES SCHEMA
-- Migration: 001_auth_and_parties
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

comment on table public.profiles is 'User profiles extending Supabase auth.users';

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
create type public.party_status as enum ('forming', 'active', 'under_contract', 'closed', 'archived');

create table public.buying_parties (
  id uuid default uuid_generate_v4() primary key,
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

comment on table public.buying_parties is 'Co-buying groups (2-6 users working together to purchase a home)';

alter table public.buying_parties enable row level security;

-- ============================================
-- PARTY MEMBERS TABLE (junction table)
-- ============================================
create type public.member_role as enum ('admin', 'member');
create type public.invite_status as enum ('pending', 'accepted', 'declined');

create table public.party_members (
  id uuid default uuid_generate_v4() primary key,
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

comment on table public.party_members is 'Junction table linking users to buying parties with roles';

alter table public.party_members enable row level security;

-- Members can view their own membership
create policy "Members can view own membership" on public.party_members
  for select using (auth.uid() = user_id);

-- Members can view other members in their parties
create policy "Members can view party members" on public.party_members
  for select using (
    party_id in (
      select party_id from public.party_members where user_id = auth.uid()
    )
  );

-- Users can add themselves (via invite acceptance)
create policy "Users can add themselves via invite" on public.party_members
  for insert with check (auth.uid() = user_id);

-- Party admins can insert new members
create policy "Admins can add members" on public.party_members
  for insert with check (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
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

-- Party admins can remove members
create policy "Admins can remove members" on public.party_members
  for delete using (
    exists (
      select 1 from public.party_members pm
      where pm.party_id = party_members.party_id
      and pm.user_id = auth.uid()
      and pm.role = 'admin'
    )
    or auth.uid() = user_id -- users can remove themselves
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
  id uuid default uuid_generate_v4() primary key,
  party_id uuid references public.buying_parties(id) on delete cascade not null,
  invite_type public.invite_type not null,
  invite_value text not null, -- email, phone, or token for links
  invited_by uuid references public.profiles(id) on delete set null,
  role public.member_role default 'member' not null,
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  accepted_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

comment on table public.party_invites is 'Invitations to join buying parties (email, SMS, or shareable link)';

alter table public.party_invites enable row level security;

-- Anyone can view link-based invites by token (for accepting)
create policy "Anyone can view link invites by token" on public.party_invites
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

-- Admins can delete invites
create policy "Admins can delete invites" on public.party_invites
  for delete using (
    exists (
      select 1 from public.party_members
      where party_id = party_invites.party_id
      and user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Authenticated users can accept invites (update accepted_at)
create policy "Users can accept invites" on public.party_invites
  for update using (auth.uid() is not null and accepted_at is null);

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

-- Drop trigger if exists (for idempotency)
drop trigger if exists on_auth_user_created on auth.users;

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

-- Function to create a party and add creator as admin
create or replace function public.create_party_with_admin(
  party_name text,
  target_city text default null,
  target_budget numeric default null
)
returns public.buying_parties as $$
declare
  new_party public.buying_parties;
begin
  -- Create the party
  insert into public.buying_parties (name, created_by, target_city, target_budget)
  values (party_name, auth.uid(), target_city, target_budget)
  returning * into new_party;

  -- Add creator as admin
  insert into public.party_members (party_id, user_id, role, invite_status)
  values (new_party.id, auth.uid(), 'admin', 'accepted');

  return new_party;
end;
$$ language plpgsql security definer;

-- Function to generate invite link token
create or replace function public.create_invite_link(
  p_party_id uuid,
  p_role public.member_role default 'member',
  p_expires_in_days integer default 7
)
returns public.party_invites as $$
declare
  new_invite public.party_invites;
  invite_token text;
begin
  -- Generate a random token
  invite_token := encode(gen_random_bytes(32), 'hex');

  -- Create the invite
  insert into public.party_invites (party_id, invite_type, invite_value, invited_by, role, expires_at)
  values (p_party_id, 'link', invite_token, auth.uid(), p_role, now() + (p_expires_in_days || ' days')::interval)
  returning * into new_invite;

  return new_invite;
end;
$$ language plpgsql security definer;

-- Function to accept an invite by token
create or replace function public.accept_invite(p_token text)
returns public.party_members as $$
declare
  v_invite public.party_invites;
  new_member public.party_members;
begin
  -- Find the invite
  select * into v_invite
  from public.party_invites
  where invite_value = p_token
    and invite_type = 'link'
    and accepted_at is null
    and expires_at > now();

  if v_invite is null then
    raise exception 'Invalid or expired invite';
  end if;

  -- Mark invite as accepted
  update public.party_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  -- Add user to party
  insert into public.party_members (party_id, user_id, role, invite_status)
  values (v_invite.party_id, auth.uid(), v_invite.role, 'accepted')
  on conflict (party_id, user_id) do update set invite_status = 'accepted'
  returning * into new_member;

  return new_member;
end;
$$ language plpgsql security definer;

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
