-- WHS (Work Health & Safety) module
-- Run against Neon PostgreSQL after schema.sql

-- Employment contract template stored per org
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS employment_contract_html TEXT;

-- WHS form submissions
CREATE TABLE IF NOT EXISTS whs_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id        TEXT NOT NULL,
  form_version   TEXT NOT NULL DEFAULT '1',
  submitted_by   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'signed')),
  stage          TEXT NOT NULL DEFAULT 'operational'
    CHECK (stage IN ('onboarding', 'operational')),
  answers        JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whs_sub_org       ON whs_submissions(org_id);
CREATE INDEX IF NOT EXISTS idx_whs_sub_user      ON whs_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_whs_sub_form      ON whs_submissions(org_id, form_id);
CREATE INDEX IF NOT EXISTS idx_whs_sub_status    ON whs_submissions(org_id, status);

-- Immutable signature records (no UPDATE/DELETE allowed at app layer)
CREATE TABLE IF NOT EXISTS whs_signatures (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id         UUID NOT NULL REFERENCES whs_submissions(id) ON DELETE CASCADE,
  org_id                UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  form_id               TEXT NOT NULL,
  form_version          TEXT NOT NULL,
  user_id               TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_at_signing       user_role NOT NULL,
  typed_name            TEXT NOT NULL,
  drawn_signature_data  TEXT,
  ip_address            TEXT,
  user_agent            TEXT,
  signed_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whs_sig_sub    ON whs_signatures(submission_id);
CREATE INDEX IF NOT EXISTS idx_whs_sig_org    ON whs_signatures(org_id);
CREATE INDEX IF NOT EXISTS idx_whs_sig_user   ON whs_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_whs_sig_form   ON whs_signatures(org_id, form_id);

-- Tracks whether each user has completed the WHS onboarding gate
CREATE TABLE IF NOT EXISTS user_whs_gate (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  completed_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_whs_gate_org ON user_whs_gate(org_id);
