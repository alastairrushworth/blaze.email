import { NextResponse } from 'next/server';
import sitemap from '../../../sitemap';

// This is a debug endpoint to view the sitemap entries
export async function GET() {
  const sitemapData = sitemap();
  
  return NextResponse.json({
    message: "Dynamic sitemap status",
    totalUrls: sitemapData.length,
    urlsPreview: sitemapData.slice(0, 5), // Show first 5 entries
    timestamp: new Date().toISOString(),
  });
}