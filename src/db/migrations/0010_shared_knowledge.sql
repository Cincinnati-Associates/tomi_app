-- Party Member Shared Data
-- Tracks explicit opt-in data sharing from individual → group context.
-- The group Homi ONLY reads rows where revoked_at IS NULL.
-- See: docs/GROUP_KNOWLEDGE_ARCHITECTURE.md

CREATE TABLE IF NOT EXISTS party_member_shared_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_member_id UUID NOT NULL REFERENCES party_members(id) ON DELETE CASCADE,
  data_key TEXT NOT NULL,
  data_value JSONB NOT NULL,
  shared_via TEXT NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,

  -- One active share per member per data key
  CONSTRAINT shared_data_member_key_active UNIQUE (party_member_id, data_key)
);

CREATE INDEX idx_shared_data_party_member ON party_member_shared_data(party_member_id);
CREATE INDEX idx_shared_data_key ON party_member_shared_data(data_key);

-- RLS Policies
ALTER TABLE party_member_shared_data ENABLE ROW LEVEL SECURITY;

-- Members can read shared data for their own parties
CREATE POLICY "Members can read own party shared data"
  ON party_member_shared_data
  FOR SELECT
  USING (
    party_member_id IN (
      SELECT pm.id FROM party_members pm
      WHERE pm.party_id IN (
        SELECT pm2.party_id FROM party_members pm2
        WHERE pm2.user_id = auth.uid()
        AND pm2.invite_status = 'accepted'
      )
    )
  );

-- Members can only insert/update/delete their own shared data
CREATE POLICY "Members can manage own shared data"
  ON party_member_shared_data
  FOR ALL
  USING (
    party_member_id IN (
      SELECT pm.id FROM party_members pm
      WHERE pm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    party_member_id IN (
      SELECT pm.id FROM party_members pm
      WHERE pm.user_id = auth.uid()
    )
  );
