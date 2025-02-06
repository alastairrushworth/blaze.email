import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getLatestNewsletter(topic: string) {
  return null;
}

export async function addSignup(email: string, topic: string) {
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO signup (email, topic) VALUES ($1, $2)';
    await client.query(query, [email, topic]);
  } finally {
    client.release();
  }
}
