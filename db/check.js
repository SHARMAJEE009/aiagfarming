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

async function checkDatabaseConnection() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('❌ Database: DATABASE_URL not configured');
    return false;
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query('SELECT 1');
    console.log('✅ Database: Connection successful');
    return true;
  } catch (error) {
    console.log(`❌ Database: Connection failed - ${error.message}`);
    return false;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  checkDatabaseConnection().catch(console.error);
}

module.exports = { checkDatabaseConnection };