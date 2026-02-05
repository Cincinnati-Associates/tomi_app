-- ============================================
-- HOMI CHAT SYSTEM
-- Visitor tracking, chat history, and user linking
-- ============================================

-- Enable pgvector extension for embeddings
create extension if not exists vector with schema extensions;

-- ============================================
-- VISITOR SESSIONS (Anonymous pre-signup users)
-- Stores summarized context, NOT full transcripts
-- ============================================
create type public.visitor_stage as enum ('explorer', 'evaluator', 'ready', 'calculated');

create table public.visitor_sessions (
  id uuid default gen_random_uuid() primary key,

  -- Identifiers (from localStorage visitor context)
  visitor_id uuid not null,  -- Persistent across sessions
  session_id uuid not null,  -- Per-session

  -- Identity (first name only, captured through chat)
  first_name text,
  identity_confirmed boolean default false,

  -- Journey stage
  stage public.visitor_stage default 'explorer' not null,

  -- Volunteered info (bucketed, non-PII)
  volunteered_info jsonb default '{}'::jsonb,
  -- Example: { "metroArea": "Bay Area", "incomeRange": "100-150k", "coBuyerCount": 2, "timeline": "6 months" }

  -- Behavioral metrics
  behavior jsonb default '{}'::jsonb,
  -- Example: { "pagesVisited": [...], "calculatorCompleted": true, "chatMessagesCount": 5, "topicsDiscussed": [...] }

  -- Chat summary (AI-generated, not full transcript)
  chat_summary text,
  chat_topics text[],  -- Array of topics discussed
  chat_sentiment text,  -- Overall sentiment: positive, neutral, cautious, skeptical
  qualification_signals jsonb default '{}'::jsonb,
  -- Example: { "hasCobuyers": true, "budgetMentioned": true, "timelineUrgent": false, "concernsAddressed": ["exit-strategy"] }

  -- Timestamps
  first_seen timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Link to user if they sign up
  linked_user_id uuid references public.profiles(id) on delete set null,
  linked_at timestamp with time zone
);

-- Index for efficient lookups
create index idx_visitor_sessions_visitor_id on public.visitor_sessions(visitor_id);
create index idx_visitor_sessions_linked_user on public.visitor_sessions(linked_user_id);
create index idx_visitor_sessions_stage on public.visitor_sessions(stage);
create index idx_visitor_sessions_last_seen on public.visitor_sessions(last_seen);

-- No RLS needed - accessed via service role from API routes
-- This table contains no sensitive PII

