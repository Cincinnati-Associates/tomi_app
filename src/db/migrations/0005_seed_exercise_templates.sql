-- Migration: Seed exercise templates for Phases 0-2 + RLS policies
-- This unblocks the entire exercise save/load pipeline.

-- Seed exercise templates
INSERT INTO exercise_templates (slug, name, description, category, journey_stages, schema, scoring_rules, display_order, is_required, estimated_minutes, is_active)
VALUES
  ('gems_discovery', 'GEMs Discovery', 'Discover your Goals, Expectations & Motivations for co-ownership', 'individual', '["exploring","educating"]', '{}', '{"readinessWeight": 20, "maxScore": 100}', 1, true, 5, true),
  ('roadmap_walkthrough', 'What to Expect', 'A guided walkthrough of the co-buying journey from start to finish', 'individual', '["educating"]', '{}', '{"readinessWeight": 15, "maxScore": 100}', 2, true, 8, true),
  ('cobuyer_candidate_assessment', 'Co-Buyer Assessment', 'Privately evaluate a potential co-ownership partner across 7 dimensions', 'individual', '["preparing"]', '{}', '{"readinessWeight": 25, "maxScore": 100}', 3, false, 10, true)
ON CONFLICT (slug) DO NOTHING;

-- RLS policies for exercise_templates (read-only for authenticated users)
CREATE POLICY "Authenticated users can read active templates"
  ON exercise_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

-- RLS policies for user_exercise_responses
CREATE POLICY "Users can read their own responses"
  ON user_exercise_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own responses"
  ON user_exercise_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own responses"
  ON user_exercise_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());
