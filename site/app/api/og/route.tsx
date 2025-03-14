import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Create a dedicated component for the OG image
function OGImage({ topic, date }: { topic: string; date: string }) {
  // Define colors and styles
  const bgColor = '#f8fafc' // Light background
  const titleColor = '#4f46e5' // Indigo color for the title
  const textColor = '#4b5563' // Gray for text

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: bgColor,
        padding: '40px',
        position: 'relative',
      }}
    >
      {/* Logo at the top - using SVG directly instead of an external image */}
      <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
        <svg width="64" height="64" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 20C80 40 70 70 90 100C110 130 100 160 80 180" stroke="#FFB74D" strokeWidth="15" strokeLinecap="round" />
          <path d="M100 20C120 40 130 70 110 100C90 130 100 160 120 180" stroke="#FF7FAB" strokeWidth="15" strokeLinecap="round" />
          <path d="M100 60C90 75 85 90 95 105C105 120 100 135 90 150" stroke="#A2F7E7" strokeWidth="15" strokeLinecap="round" />
          <path d="M100 60C110 75 115 90 105 105C95 120 100 135 110 150" stroke="#B388FF" strokeWidth="15" strokeLinecap="round" />
        </svg>
      </div>
      
      {/* Site name in the top right */}
      <div style={{ position: 'absolute', top: '40px', right: '40px', fontSize: '24px', color: titleColor, fontWeight: 'bold' }}>
        blaze.email
      </div>
      
      {/* Main content */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        maxWidth: '80%'
      }}>
        <h1 style={{ 
          fontSize: '64px', 
          color: titleColor, 
          margin: '0 0 20px 0',
          fontWeight: 'bold',
          lineHeight: 1.2
        }}>
          {topic.replace(/-/g, ' ')}
        </h1>
        
        {date && (
          <p style={{ 
            fontSize: '32px', 
            color: textColor,
            margin: '0 0 10px 0'
          }}>
            {date}
          </p>
        )}
        
        <p style={{ 
          fontSize: '24px', 
          color: textColor,
          margin: '20px 0 0 0'
        }}>
          Get the latest insights delivered to your inbox
        </p>
        
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontSize: '18px',
          color: titleColor
        }}>
          blaze.email — Fast, focused newsletters for busy professionals
        </div>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters
    const { searchParams } = new URL(request.url)
    
    // Get the topic and date from the query parameters
    const topic = searchParams.get('topic') || 'Newsletter'
    const date = searchParams.get('date') || ''
    
    // Log for debugging
    console.log(`Generating OG image for topic: ${topic}, date: ${date}`)

    return new ImageResponse(
      <OGImage topic={topic} date={date} />,
      {
        width: 1200,
        height: 630,
        emoji: 'twemoji',
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400, s-maxage=86400',
        },
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new Response('Error generating image', { status: 500 })
  }
}