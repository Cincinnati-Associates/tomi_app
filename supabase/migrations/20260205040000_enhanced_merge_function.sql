-- ============================================
-- ENHANCED merge_visitor_to_user() FUNCTION
-- Now also hydrates user_journeys from visitor
-- volunteered info and assessment data.
-- ============================================

CREATE OR REPLACE FUNCTION public.merge_visitor_to_user(
  p_visitor_id uuid,
  p_user_id uuid,
  p_assessment_data jsonb DEFAULT NULL
) RETURNS void AS $$
DECLARE
  v_session record;
  v_vol jsonb;
  v_journey_stage public.journey_stage;
  v_readiness integer;
BEGIN
  -- Get the most recent visitor session
  SELECT * INTO v_session
  FROM public.visitor_sessions
  WHERE visitor_id = p_visitor_id
  ORDER BY last_seen DESC
  LIMIT 1;

  IF v_session IS NULL THEN
    RETURN;
  END IF;

  -- Link all visitor sessions to user
  UPDATE public.visitor_sessions
  SET linked_user_id = p_user_id,
      linked_at = now()
  WHERE visitor_id = p_visitor_id;

  -- Create link record with full snapshot
  INSERT INTO public.visitor_user_links (visitor_id, user_id, merged_context)
  VALUES (
    p_visitor_id,
    p_user_id,
    jsonb_build_object(
      'firstName', v_session.first_name,
      'stage', v_session.stage,
      'volunteeredInfo', v_session.volunteered_info,
      'behavior', v_session.behavior,
      'chatSummary', v_session.chat_summary,
      'chatTopics', v_session.chat_topics,
      'assessmentData', p_assessment_data
    )
  )
  ON CONFLICT (visitor_id, user_id) DO UPDATE
  SET merged_context = EXCLUDED.merged_context,
      linked_at = now();

  -- Update profile name if not set
  UPDATE public.profiles
  SET full_name = COALESCE(full_name, v_session.first_name),
      updated_at = now()
  WHERE id = p_user_id
    AND full_name IS NULL
    AND v_session.first_name IS NOT NULL;

  -- Map visitor stage to journey stage
  v_journey_stage := CASE
    WHEN v_session.stage IN ('calculated', 'ready') THEN 'preparing'::public.journey_stage
    WHEN v_session.stage = 'evaluator' THEN 'educating'::public.journey_stage
    ELSE 'exploring'::public.journey_stage
  END;

  -- Calculate initial readiness from assessment if available
  v_readiness := CASE
    WHEN p_assessment_data IS NOT NULL AND (p_assessment_data->>'score') IS NOT NULL
    THEN LEAST(100, ROUND((p_assessment_data->>'score')::numeric * 100 / 36))::integer
    ELSE 0
  END;

  -- Hydrate volunteered info
  v_vol := COALESCE(v_session.volunteered_info, '{}'::jsonb);

  -- Create or update user_journeys
  INSERT INTO public.user_journeys (
    user_id,
    stage,
    readiness_score,
    target_timeline,
    target_markets,
    co_buyer_status
  ) VALUES (
    p_user_id,
    v_journey_stage,
    v_readiness,
    v_vol->>'timeline',
    CASE
      WHEN v_vol->>'metroArea' IS NOT NULL
      THEN jsonb_build_array(v_vol->>'metroArea')
      ELSE '[]'::jsonb
    END,
    CASE
      WHEN (v_vol->>'hasSpecificCoBuyers')::boolean = true THEN 'has_cobuyers'
      WHEN (v_vol->>'coBuyerCount')::int > 0 THEN 'has_cobuyers'
      ELSE NULL
    END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    -- Only update null fields (don't overwrite user-set values)
    stage = CASE
      WHEN public.user_journeys.stage = 'exploring' THEN EXCLUDED.stage
      ELSE public.user_journeys.stage
    END,
    readiness_score = CASE
      WHEN public.user_journeys.readiness_score = 0 THEN EXCLUDED.readiness_score
      ELSE public.user_journeys.readiness_score
    END,
    target_timeline = COALESCE(public.user_journeys.target_timeline, EXCLUDED.target_timeline),
    target_markets = CASE
      WHEN public.user_journeys.target_markets = '[]'::jsonb THEN EXCLUDED.target_markets
      ELSE public.user_journeys.target_markets
    END,
    co_buyer_status = COALESCE(public.user_journeys.co_buyer_status, EXCLUDED.co_buyer_status),
    updated_at = now();

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
