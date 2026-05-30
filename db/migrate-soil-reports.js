#!/usr/bin/env node
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...v] = line.split('=');
    if (key && v.length) process.env[key.trim()] = v.join('=').trim();
  });
}

async function migrate() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS soil_reports (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
        field_id         UUID REFERENCES fields(id) ON DELETE SET NULL,
        report_name      TEXT NOT NULL,
        uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
        extracted_text   TEXT,
        ai_analysis      JSONB,
        status           TEXT NOT NULL DEFAULT 'processing'
          CHECK (status IN ('processing','done','error'))
      )
    `);
    await pool.query('CREATE INDEX IF NOT EXISTS idx_soil_reports_org ON soil_reports(organization_id)');
    console.log('soil_reports table ready');
  } catch (e) {
    console.error('Migration failed:', e.message);
  } finally {
    await pool.end();
  }
}

migrate();
