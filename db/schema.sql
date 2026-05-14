-- AIAG Farming — Neon PostgreSQL schema (run in Neon SQL Editor or pgAdmin)
-- Auth tables match @auth/pg-adapter (next-auth / Auth.js).
-- Requires PostgreSQL 15+

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Organizations & membership ───────────────────────────────────────────
CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  plan        TEXT NOT NULL DEFAULT 'starter'
    CHECK (plan IN ('starter','professional','enterprise','agronomist')),
  trial_ends_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE user_role AS ENUM (
  'OWNER','MANAGER','AGRONOMIST','FARMHAND','READ_ONLY'
);

-- Adapter inserts: name, email, "emailVerified", image — id defaulted
CREATE TABLE users (
  id             TEXT PRIMARY KEY DEFAULT (gen_random_uuid()::TEXT),
  name           TEXT,
  email          TEXT UNIQUE,
  password       TEXT, -- For manual registration
  "emailVerified" TIMESTAMPTZ,
  image          TEXT,
  role           user_role NOT NULL DEFAULT 'READ_ONLY',
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  -- Additional fields for manual registration
  farm_name      TEXT,
  location       TEXT,
  operation_type TEXT,
  farm_size      INTEGER,
  animal_count   INTEGER,
  referral_source TEXT,
  plan           TEXT DEFAULT 'professional',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE accounts (
  id                  SERIAL PRIMARY KEY,
  "userId"            TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INTEGER,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE (provider, "providerAccountId")
);

CREATE TABLE sessions (
  id           SERIAL PRIMARY KEY,
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId"     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires      TIMESTAMPTZ NOT NULL
);

CREATE TABLE verification_token (
  identifier TEXT NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  token      TEXT NOT NULL,
  CONSTRAINT verification_token_identifier_token_pkey PRIMARY KEY (identifier, token)
);

CREATE UNIQUE INDEX verification_token_token_key ON verification_token (token);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_accounts_userId ON accounts("userId");
CREATE INDEX idx_sessions_userId ON sessions("userId");

-- ─── Crops ─────────────────────────────────────────────────────────────────
CREATE TABLE fields (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  area_ha          DOUBLE PRECISION NOT NULL,
  soil_type        TEXT,
  boundary_geojson JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE season_status AS ENUM ('planning','active','harvested');

CREATE TABLE seasons (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id     UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  crop_type    TEXT NOT NULL,
  planted_at   DATE NOT NULL,
  harvested_at DATE,
  yield_kg     DOUBLE PRECISION,
  status       season_status NOT NULL DEFAULT 'planning'
);

CREATE TABLE spray_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id      UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
  product       TEXT NOT NULL,
  rate          DOUBLE PRECISION NOT NULL,
  unit          TEXT NOT NULL,
  applied_at    TIMESTAMPTZ NOT NULL,
  withhold_days INTEGER NOT NULL DEFAULT 0,
  operator_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  notes         TEXT
);

-- ─── Livestock ─────────────────────────────────────────────────────────────
CREATE TABLE paddocks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  area_ha          DOUBLE PRECISION,
  boundary_geojson JSONB
);

CREATE TYPE animal_species AS ENUM ('cattle','sheep','pig','goat','poultry');
CREATE TYPE animal_status AS ENUM ('active','sold','deceased');

CREATE TABLE mobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  species         animal_species NOT NULL,
  headcount       INTEGER NOT NULL DEFAULT 0,
  paddock_id      UUID REFERENCES paddocks(id) ON DELETE SET NULL
);

CREATE TABLE animals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  nlis_tag        TEXT,
  rfid_tag        TEXT,
  visual_tag      TEXT,
  species         animal_species NOT NULL,
  breed           TEXT,
  sex             TEXT NOT NULL CHECK (sex IN ('male','female')),
  dob             DATE,
  mob_id          UUID REFERENCES mobs(id) ON DELETE SET NULL,
  status          animal_status NOT NULL DEFAULT 'active'
);

CREATE TYPE health_event_type AS ENUM (
  'treatment','vaccination','vet_visit','observation'
);

CREATE TABLE health_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id      UUID REFERENCES animals(id) ON DELETE CASCADE,
  mob_id         UUID REFERENCES mobs(id) ON DELETE CASCADE,
  event_type     health_event_type NOT NULL,
  product        TEXT,
  dose           DOUBLE PRECISION,
  dose_unit      TEXT,
  treatment_date DATE NOT NULL,
  withhold_date  DATE,
  vet_id         TEXT,
  notes          TEXT,
  CHECK (animal_id IS NOT NULL OR mob_id IS NOT NULL)
);

CREATE TYPE breeding_status AS ENUM ('joined','confirmed','born');

CREATE TABLE breeding_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dam_id          UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  sire_id         UUID REFERENCES animals(id) ON DELETE SET NULL,
  joining_date    DATE NOT NULL,
  pg_test_date    DATE,
  birth_date      DATE,
  offspring_count INTEGER,
  status          breeding_status NOT NULL DEFAULT 'joined'
);

-- ─── Finance ───────────────────────────────────────────────────────────────
CREATE TYPE ledger_type AS ENUM ('income','expense');

CREATE TABLE financial_entries (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id    UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category           TEXT NOT NULL,
  type               ledger_type NOT NULL,
  amount             NUMERIC(14,2) NOT NULL,
  linked_entity_id   UUID,
  linked_entity_type TEXT,
  entry_date         DATE NOT NULL,
  description        TEXT
);

CREATE INDEX idx_fields_org ON fields(organization_id);
CREATE INDEX idx_seasons_field ON seasons(field_id);
CREATE INDEX idx_spray_field ON spray_records(field_id);
CREATE INDEX idx_paddocks_org ON paddocks(organization_id);
CREATE INDEX idx_mobs_org ON mobs(organization_id);
CREATE INDEX idx_animals_org ON animals(organization_id);
CREATE INDEX idx_fin_org_date ON financial_entries(organization_id, entry_date);
