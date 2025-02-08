import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, topic } = req.body;

    if (!email || !topic) {
      return res.status(400).json({ error: 'Email and topic are required' });
    }

    try {
      const client = await pool.connect();
      const query = "INSERT INTO blaze_subscribers (email, action, newsletter, datetime) VALUES ($1, 'subscribe', $2, NOW())"
        ;;
      await client.query(query, [email, topic]);
      client.release();
      return res.status(200).json({ message: 'Signup successful' });
    } catch (error) {
      console.error('Error inserting data into signup table:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
