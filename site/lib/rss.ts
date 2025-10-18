// RSS feed generation utilities

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  content: string;
  guid: string;
}

interface RSSFeedOptions {
  title: string;
  description: string;
  link: string;
  language?: string;
  items: RSSItem[];
}

/**
 * Generate an RSS 2.0 feed XML string
 */
export function generateRSSFeed(options: RSSFeedOptions): string {
  const { title, description, link, language = 'en-us', items } = options;

  const itemsXML = items
    .map(
      (item) => `
    <item>
      <title><![CDATA[${escapeXML(item.title)}]]></title>
      <link>${escapeXML(item.link)}</link>
      <guid isPermaLink="true">${escapeXML(item.guid)}</guid>
      <description><![CDATA[${escapeXML(item.description)}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <content:encoded><![CDATA[${item.content}]]></content:encoded>
    </item>`
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${escapeXML(title)}]]></title>
    <link>${escapeXML(link)}</link>
    <description><![CDATA[${escapeXML(description)}]]></description>
    <language>${language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXML(link)}/feed.xml" rel="self" type="application/rss+xml" />${itemsXML}
  </channel>
</rss>`;
}

/**
 * Escape special XML characters
 */
function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Convert markdown to basic HTML for RSS content
 * This is a simple implementation that handles common markdown patterns
 */
export function markdownToHTML(markdown: string): string {
  let html = markdown;

  // Convert headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  html = html.replace(/_(.*?)_/gim, '<em>$1</em>');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>');

  // Convert line breaks to paragraphs
  html = html.split('\n\n').map(para => {
    if (para.trim() && !para.startsWith('<h') && !para.startsWith('<ul') && !para.startsWith('<ol')) {
      return `<p>${para.trim()}</p>`;
    }
    return para;
  }).join('\n');

  // Convert single line breaks to <br>
  html = html.replace(/\n/g, '<br>\n');

  // Wrap in a styled div
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px;">
    ${html}
  </div>`;
}

/**
 * Format date to RFC 822 format for RSS
 */
export function formatRSSDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toUTCString();
}
