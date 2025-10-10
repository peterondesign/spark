import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// In-memory cache for ultra-fast responses
const instantCache = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Minimal venue template for instant response
const generateInstantVenues = (city: string, activity: string, count: number = 6) => {
  const commonVenues: Record<string, string[]> = {
    'bowling': ['Strike Zone', 'Perfect Strike', 'Bowling Central', 'Strike & Spare', 'Galaxy Bowling', 'Thunder Alley'],
    'restaurant': ['Taste of Portugal', 'Local Flavors', 'City Bistro', 'The Table', 'Fork & Knife', 'Savory Place'],
    'museum': ['City Museum', 'Art Gallery', 'History Center', 'Cultural Museum', 'Modern Art Space', 'Heritage Hall'],
    'park': ['Central Park', 'Green Gardens', 'City Park', 'Nature Reserve', 'Riverside Park', 'Botanical Gardens'],
    'bar': ['Local Pub', 'City Lounge', 'Night Spot', 'Cocktail Bar', 'Social House', 'Corner Tavern'],
    'cinema': ['Multiplex Cinema', 'Movie Theater', 'Film House', 'Screen Palace', 'Cinema Center', 'Picture House']
  };

  const activityLower = activity.toLowerCase();
  const venueNames = commonVenues[activityLower] || [
    `${activity} Spot`, `${activity} Place`, `${activity} Center`, 
    `${activity} Hub`, `${activity} Zone`, `Premium ${activity}`
  ];

  return Array.from({ length: count }, (_, i) => ({
    title: `${venueNames[i % venueNames.length]} ${Math.floor(i / venueNames.length) + 1}`.replace(' 1', ''),
    description: `Popular ${activity.toLowerCase()} venue in ${city} with great atmosphere and excellent service.`,
    address: {
      street: `${city} Street ${i * 3 + 10}`,
      city: city,
      postal_code: `1${String(i).padStart(3, '0')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
      country: 'Portugal'
    },
    website_url: `https://www.google.com/search?q=${encodeURIComponent(`${venueNames[i % venueNames.length]} ${city}`)}`,
    estimated_price_range: ['€', '€€', '€€€'][Math.floor(Math.random() * 3)],
    duration_suggestion_minutes: [60, 90, 120, 150][Math.floor(Math.random() * 4)],
    source_url: '',
    instant: true
  }));
};

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let body: any = {};
  
  try {
    body = await req.json();
    const { city, activity, max_results = 6, language = 'en', offset = 0 } = body;

    if (!city || !activity) {
      return NextResponse.json({
        error: 'City and activity are required',
        received: { city, activity }
      }, { status: 400 });
    }

    const cacheKey = `${city.toLowerCase()}_${activity.toLowerCase()}_${offset}`;
    const now = Date.now();

    // Step 1: Return instant cached response if available
    if (instantCache.has(cacheKey)) {
      const cached = instantCache.get(cacheKey);
      if (now - cached.timestamp < CACHE_TTL) {
        const response = NextResponse.json({
          ...cached.data,
          cached: true,
          response_time_ms: Date.now() - startTime
        });
        response.headers.set('Cache-Control', 'public, s-maxage=300');
        return response;
      }
      instantCache.delete(cacheKey);
    }

    // Step 2: Generate instant placeholder response while fetching real data
    const instantVenues = generateInstantVenues(city, activity, max_results);
    const instantResponse = {
      query: `${activity} in ${city}`,
      city,
      activity,
      results_count: instantVenues.length,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: instantVenues,
      instant: true,
      response_time_ms: Date.now() - startTime
    };

    // Return instant response immediately
    const response = NextResponse.json(instantResponse);
    response.headers.set('Cache-Control', 'public, s-maxage=60');

    // Step 3: Start background fetch for real data (don't await)
    if (PERPLEXITY_API_KEY) {
      fetchRealDataBackground(city, activity, max_results, offset, cacheKey);
    }

    return response;

  } catch (error: any) {
    console.error('Error in instant API:', error);
    
    // Even on error, return instant fallback
    const fallbackVenues = generateInstantVenues(
      body?.city || 'Unknown', 
      body?.activity || 'activity', 
      body?.max_results || 6
    );

    return NextResponse.json({
      query: `${body?.activity || 'activity'} places in ${body?.city || 'city'}`,
      city: body?.city || 'Unknown',
      activity: body?.activity || 'Unknown',
      results_count: fallbackVenues.length,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: fallbackVenues,
      instant: true,
      error: 'Using instant fallback data',
      response_time_ms: Date.now() - startTime
    });
  }
}

// Background function to fetch real data from Perplexity
async function fetchRealDataBackground(
  city: string, 
  activity: string, 
  max_results: number, 
  offset: number,
  cacheKey: string
) {
  try {
    console.log(`Background fetch started for ${cacheKey}`);
    
    // Ultra-compact prompt for speed
    const compactPrompt = `${max_results} ${activity} venues in ${city}, Portugal. JSON only:
{"results":[{"title":"Name","description":"Brief desc","address":{"street":"Address","city":"${city}","postal_code":"Code","country":"Portugal"},"website_url":"URL","estimated_price_range":"€€","duration_suggestion_minutes":90}]}`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Fastest model
        messages: [
          {
            role: 'user',
            content: compactPrompt
          }
        ],
        max_tokens: 300, // Reduced for speed
        temperature: 0.1, // Lower for consistency
        stream: false
      }),
    });

    if (response.ok) {
      const data = await response.json();
      let content = data.choices?.[0]?.message?.content;
      
      if (content) {
        // Fast JSON extraction
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }

        try {
          const parsedContent = JSON.parse(content);
          
          if (parsedContent.results && Array.isArray(parsedContent.results)) {
            const realResponse = {
              query: `${activity} in ${city}`,
              city,
              activity,
              results_count: parsedContent.results.length,
              generated_at: new Date().toISOString(),
              currency: "EUR",
              results: parsedContent.results.map((venue: any) => ({
                title: venue.title || 'Unknown Venue',
                description: venue.description || `Great place for ${activity}`,
                address: {
                  street: venue.address?.street || 'Address not available',
                  city: venue.address?.city || city,
                  postal_code: venue.address?.postal_code || '',
                  country: venue.address?.country || 'Portugal'
                },
                website_url: venue.website_url || '',
                estimated_price_range: venue.estimated_price_range || '€€',
                duration_suggestion_minutes: venue.duration_suggestion_minutes || 90,
                source_url: venue.source_url || venue.website_url || '',
                instant: false
              })),
              instant: false
            };

            // Cache the real response
            instantCache.set(cacheKey, {
              data: realResponse,
              timestamp: Date.now()
            });

            console.log(`Background fetch completed for ${cacheKey}`);
          }
        } catch (parseError) {
          console.error('Background parsing error:', parseError);
        }
      }
    }
  } catch (error) {
    console.error('Background fetch error:', error);
  }
}