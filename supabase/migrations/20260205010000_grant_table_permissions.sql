-- ============================================
-- GRANT TABLE PERMISSIONS
-- Supabase requires explicit GRANT statements
-- for the anon and authenticated roles to
-- access tables through the PostgREST API.
-- RLS policies provide row-level filtering,
-- but table-level SELECT/INSERT/UPDATE/DELETE
-- permissions must also be granted.
-- ============================================

-- Profiles
grant select, insert, update on public.profiles to anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

-- Buying Parties
grant select, insert, update, delete on public.buying_parties to authenticated;
grant select, insert, update, delete on public.buying_parties to service_role;

-- Party Members
grant select, insert, update, delete on public.party_members to authenticated;
grant select, insert, update, delete on public.party_members to service_role;

-- Party Invites
grant select, insert, update, delete on public.party_invites to authenticated;
grant select, insert, update, delete on public.party_invites to service_role;

-- Leads (service role only for writes, anon for insert via API)
grant insert on public.leads to anon;
grant insert on public.leads to authenticated;
grant select, insert, update, delete on public.leads to service_role;

-- Visitor Sessions
grant select, insert, update on public.visitor_sessions to anon;
grant select, insert, update on public.visitor_sessions to authenticated;
grant select, insert, update, delete on public.visitor_sessions to service_role;

-- Chat Conversations
grant select, insert, update on public.chat_conversations to authenticated;
grant select, insert, update, delete on public.chat_conversations to service_role;

-- Chat Messages
grant select, insert on public.chat_messages to authenticated;
grant select, insert, update, delete on public.chat_messages to service_role;
