import { NextResponse } from 'next/server';
import { runCrawler } from '@/utils/crawler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url = 'https://www.getyourguide.com', maxRequests = 5 } = body;
    
    // Start the crawler (in a real app, this would be done in a background process)
    runCrawler([url], { 
      maxRequests: parseInt(maxRequests.toString(), 10),
      headless: true,
      debug: 'info'
    }).catch(error => {
      console.error('Crawler error:', error);
    });
    
    return NextResponse.json({
      success: true, 
      message: `Crawler started for ${url}. Processing up to ${maxRequests} pages.`
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error || 'Internal server error' }, 
      { status: 500 }
    );
  }
}
