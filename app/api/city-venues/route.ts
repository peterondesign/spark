import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

// OPTIMIZATION: In-memory cache for instant responses
const MEMORY_CACHE = new Map<string, any>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  const startTime = Date.now(); // OPTIMIZATION: Track response time
  let body: any = {};
  
  try {
    body = await req.json();
    console.log('Received request body:', body);
    
    const { city, activity, max_results = 8, language = 'en', offset = 0 } = body;

    console.log('Parsed parameters:', { city, activity, max_results, language, offset });

    // OPTIMIZATION: Ultra-fast cache check first
    const cacheKey = `${city.toLowerCase()}_${activity.toLowerCase()}_${offset}`;
    const cached = MEMORY_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      const response = NextResponse.json({
        ...cached.data,
        cached: true,
        response_time_ms: Date.now() - startTime
      });
      response.headers.set('Cache-Control', 'public, s-maxage=300');
      return response;
    }

    if (!city || !activity) {
      console.log('Missing required parameters:', { city: !!city, activity: !!activity });
      return NextResponse.json(
        { error: 'City and activity are required', received: { city, activity } },
        { status: 400 }
      );
    }

    if (!PERPLEXITY_API_KEY) {
      console.log('Missing Perplexity API key');
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    // OPTIMIZED: Minimal prompt for faster processing
    const enhancedPrompt = `${max_results} ${activity} venues ${city}. JSON only:
{"results":[{"title":"Name","description":"Brief","address":{"street":"St","city":"${city}","country":"Portugal"},"website_url":"URL","estimated_price_range":"€€"}]}`;

    console.log('Enhanced prompt:', enhancedPrompt);

    console.log('Making Perplexity API request...');
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar', // OPTIMIZED: Fastest model
        messages: [{ role: 'user', content: enhancedPrompt }], // OPTIMIZED: Removed system message
        max_tokens: 200, // OPTIMIZED: Reduced token limit
        temperature: 0.1, // OPTIMIZED: Lower for consistency and speed
        stream: false
      }),
    });

    console.log('Perplexity API response status:', response.status);
    console.log('Perplexity API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Full Perplexity API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from Perplexity API' },
        { status: 500 }
      );
    }

    // OPTIMIZED: Faster JSON cleaning
    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // OPTIMIZED: Simplified whitespace cleaning
    content = content.replace(/\s+/g, ' ').trim();
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Normalize the response structure for simplified API responses
      let normalizedResponse;
      if (parsedContent.results && Array.isArray(parsedContent.results)) {
        const normalizedResponse = {
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
            duration_suggestion_minutes: venue.duration_suggestion_minutes || 120,
            source_url: venue.source_url || venue.website_url || ''
          })),
          response_time_ms: Date.now() - startTime // OPTIMIZATION: Track performance
        };
      } else {
        throw new Error('Invalid JSON structure: missing results array');
      }
      
      // OPTIMIZATION: Cache the response for instant future requests
      MEMORY_CACHE.set(cacheKey, {
        data: normalizedResponse,
        timestamp: Date.now()
      });
      
      const response = NextResponse.json(normalizedResponse);
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      
      return response;
    } catch (parseError) {
      console.error('Failed to parse Perplexity JSON response:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Try alternative parsing strategies
      try {
        // Strategy 1: Try to fix common JSON issues
        let fixedContent = content
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2'); // Quote unquoted string values
        
        console.log('Attempting to parse fixed content:', fixedContent);
        const parsedFixed = JSON.parse(fixedContent);
        
        if (parsedFixed.results && Array.isArray(parsedFixed.results)) {
          const normalizedResponse = {
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: parsedFixed.results.length,
            generated_at: new Date().toISOString(),
            currency: "EUR",
            results: parsedFixed.results.map((venue: any) => ({
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
              duration_suggestion_minutes: venue.duration_suggestion_minutes || 120,
              source_url: venue.source_url || venue.website_url || ''
            }))
          };
          
          console.log('Successfully parsed with fixed content');
          return NextResponse.json(normalizedResponse);
        }
      } catch (fixError) {
        console.error('Fixed parsing also failed:', fixError);
      }
      
      // Strategy 2: Extract individual venue data using regex
      try {
        const venues = [];
        const titleMatches = content.match(/"title":\s*"([^"]+)"/g) || [];
        const descMatches = content.match(/"description":\s*"([^"]+)"/g) || [];
        const streetMatches = content.match(/"street":\s*"([^"]+)"/g) || [];
        const websiteMatches = content.match(/"website_url":\s*"([^"]+)"/g) || [];
        
        const maxVenues = Math.min(max_results, titleMatches.length);
        
        for (let i = 0; i < maxVenues; i++) {
          const title = titleMatches[i]?.match(/"title":\s*"([^"]+)"/)?.[1] || `${activity} Venue ${i + 1}`;
          const description = descMatches[i]?.match(/"description":\s*"([^"]+)"/)?.[1] || `Great place for ${activity}`;
          const street = streetMatches[i]?.match(/"street":\s*"([^"]+)"/)?.[1] || `${activity} Street ${i + 1}`;
          const website = websiteMatches[i]?.match(/"website_url":\s*"([^"]+)"/)?.[1] || '';
          
          venues.push({
            title,
            description,
            address: {
              street,
              city,
              postal_code: '1000-000',
              country: 'Portugal'
            },
            website_url: website,
            estimated_price_range: '€€',
            duration_suggestion_minutes: 120,
            source_url: website
          });
        }
        
        if (venues.length > 0) {
          console.log('Successfully extracted venues using regex');
          return NextResponse.json({
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: venues.length,
            generated_at: new Date().toISOString(),
            currency: "EUR",
            results: venues,
            parsing_method: 'regex_extraction'
          });
        }
      } catch (regexError) {
        console.error('Regex extraction failed:', regexError);
      }
      
      // Return a fallback response
      return NextResponse.json({
        query: `${activity} places in ${city}`,
        city,
        activity,
        results_count: 0,
        generated_at: new Date().toISOString(),
        currency: "EUR",
        results: [],
        error: 'Failed to parse venue data',
        response_time_ms: Date.now() - startTime
      });
    }

  } catch (error: any) {
    console.error('Error in city-venues API:', error);
    
    // If it's a timeout, provide fallback venues
    if (error?.message === 'API timeout') {
      const fallbackVenues = generateFallbackVenues(body?.city || 'Unknown', body?.activity || 'activity', body?.max_results || 6);
      return NextResponse.json({
        query: `${body?.activity || 'activity'} places in ${body?.city || 'Unknown'}`,
        city: body?.city || 'Unknown',
        activity: body?.activity || 'Unknown',
        results_count: fallbackVenues.length,
        generated_at: new Date().toISOString(),
        currency: "EUR",
        results: fallbackVenues,
        fallback: true,
        error: 'Using fallback data due to API timeout'
      });
    }
    
    // Return a basic fallback response for other errors
    return NextResponse.json({
      query: `${body?.activity || 'activity'} places in ${body?.city || 'city'}`,
      city: body?.city || 'Unknown',
      activity: body?.activity || 'Unknown',
      results_count: 0,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: [],
      error: 'Failed to fetch venue data',
      fallback: true
    });
  }
}

// Generate fallback venues when API fails
function generateFallbackVenues(city: string, activity: string, count: number) {
  const venues = [];
  for (let i = 1; i <= count; i++) {
    venues.push({
      title: `${activity} Spot ${i}`,
      description: `Great place for ${activity.toLowerCase()} in ${city}`,
      address: {
        street: `${activity} Street ${i}`,
        city: city,
        postal_code: '1000-000',
        country: 'Portugal'
      },
      website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} ${city}`)}?utm_source=dateideas.cc&utm_medium=referral&utm_campaign=venue_discovery`,
      estimated_price_range: '€€',
      duration_suggestion_minutes: 120,
      source_url: ''
    });
  }
  return venues;
}