import { NextApiRequest, NextApiResponse } from 'next';
import { unsubscribeNewsletter } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, topics } = req.body;

    if (!email || !topics) {
      return res.status(400).json({ error: 'Email and topics are required' });
    }

    try {
      // Process each topic
      for (const topic of topics) {
        // Replace hyphens with spaces to match database format
        const formattedTopic = topic === 'all' ? 'all' : topic.replace(/-/g, ' ');
        
        // Log the operation for debugging
        console.log(`Unsubscribing ${email} from ${formattedTopic}`);
        
        // Call the DB function
        await unsubscribeNewsletter(email, formattedTopic);
      }

      return res.status(200).json({ message: 'Unsubscribe successful' });
    } catch (error) {
      console.error('Error in unsubscribe API:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
