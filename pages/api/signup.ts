import { NextApiRequest, NextApiResponse } from 'next';
import { subscribeNewsletter } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, topic } = req.body;

    if (!email || !topic) {
      return res.status(400).json({ error: 'Email and topic are required' });
    }

    try {
      await subscribeNewsletter(email, topic);
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
