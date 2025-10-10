import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// Performance optimizations
const FAST_CACHE = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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

    // Ultra-fast cache check
    const cacheKey = `${city.toLowerCase()}_${activity.toLowerCase()}_${offset}`;
    const cached = FAST_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      const response = NextResponse.json({
        ...cached.data,
        cached: true,
        response_time_ms: Date.now() - startTime
      });
      response.headers.set('Cache-Control', 'public, s-maxage=300');
      return response;
    }

    if (!PERPLEXITY_API_KEY) {
      return NextResponse.json({
        error: 'Perplexity API key not configured'
      }, { status: 500 });
    }

    // Detect country from city name
    const cityLower = city.toLowerCase();
    let country = 'Portugal'; // Default
    
    if (cityLower.includes('london') || cityLower.includes('manchester') || cityLower.includes('birmingham')) {
      country = 'United Kingdom';
    } else if (cityLower.includes('paris') || cityLower.includes('lyon') || cityLower.includes('marseille')) {
      country = 'France';
    } else if (cityLower.includes('madrid') || cityLower.includes('barcelona') || cityLower.includes('valencia')) {
      country = 'Spain';
    } else if (cityLower.includes('rome') || cityLower.includes('milan') || cityLower.includes('naples')) {
      country = 'Italy';
    }

    // Optimized prompt for complete JSON responses
    const prompt = `Find exactly ${max_results} real ${activity} venues in ${city}, ${country}. Return complete valid JSON only:
{"results":[{"title":"Venue Name","description":"Brief description","address":{"street":"Street address","city":"${city}"},"website_url":"URL or null"}]}

Requirements:
- Real venues only
- Complete JSON response
- Exactly ${max_results} venues
- Valid JSON format`;

    // Optimized API call with longer timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    console.log(`[Perplexity] Searching for: ${activity} in ${city}, ${country}`);
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // Fastest model
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 800, // Increased for complete JSON responses
        temperature: 0.1, // Lower for consistency
        top_p: 0.8,
        stream: false
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[Perplexity] Raw API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    // Enhanced JSON extraction and validation
    let content = data.choices[0].message.content;
    console.log('[Perplexity] Raw content:', content);
    
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    // Clean whitespace for parsing
    content = content.replace(/\s+/g, ' ').trim();
    
    // Try to fix incomplete JSON
    if (!content.endsWith('}')) {
      // Check if we have an incomplete results array
      if (content.includes('"results":[') && !content.includes(']}')) {
        // Try to close the JSON properly
        const lastComma = content.lastIndexOf(',');
        const lastBrace = content.lastIndexOf('{');
        
        if (lastBrace > lastComma) {
          // We have an incomplete object, close it
          content = content.substring(0, lastBrace) + ']}';
        } else {
          // Add closing brackets
          content += ']}';
        }
      }
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
      console.log('[Perplexity] Successfully parsed response:', parsedContent);
    } catch (parseError) {
      console.error('[Perplexity] JSON parse error:', parseError, 'Content:', content);
      // Fast fallback parsing
      const quickVenues = generateQuickVenues(city, activity, max_results);
      const fallbackResponse = {
        query: `${activity} in ${city}`,
        city, activity,
        results_count: quickVenues.length,
        generated_at: new Date().toISOString(),
        currency: "EUR",
        results: quickVenues,
        fallback: true,
        response_time_ms: Date.now() - startTime
      };
      
      return NextResponse.json(fallbackResponse);
    }

    // Fast response normalization
    const normalizedResponse = {
      query: `${activity} in ${city}`,
      city, activity,
      results_count: parsedContent.results?.length || 0,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: (parsedContent.results || []).map((venue: any) => ({
        title: venue.title || 'Local Venue',
        description: venue.description || `Great place for ${activity.toLowerCase()} in ${city}`,
        address: {
          street: venue.address?.street || 'City Center',
          city: venue.address?.city || city,
          postal_code: venue.address?.postal_code || ''
        },
        website_url: venue.website_url || null,
        source_url: venue.source_url || venue.website_url || null
      })),
      response_time_ms: Date.now() - startTime
    };

    // Cache the response
    FAST_CACHE.set(cacheKey, {
      data: normalizedResponse,
      timestamp: Date.now()
    });

    // Aggressive caching headers
    const apiResponse = NextResponse.json(normalizedResponse);
    apiResponse.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
    
    return apiResponse;

  } catch (error: any) {
    console.error('[Perplexity] Full API error:', error.message, error.stack);
    
    // Ultra-fast fallback
    const quickVenues = generateQuickVenues(
      body?.city || 'Unknown', 
      body?.activity || 'activity', 
      body?.max_results || 6
    );

    return NextResponse.json({
      query: `${body?.activity || 'activity'} places in ${body?.city || 'city'}`,
      city: body?.city || 'Unknown',
      activity: body?.activity || 'Unknown',
      results_count: quickVenues.length,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: quickVenues,
      fallback: true,
      error: `API failed: ${error.message}`,
      response_time_ms: Date.now() - startTime
    });
  }
}

// Generate realistic venue data
function generateQuickVenues(city: string, activity: string, count: number) {
  const venueTypes = {
    'romantic dinner': ['Restaurante Romantic', 'Café Intimate', 'Bistro Cozy', 'Wine Bar Elegant'],
    'outdoor activity': ['Adventure Center', 'Nature Park', 'Outdoor Club', 'Sports Complex'],
    'cultural experience': ['Cultural Center', 'Art Gallery', 'Museum Local', 'Heritage Site'],
    'entertainment': ['Entertainment Hub', 'Live Music Venue', 'Theater Local', 'Comedy Club']
  };

  const defaultNames = [`Local ${activity} Venue`, `${city} ${activity} Spot`, `Popular ${activity} Place`];
  const names = venueTypes[activity.toLowerCase() as keyof typeof venueTypes] || defaultNames;

  return Array.from({ length: count }, (_, i) => ({
    title: names[i % names.length] || `${activity} Location ${i + 1}`,
    description: `Recommended ${activity.toLowerCase()} venue in ${city}`,
    address: {
      street: `${city} Center`,
      city,
      postal_code: `${Math.floor(Math.random() * 9000) + 1000}-000`
    },
    website_url: null,
    source_url: null
  }));
}