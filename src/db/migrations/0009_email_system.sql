-- =============================================================================
-- 0009: Email System
-- Adds email_sends (audit log) and email_sequences (scheduled/drip emails)
-- =============================================================================

-- Enums
CREATE TYPE email_send_status AS ENUM (
  'pending', 'sent', 'failed', 'skipped',
  'bounced', 'delivered', 'opened', 'clicked'
);

CREATE TYPE email_sequence_status AS ENUM (
  'scheduled', 'sent', 'cancelled', 'skipped'
);

-- =============================================================================
-- email_sends — audit log for every send attempt
-- =============================================================================

CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type VARCHAR(100) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  from_address VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_email VARCHAR(255),
  status email_send_status NOT NULL DEFAULT 'pending',
  resend_id VARCHAR(255),
  error_message TEXT,
  idempotency_key VARCHAR(255),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_email_sends_type ON email_sends(email_type);
CREATE INDEX idx_email_sends_to ON email_sends(to_address);
CREATE INDEX idx_email_sends_user ON email_sends(user_id);
CREATE INDEX idx_email_sends_status ON email_sends(status);
CREATE INDEX idx_email_sends_resend_id ON email_sends(resend_id);
CREATE UNIQUE INDEX idx_email_sends_idempotency ON email_sends(idempotency_key);
CREATE INDEX idx_email_sends_created ON email_sends(created_at);

-- =============================================================================
-- email_sequences — scheduled/drip emails
-- =============================================================================

CREATE TABLE email_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type VARCHAR(100) NOT NULL,
  to_address VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  lead_email VARCHAR(255),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status email_sequence_status NOT NULL DEFAULT 'scheduled',
  cancel_condition JSONB,
  template_data JSONB,
  email_send_id UUID REFERENCES email_sends(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_email_sequences_type ON email_sequences(email_type);
CREATE INDEX idx_email_sequences_status ON email_sequences(status);
CREATE INDEX idx_email_sequences_scheduled ON email_sequences(scheduled_for);
CREATE INDEX idx_email_sequences_to ON email_sequences(to_address);
CREATE INDEX idx_email_sequences_user ON email_sequences(user_id);

-- =============================================================================
-- RLS Policies (admin-only access)
-- =============================================================================

ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) can do everything
CREATE POLICY "service_role_all_email_sends"
  ON email_sends FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service_role_all_email_sequences"
  ON email_sequences FOR ALL
  USING (auth.role() = 'service_role');

-- Users can see their own email history
CREATE POLICY "users_read_own_email_sends"
  ON email_sends FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_read_own_email_sequences"
  ON email_sequences FOR SELECT
  USING (auth.uid() = user_id);
