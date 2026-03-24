import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for deterministic results
const venueCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface VenueRequest {
  dateIdea: string;
  city: string;
}

interface VenueResult {
  name: string;
  type: string;
  description: string;
  location: string;
  link: string;
}

interface VenueResponseEnvelope {
  city: string;
  idea: string;
  results: VenueResult[];
}

const CITY_COUNTRY_HINTS: Record<string, string> = {
  lisbon: 'Portugal',
  porto: 'Portugal',
  london: 'United Kingdom',
  paris: 'France',
  barcelona: 'Spain',
  madrid: 'Spain',
  berlin: 'Germany',
  rome: 'Italy',
  amsterdam: 'Netherlands',
  dubai: 'United Arab Emirates',
  tokyo: 'Japan',
  sydney: 'Australia',
  singapore: 'Singapore',
  mumbai: 'India',
  bangkok: 'Thailand',
  toronto: 'Canada',
  'new york': 'United States',
  'los angeles': 'United States',
  'san francisco': 'United States',
  'hong kong': 'Hong Kong',
};

function toGoogleBusinessSearchLink(name: string, city: string): string {
  const query = encodeURIComponent(`${name} ${city}`.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getCountryHint(city: string): string {
  return CITY_COUNTRY_HINTS[city.toLowerCase()] || '';
}

function buildCityFocusedPrompt(dateIdea: string, city: string): string {
  const countryHint = getCountryHint(city);
  const scopedCity = countryHint ? `${city}, ${countryHint}` : city;

  return [
    `Find 4-5 real currently operating venues for this date idea: "${dateIdea.trim()}".`,
    `Focus ONLY on venues physically in ${scopedCity}.`,
    'Exclude places outside the city even if similar.',
    'Return unique options with concise practical descriptions.',
  ].join(' ');
}

function normalizeVenues(venues: VenueResult[], city: string): VenueResult[] {
  const cityLower = city.toLowerCase();

  return venues
    .filter((venue) => venue && venue.name)
    .map((venue) => {
      const currentLocation = venue.location?.trim() || city;
      const locationHasCity = currentLocation.toLowerCase().includes(cityLower);

      return {
        ...venue,
        location: locationHasCity ? currentLocation : `${currentLocation}, ${city}`,
      };
    })
    .map((venue) => ({
      ...venue,
      // Always prefer a business-name search URL so users land on place profiles,
      // not only street/address pins.
      link: toGoogleBusinessSearchLink(venue.name, city),
    }))
    .filter((venue, index, arr) => arr.findIndex((v) => v.name.toLowerCase() === venue.name.toLowerCase()) === index)
    .slice(0, 5);
}

function getCacheKey(dateIdea: string, city: string): string {
  return `${dateIdea.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase()}`;
}

async function fetchVenuesWithOpenAI(dateIdea: string, city: string): Promise<VenueResult[]> {
  // Check cache first for deterministic responses
  const cacheKey = getCacheKey(dateIdea, city);
  const cached = venueCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const prompt = buildCityFocusedPrompt(dateIdea, city);

    // Use OpenAI API with temperature = 0 for deterministic results
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || ''}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0, // Critical: temperature = 0 for deterministic results
        top_p: 0.2,
        seed: 42,
        max_tokens: 420,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'venue_response',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                city: { type: 'string' },
                idea: { type: 'string' },
                results: {
                  type: 'array',
                  minItems: 4,
                  maxItems: 5,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      name: { type: 'string' },
                      type: { type: 'string' },
                      description: { type: 'string' },
                      location: { type: 'string' },
                      link: { type: 'string' },
                    },
                    required: ['name', 'type', 'description', 'location', 'link'],
                  },
                },
              },
              required: ['city', 'idea', 'results'],
            },
          },
        },
        messages: [
          {
            role: 'system',
            content: 'You return only strict JSON and must exactly follow the provided schema.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      return getFallbackVenues(dateIdea, city);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content) as VenueResponseEnvelope;

    if (Array.isArray(parsed.results) && parsed.results.length > 0) {
      const venues = normalizeVenues(parsed.results, city);
      
      // Cache the deterministic result
      venueCache.set(cacheKey, {
        data: venues,
        timestamp: Date.now(),
      });
      
      return venues;
    }
  } catch (error) {
    console.error('Error fetching venues:', error);
  }

  return getFallbackVenues(dateIdea, city);
}

