import { Pool } from 'pg';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // This allows self-signed certificates
  }
});

export async function getLatestNewsletter(topic: string) {
  return null;
}
