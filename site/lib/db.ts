import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // This is needed for both local and production
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
}

export async function getNewsletterByDate(topic: string, date: string) {
  try {
    const client = await pool.connect();
    const topic_name = topic.replace(/-/g, ' ');

    // Log the original date for debugging
    console.log(`Original requested date: ${date}`);

    // Parse the date in dd-MM-yyyy format
    const [day, month, year] = date.split('-').map(num => parseInt(num, 10));

    // Create date with UTC to avoid timezone issues
    const targetDate = new Date(Date.UTC(year, month - 1, day));
    console.log(`Parsed date: ${targetDate.toISOString()} (day of week: ${targetDate.getUTCDay()})`);

    // Format as ISO date for PostgreSQL comparison (YYYY-MM-DD)
    const formattedDate = targetDate.toISOString().split('T')[0];

    // Get the latest version of the newsletter for that specific date
    const query = `
      SELECT text as content, datetime as publishedat 
      FROM blaze_newsletter_md 
      WHERE newsletter = $1 
        AND DATE(datetime) = $2
      ORDER BY datetime DESC 
      LIMIT 1
    `;

    const result = await client.query(query, [topic_name, formattedDate]);
    client.release();

    // Log for debugging
    console.log(`Newsletter for ${topic_name} on ${formattedDate}: Found ${result.rows.length ? 'YES' : 'NO'}`);

    if (result.rows.length === 0) {
      // If no newsletter found for this date, try finding the latest newsletter on or before this date
      console.log(`No newsletter found for exact date. Trying to find the latest newsletter before this date...`);

      const client = await pool.connect();
      const fallbackQuery = `
        SELECT text as content, datetime as publishedat 
        FROM blaze_newsletter_md 
        WHERE newsletter = $1
          AND EXTRACT(DOW FROM datetime) = 2  /* Tuesday */
          AND DATE(datetime) <= $2
        ORDER BY datetime DESC 
        LIMIT 1
      `;
      const fallbackResult = await client.query(fallbackQuery, [topic_name, formattedDate]);
      client.release();

      if (fallbackResult.rows.length > 0) {
        const fallbackDate = new Date(fallbackResult.rows[0].publishedat).toISOString().split('T')[0];
        console.log(`Found fallback newsletter on ${fallbackDate}`);
      }

      return fallbackResult.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    console.error('Error fetching newsletter by date:', error);
    return null;
  }
}

export async function getNewsletterArchive(topic: string, startDate: string = '2025-04-01') {
  try {
    const client = await pool.connect();
    const topic_name = topic.replace(/-/g, ' ');

    console.log(`Getting archive for ${topic_name} starting from ${startDate}`);

    // Query only the latest newsletter for each unique date (using DISTINCT ON)
    // This query gets one newsletter per date (the latest one published on that date)
    const query = `
      WITH tuesday_newsletters AS (
        SELECT 
          text as content,
          datetime as publishedat,
          DATE(datetime) as newsletter_date
        FROM blaze_newsletter_md 
        WHERE newsletter = $1 
          AND datetime >= $2
          AND EXTRACT(DOW FROM datetime) = 2  /* 2 represents Tuesday in PostgreSQL */
      )
      SELECT DISTINCT ON (newsletter_date) 
        content,
        publishedat,
        newsletter_date
      FROM tuesday_newsletters
      ORDER BY newsletter_date DESC, publishedat DESC
    `;

    const result = await client.query(query, [topic_name, startDate]);
    client.release();

    // Check for duplicate dates or edge cases (e.g., newsletters published at midnight)
    const seenDates = new Set();
    const uniqueNewsletters = result.rows.filter(newsletter => {
      const dateString = new Date(newsletter.publishedat).toISOString().split('T')[0];
      if (seenDates.has(dateString)) {
        return false;
      }
      seenDates.add(dateString);
      return true;
    });

    console.log(`Archive for ${topic_name}: Found ${uniqueNewsletters.length} unique dates out of ${result.rows.length} results`);
    uniqueNewsletters.forEach((newsletter, index) => {
      const date = new Date(newsletter.publishedat);
      console.log(`  [${index}] ${date.toISOString()} (Day: ${date.getDay()})`);
    });

    return uniqueNewsletters;
  } catch (error) {
    console.error('Error fetching newsletter archive:', error);
    return [];
  }
}

export async function getRecentNewsletters(topic: string, limit: number = 10) {
  try {
    const client = await pool.connect();
    const topic_name = topic.replace(/-/g, ' ');

    console.log(`Getting recent ${limit} newsletters for ${topic_name}`);

    // Query to get the last N newsletters (one per unique date)
    const query = `
      WITH tuesday_newsletters AS (
        SELECT
          text as content,
          datetime as publishedat,
          DATE(datetime) as newsletter_date
        FROM blaze_newsletter_md
        WHERE newsletter = $1
          AND EXTRACT(DOW FROM datetime) = 2  /* Tuesday */
      )
      SELECT DISTINCT ON (newsletter_date)
        content,
        publishedat,
        newsletter_date
      FROM tuesday_newsletters
      ORDER BY newsletter_date DESC, publishedat DESC
      LIMIT $2
    `;

    const result = await client.query(query, [topic_name, limit]);
    client.release();

    console.log(`Found ${result.rows.length} recent newsletters for ${topic_name}`);

    return result.rows;
  } catch (error) {
    console.error('Error fetching recent newsletters:', error);
    return [];
  }
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

export async function subscribeNewsletter(email: string, topic: string) {
  try {
    const client = await pool.connect();
    const query = "INSERT INTO blaze_subscribers (email, action, newsletter, datetime) VALUES ($1, 'subscribe', $2, NOW())"
      ;;
    await client.query(query, [email, topic]);
    client.release();
  }
  catch (error) {
    console.error('Error inserting data into signup table:', error);
    throw new Error('Internal server error');
  }
}
