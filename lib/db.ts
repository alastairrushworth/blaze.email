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

export async function unsubscribeNewsletter(email: string, topic: string) {
  try {
    const client = await pool.connect();
    const query = "INSERT INTO blaze_subscribers (email, action, newsletter, datetime) VALUES ($1, 'unsubscribe', $2, NOW())";
    await client.query(query, [email, topic]);
    client.release();
  } catch (error) {
    console.error('Error inserting data into unsubscribe table:', error);
    throw new Error('Internal server error');
  }
}
