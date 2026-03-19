-- Add invited_email to party_invites so we can look up pending invites by email
-- (without depending on the email_sends table)
ALTER TABLE "party_invites" ADD COLUMN "invited_email" VARCHAR(255);

CREATE INDEX idx_party_invites_email ON party_invites(invited_email);
