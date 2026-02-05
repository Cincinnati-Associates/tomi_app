-- Migration: Add trigger to auto-create user_journeys on profile creation
-- PRD-002: Journey initialization on signup

-- Create function to auto-create journey when profile is created
CREATE OR REPLACE FUNCTION create_user_journey()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new journey record for the user
  INSERT INTO user_journeys (user_id, stage, readiness_score)
  VALUES (NEW.id, 'exploring', 0)
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicates if trigger fires multiple times

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles table (fires after insert)
DROP TRIGGER IF EXISTS on_profile_created_create_journey ON profiles;

CREATE TRIGGER on_profile_created_create_journey
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_journey();

-- Also backfill existing profiles that don't have journeys
INSERT INTO user_journeys (user_id, stage, readiness_score)
SELECT p.id, 'exploring', 0
FROM profiles p
LEFT JOIN user_journeys uj ON uj.user_id = p.id
WHERE uj.id IS NULL;
