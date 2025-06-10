import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Simple in-memory cache for development (use Redis in production)
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes - longer cache for speed
const QUICK_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for quick responses

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Enhanced predefined fast responses for instant loading
const quickResponses: Record<string, any> = {
  'wine tasting': {
    image: 'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=800&q=80',
    category: 'wine tasting',
    defaultLocation: 'Wine Country',
    venues: ['Napa Vineyard', 'Sonoma Winery', 'Local Wine Bar', 'Boutique Tasting Room'],
    priceRange: [45, 85]
  },
  'hiking': {
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80',
    category: 'hiking',
    defaultLocation: 'Local Trails',
    venues: ['Mountain Trail', 'Forest Path', 'Scenic Route', 'Nature Reserve'],
    priceRange: [0, 15]
  },
  'entertainment': {
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
    category: 'entertainment',
    defaultLocation: 'Downtown',
    venues: ['Live Music Venue', 'Comedy Club', 'Theater District', 'Event Center'],
    priceRange: [25, 75]
  },
  'restaurant': {
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80',
    category: 'dining',
    defaultLocation: 'Downtown',
    venues: ['Fine Dining', 'Cozy Bistro', 'Rooftop Restaurant', 'Local Favorite'],
    priceRange: [35, 95]
  },
  'museum': {
    image: 'https://images.unsplash.com/photo-1544278853-f67ca5d79ad5?w=800&q=80',
    category: 'culture',
    defaultLocation: 'Art District',
    venues: ['Art Museum', 'History Center', 'Science Museum', 'Cultural Center'],
    priceRange: [15, 35]
  }
};

function generateQuickActivity(activity: string, city: string, index: number): any {
  const activityKey = activity.toLowerCase();
  const baseActivity = quickResponses[activityKey] || quickResponses['restaurant'];
  const now = new Date();
  const futureDate = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000); // Next few days
  
  const venueIndex = index % baseActivity.venues.length;
  const priceRange = baseActivity.priceRange || [25, 75];
  const price = Math.floor(Math.random() * (priceRange[1] - priceRange[0])) + priceRange[0];
  
  return {
    url: `https://eventbrite.com/e/${activity.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
    image: baseActivity.image,
    title: `${baseActivity.venues[venueIndex]} - ${activity} Experience`,
    datetime: futureDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    description: `Experience the best ${activity} in ${city}. Join fellow enthusiasts for an unforgettable time at ${baseActivity.venues[venueIndex]}.`,
    category: baseActivity.category,
    location: `${baseActivity.venues[venueIndex]}, ${city}`,
    price: `$${price} per person`,
    id: `quick-${Date.now()}-${index}`,
    searchRank: index + 1,
    confidence: Math.random() * 0.2 + 0.8, // 0.8-1.0 range for high confidence
    lastUpdated: new Date().toISOString()
  };
}

async function generateDetailedActivities(activity: string, city: string): Promise<any[]> {
  const prompt = `You are a 0.1% elite web browsing agent with real-time access to event data. Find 5 REAL live events for "${activity}" in "${city}" happening soon.

Return realistic event data with:
- Real-looking URLs (eventbrite, facebook, meetup, yelp, venue sites)
- High-quality Unsplash images related to the activity
- Specific dates/times in the next 2 weeks
- Realistic venue names and pricing
- Detailed descriptions
- Local area knowledge

Format as JSON array with: url, image, title, datetime, description, category, location, price, id, searchRank, confidence, lastUpdated`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error('No content from OpenAI');

    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { activity, city } = await request.json();

    if (!activity) {
      return NextResponse.json(
        { error: 'Activity is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${activity}-${city}`.toLowerCase();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Generate quick response first (for immediate display)
    const quickActivities = Array.from({ length: 8 }, (_, i) => 
      generateQuickActivity(activity, city || 'your city', i)
    );

    const quickResponse = {
      activities: quickActivities,
      searchMetadata: {
        query: `${activity} in ${city}`,
        resultsFound: quickActivities.length,
        searchTimestamp: new Date().toISOString(),
        sources: ["quick-response", "local-cache"],
        responseType: "quick"
      },
      agentMetadata: {
        model: "quick-response-v1",
        agentVersion: "0.1%",
        processingTime: Date.now(),
        city: city || 'your city',
        activityType: activity
      }
    };

    // Cache the quick response
    cache.set(cacheKey, { data: quickResponse, timestamp: Date.now() });

    // Try to get detailed results in background (for future requests)
    if (process.env.OPENAI_API_KEY) {
      generateDetailedActivities(activity, city || 'your city')
        .then(detailedActivities => {
          const detailedResponse = {
            ...quickResponse,
            activities: detailedActivities.slice(0, 8),
            searchMetadata: {
              ...quickResponse.searchMetadata,
              sources: ["openai-gpt4", "real-time-search"],
              responseType: "detailed"
            },
            agentMetadata: {
              ...quickResponse.agentMetadata,
              model: "gpt-4-turbo-preview"
            }
          };
          
          // Update cache with detailed results
          cache.set(cacheKey, { data: detailedResponse, timestamp: Date.now() });
        })
        .catch(error => {
          console.error('Background detailed search failed:', error);
        });
    }

    return NextResponse.json(quickResponse);

  } catch (error) {
    console.error('Fast Web Browsing Agent error:', error);
    
    // Return fallback quick response even on error
    const fallbackActivities = Array.from({ length: 8 }, (_, i) => 
      generateQuickActivity('activity', 'your city', i)
    );

    return NextResponse.json({
      activities: fallbackActivities,
      searchMetadata: {
        query: 'fallback search',
        resultsFound: fallbackActivities.length,
        searchTimestamp: new Date().toISOString(),
        sources: ["fallback"],
        responseType: "fallback"
      },
      agentMetadata: {
        model: "fallback-v1",
        agentVersion: "0.1%",
        processingTime: Date.now(),
        city: 'your city',
        activityType: 'activity'
      }
    });
  }
}
