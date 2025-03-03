import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    // Get the search parameters
    const { searchParams } = new URL(request.url)
    
    // Get the topic and date from the query parameters
    const topic = searchParams.get('topic') || 'Newsletter'
    const date = searchParams.get('date') || ''
    
    // Define colors and styles
    const bgColor = '#f8fafc' // Light background
    const titleColor = '#4f46e5' // Indigo color for the title
    const textColor = '#4b5563' // Gray for text
    
    // In production, we'd fetch the logo differently for edge runtime
    // For now, use a full absolute URL
    const logoUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://blaze.email'}/logo.png`

    return new ImageResponse(
      (
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
          {/* Logo at the top */}
          <div style={{ position: 'absolute', top: '40px', left: '40px' }}>
            <img src={logoUrl} width="64" height="64" alt="Logo" />
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
      ),
      {
        width: 1200,
        height: 630,
        // Next.js handles system fonts automatically in the edge runtime
        // This will use system fonts
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