// Fallback venues for testing/demo
function getFallbackVenues(dateIdea: string, city: string): VenueResult[] {
  const idea = dateIdea.toLowerCase();
  
  // Deterministic fallback data for common date ideas
  const fallbackData: Record<string, VenueResult[]> = {
    'coffee': [
      {
        name: 'Local Coffee House',
        type: 'Café',
        description: 'Cozy café with warm ambiance, perfect for intimate conversations',
        location: `Central ${city}`,
        link: `https://maps.google.com/?q=coffee+shop+${city}`,
      },
      {
        name: 'Artisan Brew',
        type: 'Coffee Shop',
        description: 'Specialty coffee roastery with comfortable seating',
        location: `${city}`,
        link: `https://maps.google.com/?q=artisan+coffee+${city}`,
      },
      {
        name: 'Quiet Corner Café',
        type: 'Café',
        description: 'Peaceful spot ideal for deep conversations over coffee',
        location: `Downtown ${city}`,
        link: `https://maps.google.com/?q=café+${city}`,
      },
      {
        name: 'Modern Bean Social',
        type: 'Coffee Lounge',
        description: 'Contemporary café with modern décor and excellent coffee',
        location: `${city} Center`,
        link: `https://maps.google.com/?q=modern+coffee+${city}`,
      },
    ],
    'dinner': [
      {
        name: 'Elegant Restaurant',
        type: 'Fine Dining',
        description: 'Upscale restaurant with romantic ambiance',
        location: `Downtown ${city}`,
        link: `https://maps.google.com/?q=fine+dining+restaurant+${city}`,
      },
      {
        name: 'Culinary Fusion',
        type: 'Restaurant',
        description: 'Contemporary cuisine in stylish setting',
        location: `${city}`,
        link: `https://maps.google.com/?q=restaurant+${city}`,
      },
      {
        name: 'Intimate Bistro',
        type: 'Bistro',
        description: 'Cozy French-style bistro perfect for couples',
        location: `${city}`,
        link: `https://maps.google.com/?q=bistro+${city}`,
      },
      {
        name: 'Rooftop Dining',
        type: 'Restaurant',
        description: 'Restaurant with views and romantic atmosphere',
        location: `${city} Skyline`,
        link: `https://maps.google.com/?q=rooftop+restaurant+${city}`,
      },
    ],
    'museum': [
      {
        name: 'Art Museum',
        type: 'Museum',
        description: 'World-class art collections and exhibitions',
        location: `${city}`,
        link: `https://maps.google.com/?q=art+museum+${city}`,
      },
      {
        name: 'History Museum',
        type: 'Museum',
        description: 'Fascinating exhibits on local and world history',
        location: `${city} Center`,
        link: `https://maps.google.com/?q=history+museum+${city}`,
      },
      {
        name: 'Contemporary Art Gallery',
        type: 'Gallery',
        description: 'Modern art installations and exhibitions',
        location: `${city}`,
        link: `https://maps.google.com/?q=contemporary+art+${city}`,
      },
    ],
    'hiking': [
      {
        name: 'Mountain Trail',
        type: 'Nature Trail',
        description: 'Scenic hiking trail with panoramic views',
        location: `Near ${city}`,
        link: `https://maps.google.com/?q=hiking+trail+${city}`,
      },
      {
        name: 'Forest Park',
        type: 'Park',
        description: 'Beautiful nature reserve with walking paths',
        location: `${city}`,
        link: `https://maps.google.com/?q=forest+park+${city}`,
      },
    ],
    'beach': [
      {
        name: 'Main Beach',
        type: 'Beach',
        description: 'Popular beach with sandy shores and amenities',
        location: `${city}`,
        link: `https://maps.google.com/?q=beach+${city}`,
      },
      {
        name: 'Scenic Coastline',
        type: 'Beach',
        description: 'Beautiful coastal area perfect for sunset walks',
        location: `${city}`,
        link: `https://maps.google.com/?q=beach+coastline+${city}`,
      },
    ],
  };

  // Find matching venues or return generic ones
  for (const [keyword, venues] of Object.entries(fallbackData)) {
    if (idea.includes(keyword)) {
      return normalizeVenues(venues, city);
    }
  }

  // Generic fallback
  return normalizeVenues([
    {
      name: `Popular ${dateIdea} Spot`,
      type: 'Venue',
      description: `Great location for ${dateIdea}`,
      location: `${city}`,
      link: `https://maps.google.com/?q=${dateIdea}+${city}`,
    },
  ], city);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as VenueRequest;
    const { dateIdea, city } = body;

    if (!dateIdea || !city) {
      return NextResponse.json(
        { error: 'Missing dateIdea or city' },
        { status: 400 }
      );
    }

    // Fetch venues (with OpenAI if API key available, otherwise fallback)
    const venues = process.env.OPENAI_API_KEY
      ? await fetchVenuesWithOpenAI(dateIdea, city)
      : getFallbackVenues(dateIdea, city);

    return NextResponse.json({
      results: venues,
      city,
      dateIdea,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in fetch-venues API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch venues' },
      { status: 500 }
    );
  }
}
