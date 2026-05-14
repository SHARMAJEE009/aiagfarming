#!/usr/bin/env node

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (value) {
        process.env[key.trim()] = value;
      }
    }
  });
}

async function updateUsersTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔄 Checking users table schema...');

    // Check if password column exists
    const result = await pool.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password'"
    );

    if (result.rows.length === 0) {
      console.log('Adding password and additional columns to users table...');
      await pool.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS password TEXT,
        ADD COLUMN IF NOT EXISTS farm_name TEXT,
        ADD COLUMN IF NOT EXISTS location TEXT,
        ADD COLUMN IF NOT EXISTS operation_type TEXT,
        ADD COLUMN IF NOT EXISTS farm_size INTEGER,
        ADD COLUMN IF NOT EXISTS animal_count INTEGER,
        ADD COLUMN IF NOT EXISTS referral_source TEXT,
        ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'professional'
      `);
      console.log('✅ Users table updated successfully');
    } else {
      console.log('✅ Users table already has required columns');
    }
  } catch (error) {
    console.error('❌ Error updating users table:', error.message);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  updateUsersTable().catch(console.error);
}

module.exports = { updateUsersTable };