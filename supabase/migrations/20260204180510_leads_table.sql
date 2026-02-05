-- ============================================
-- LEADS TABLE
-- Captures email from assessment and other entry points
-- ============================================

create type public.lead_source as enum ('assessment', 'calculator', 'chat', 'newsletter', 'other');

create table public.leads (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  source public.lead_source not null,

  -- Assessment-specific data
  assessment_grade text,
  assessment_score integer,
  assessment_answers jsonb,

  -- Context
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,

  -- Tracking
  notified_at timestamp with time zone,
  converted_to_user_id uuid references public.profiles(id) on delete set null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for email lookups and deduplication
create unique index idx_leads_email_source on public.leads(email, source);
create index idx_leads_created_at on public.leads(created_at desc);
create index idx_leads_source on public.leads(source);
create index idx_leads_assessment_grade on public.leads(assessment_grade);

-- RLS: Leads table should only be accessible via service role (API routes)
alter table public.leads enable row level security;

-- No public policies - only service role can access
-- This keeps lead data private and only accessible through API routes
