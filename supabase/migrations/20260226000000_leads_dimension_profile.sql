-- ============================================
-- ADD DIMENSION PROFILE & CUSTOM ANSWERS TO LEADS
-- Stores assessment dimension profiling data
-- and free-text answers from the redesigned assessment.
-- ============================================

alter table public.leads
  add column assessment_dimension_profile jsonb,
  add column assessment_custom_answers jsonb;

comment on column public.leads.assessment_dimension_profile is 'Dimension profile (financial, emotional, legal, knowledge, relational) computed from assessment answers';
comment on column public.leads.assessment_custom_answers is 'Free-text answers the user typed instead of selecting a preset option';
