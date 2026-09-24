import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// In local environment, ensure .env is read if DATABASE_URL is not yet populated
if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        }
      }
    }
  } catch (e) {}
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured. Please set DATABASE_URL in your environment variables.');
}

export const sql = neon(connectionString);

export default sql;
