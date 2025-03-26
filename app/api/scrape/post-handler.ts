// filepath: /Users/peteriyitor/Downloads/date-ideas-site/app/api/scrape/post-handler.ts
import { NextResponse } from 'next/server';
import { scrapeGetYourGuide } from '../../../services/llmScraper';

// Simple in-memory rate limiter
const rateLimits = new Map<string, { count: number, resetTime: number }>();
const RATE_LIMIT = 5;  // requests per window
const RATE_WINDOW = 60000;  // 60 seconds in ms

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  
  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  const limit = rateLimits.get(ip)!;
  
  if (now > limit.resetTime) {
    // Reset the window
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT) {
    return false;
  }
  
  // Increment count
  limit.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Apply rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { slug, city, url } = body;
    
    // Extract activity and location from the request
    let activity = slug || '';
    let location = city || '';
    
    // If URL is provided but not slug/city, try to extract from URL
    if (url && (!activity || !location)) {
      try {
        const urlObj = new URL(url);
        const searchParams = urlObj.searchParams;
        const q = searchParams.get('q') || '';
        const parts = q.split('+');
        
        if (parts.length >= 2) {
          activity = activity || parts[0];
          location = location || parts[1];
        }
      } catch (e) {
        console.error('Failed to parse URL:', e);
      }
    }
    
    // Ensure we have valid activity and location
    if (!activity || !location) {
      return NextResponse.json(
        { error: 'Activity and location are required' },
        { status: 400 }
      );
    }

    console.log(`Processing scrape request for "${activity}" in "${location}"`);
    
    // Run the scraper
    const result = await scrapeGetYourGuide(activity, location);
    
    // Check if the scraper returned any results
    if (!result || !result.activities || result.activities.length === 0) {
      console.log('No activities found');
      return NextResponse.json({ 
        success: true, 
        data: { 
          searchUrl: `https://www.getyourguide.com/s/?q=${encodeURIComponent(activity)}+${encodeURIComponent(location)}&searchSource=3`,
          results: [] 
        }
      });
    }
    
    // Format the results to match the expected structure
    const formattedResults = result.activities.map(activity => ({
      title: activity.title,
      url: activity.url,
      image: activity.image,
      price: activity.price,
      rating: activity.rating,
      description: activity.description
    }));
    
    return NextResponse.json({ 
      success: true, 
      data: {
        searchUrl: `https://www.getyourguide.com/s/?q=${encodeURIComponent(activity)}+${encodeURIComponent(location)}&searchSource=3`,
        results: formattedResults
      }
    });
    
  } catch (error: any) {
    console.error('Scrape API error:', error);
    return NextResponse.json(
      { error: `Failed to fetch data: ${error.message}` },
      { status: 500 }
    );
  }
}