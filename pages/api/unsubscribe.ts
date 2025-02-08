import { NextApiRequest, NextApiResponse } from 'next';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, topics } = req.body;

    if (!email || !topics) {
      return res.status(400).json({ error: 'Email and topics are required' });
    }

    try {
      const client = await pool.connect();
      const query = "INSERT INTO blaze_subscribers (email, action, newsletter, datetime) VALUES ($1, 'unsubscribe', $2, NOW())";

      for (const topic of topics) {
        const newsletter = topic === 'all' ? 'all' : topic;
        await client.query(query, [email, newsletter]);
      }

      client.release();
      return res.status(200).json({ message: 'Unsubscribe successful' });
    } catch (error) {
      console.error('Error inserting data into unsubscribe table:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
