import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // This allows self-signed certificates
  }
});

export async function getLatestNewsletter(topic: string) {
  try {
    const client = await pool.connect();
    const topic_name = topic.replace(/-/g, ' ');
    console.log(topic_name);
    const query = "SELECT text as content, datetime as publishedat FROM blaze_newsletter_md WHERE newsletter = $1 ORDER BY datetime DESC LIMIT 1";
    const result = await client.query(query, [topic_name]);
    // console.log(result);
    client.release();
    return result.rows[0];
  } catch (error) {
    console.error('Error fetching data from newsletters table:', error);
    return null;
  }
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