-- ============================================
-- CHAT CONVERSATIONS (For authenticated users)
-- Full transcript storage with embeddings support
-- ============================================
create table public.chat_conversations (
  id uuid default gen_random_uuid() primary key,

  -- Owner (authenticated user)
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- Optional link to buying party context
  party_id uuid references public.buying_parties(id) on delete set null,

  -- Conversation metadata
  title text,  -- Auto-generated or user-defined
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  message_count integer default 0 not null,

  -- Analytics
  topics_discussed text[],
  sentiment text,

  -- Summarized context for embeddings/RAG
  summary text,
  summary_embedding extensions.vector(1536),  -- OpenAI ada-002 embedding dimension

  -- Status
  is_archived boolean default false not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for conversations
alter table public.chat_conversations enable row level security;

create policy "Users can view own conversations" on public.chat_conversations
  for select using (auth.uid() = user_id);

create policy "Users can create own conversations" on public.chat_conversations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations" on public.chat_conversations
  for update using (auth.uid() = user_id);

create policy "Users can delete own conversations" on public.chat_conversations
  for delete using (auth.uid() = user_id);

-- Indexes
create index idx_chat_conversations_user_id on public.chat_conversations(user_id);
create index idx_chat_conversations_party_id on public.chat_conversations(party_id);
create index idx_chat_conversations_last_message on public.chat_conversations(last_message_at desc);

-- ============================================
-- CHAT MESSAGES (Full transcript for auth users)
-- ============================================
create type public.chat_role as enum ('user', 'assistant', 'system');

create table public.chat_messages (
  id uuid default gen_random_uuid() primary key,

  conversation_id uuid references public.chat_conversations(id) on delete cascade not null,

  -- Message content
  role public.chat_role not null,
  content text not null,

  -- Optional metadata
  metadata jsonb default '{}'::jsonb,
  -- Example: { "model": "gemini-2.0-flash", "tokens": 150, "latency_ms": 450 }

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for messages (inherit from conversation)
alter table public.chat_messages enable row level security;

create policy "Users can view messages in own conversations" on public.chat_messages
  for select using (
    conversation_id in (
      select id from public.chat_conversations where user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations" on public.chat_messages
  for insert with check (
    conversation_id in (
      select id from public.chat_conversations where user_id = auth.uid()
    )
  );

-- Indexes
create index idx_chat_messages_conversation_id on public.chat_messages(conversation_id);
create index idx_chat_messages_created_at on public.chat_messages(created_at);

-- ============================================
-- VISITOR-USER LINKING
-- Track which anonymous visitors became users
-- ============================================
create table public.visitor_user_links (
  id uuid default gen_random_uuid() primary key,

  visitor_id uuid not null,  -- From visitor_sessions.visitor_id
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- What was merged
  merged_context jsonb,  -- Snapshot of visitor context at merge time

  linked_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(visitor_id, user_id)
);

-- Index for lookups
create index idx_visitor_user_links_visitor on public.visitor_user_links(visitor_id);
create index idx_visitor_user_links_user on public.visitor_user_links(user_id);

-- RLS
alter table public.visitor_user_links enable row level security;

create policy "Users can view own links" on public.visitor_user_links
  for select using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to merge visitor session to user on signup
create or replace function public.merge_visitor_to_user(
  p_visitor_id uuid,
  p_user_id uuid
) returns void as $$
declare
  v_session record;
begin
  -- Get the most recent visitor session
  select * into v_session
  from public.visitor_sessions
  where visitor_id = p_visitor_id
  order by last_seen desc
  limit 1;

  if v_session is null then
    return;
  end if;

  -- Update visitor session with user link
  update public.visitor_sessions
  set linked_user_id = p_user_id,
      linked_at = now()
  where visitor_id = p_visitor_id;

  -- Create link record
  insert into public.visitor_user_links (visitor_id, user_id, merged_context)
  values (
    p_visitor_id,
    p_user_id,
    jsonb_build_object(
      'firstName', v_session.first_name,
      'stage', v_session.stage,
      'volunteeredInfo', v_session.volunteered_info,
      'behavior', v_session.behavior,
      'chatSummary', v_session.chat_summary,
      'chatTopics', v_session.chat_topics
    )
  )
  on conflict (visitor_id, user_id) do nothing;

  -- Update user profile with first name if not set
  update public.profiles
  set full_name = coalesce(full_name, v_session.first_name),
      updated_at = now()
  where id = p_user_id
    and full_name is null
    and v_session.first_name is not null;
end;
$$ language plpgsql security definer;

-- Function to update conversation summary (called async after messages)
create or replace function public.update_conversation_stats(
  p_conversation_id uuid
) returns void as $$
begin
  update public.chat_conversations
  set message_count = (
        select count(*) from public.chat_messages
        where conversation_id = p_conversation_id
      ),
      last_message_at = (
        select max(created_at) from public.chat_messages
        where conversation_id = p_conversation_id
      ),
      updated_at = now()
  where id = p_conversation_id;
end;
$$ language plpgsql security definer;

-- Trigger to update conversation stats on new message
create or replace function public.handle_new_chat_message()
returns trigger as $$
begin
  perform public.update_conversation_stats(NEW.conversation_id);
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_chat_message_inserted
  after insert on public.chat_messages
  for each row execute function public.handle_new_chat_message();

-- ============================================
-- ENABLE VECTOR EXTENSION (for embeddings)
-- ============================================
-- Note: Run this separately if pgvector isn't enabled:
-- create extension if not exists vector;
