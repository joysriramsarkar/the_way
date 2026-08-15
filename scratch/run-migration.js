/**
 * scratch/direct-migration.js
 * Uses Supabase Management API to run SQL migration directly.
 * Run: node scratch/direct-migration.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env
const envFile = path.join(__dirname, '..', '.env');
fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) {
      const k = t.slice(0, idx).trim();
      const v = t.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  }
});

const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// We'll use the Supabase PostgREST endpoint to execute SQL
// via the pg-sql-runner approach: insert a dummy record to check table existence first
async function tableExists(tableName) {
  const { data, error } = await sb
    .from(tableName)
    .select('id')
    .limit(1);
  // If error contains "relation does not exist" → table doesn't exist
  if (error && error.message && error.message.includes('relation') && error.message.includes('does not exist')) {
    return false;
  }
  if (error && error.code === '42P01') return false;
  return true;
}

async function main() {
  console.log('\n🔍 Checking if books tables exist...');

  const booksExists = await tableExists('books');
  const chaptersExists = await tableExists('book_chapters');
  const pagesExists = await tableExists('book_pages');

  console.log(`  books table: ${booksExists ? '✅ exists' : '❌ missing'}`);
  console.log(`  book_chapters table: ${chaptersExists ? '✅ exists' : '❌ missing'}`);
  console.log(`  book_pages table: ${pagesExists ? '✅ exists' : '❌ missing'}`);

  if (!booksExists) {
    console.log('\n⚠️  Tables do not exist. Need to create them.');
    console.log('\nPlease do one of the following:');
    console.log('\nOPTION A — Run in Supabase SQL Editor (https://supabase.com/dashboard):');
    console.log('  File: supabase_books_schema.sql');
    console.log('\nOPTION B — Use the Supabase service key via pg connection:');
    console.log('  Add SUPABASE_DB_URL to .env file');
    console.log('\n  SUPABASE_DB_URL format:');
    console.log('  postgresql://postgres.gyhkpjjwwiakhpdqatuh:[DB_PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres');
    return;
  }

  console.log('\n✅ All tables exist! Ready to run scraper.');
}

main().catch(e => { console.error(e); process.exit(1); });
