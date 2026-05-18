const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  try {
    const envContent = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n]+)["']?/);
    if (match) connectionString = match[1];
  } catch (e) {}
}

const pool = new Pool({
  connectionString
});

const sql = fs.readFileSync('update_schema.sql', 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Migration successful');
  })
  .catch((err) => {
    console.error('Migration failed:', err);
  })
  .finally(() => {
    pool.end();
  });
