CREATE TABLE IF NOT EXISTS organization_members (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'OWNER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

INSERT INTO organization_members (user_id, organization_id, role)
SELECT id, organization_id, role FROM users WHERE organization_id IS NOT NULL
ON CONFLICT DO NOTHING;
