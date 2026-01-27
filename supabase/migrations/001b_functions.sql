-- ============================================
-- PART 2: FUNCTIONS AND TRIGGERS
-- Run this second (after 001a)
-- ============================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
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
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

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
returns public.buying_parties
language plpgsql
security definer
as $$
declare
  new_party public.buying_parties;
begin
  insert into public.buying_parties (name, created_by, target_city, target_budget)
  values (party_name, auth.uid(), target_city, target_budget)
  returning * into new_party;

  insert into public.party_members (party_id, user_id, role, invite_status)
  values (new_party.id, auth.uid(), 'admin', 'accepted');

  return new_party;
end;
$$;

-- Function to generate invite link token
create or replace function public.create_invite_link(
  p_party_id uuid,
  p_role public.member_role default 'member',
  p_expires_in_days integer default 7
)
returns public.party_invites
language plpgsql
security definer
as $$
declare
  new_invite public.party_invites;
  invite_token text;
begin
  invite_token := encode(gen_random_bytes(32), 'hex');

  insert into public.party_invites (party_id, invite_type, invite_value, invited_by, role, expires_at)
  values (p_party_id, 'link', invite_token, auth.uid(), p_role, now() + (p_expires_in_days || ' days')::interval)
  returning * into new_invite;

  return new_invite;
end;
$$;

-- Function to accept an invite by token
create or replace function public.accept_invite(p_token text)
returns public.party_members
language plpgsql
security definer
as $$
declare
  v_invite public.party_invites;
  new_member public.party_members;
begin
  select * into v_invite
  from public.party_invites
  where invite_value = p_token
    and invite_type = 'link'
    and accepted_at is null
    and expires_at > now();

  if v_invite is null then
    raise exception 'Invalid or expired invite';
  end if;

  update public.party_invites
  set accepted_at = now(), accepted_by = auth.uid()
  where id = v_invite.id;

  insert into public.party_members (party_id, user_id, role, invite_status)
  values (v_invite.party_id, auth.uid(), v_invite.role, 'accepted')
  on conflict (party_id, user_id) do update set invite_status = 'accepted'
  returning * into new_member;

  return new_member;
end;
$$;
