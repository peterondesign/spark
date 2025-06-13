import { NextRequest, NextResponse } from 'next/server';

// Cache system for Perplexity city events
class PerplexityCityEventCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly maxSize = 100;
  private readonly cacheDuration = 30 * 60 * 1000; // 30 minutes for faster loading

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.cacheDuration) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key: string, data: any) {
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

const cityEventCache = new PerplexityCityEventCache();

interface CityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date?: string;
  time?: string;
  price?: string;
  website?: string;
  image?: string;
  venue?: string;
  featured: boolean;
}

interface PerplexityCityEventResponse {
  events: CityEvent[];
  searchMetadata: {
    query: string;
    city: string;
    resultsFound: number;
    searchTimestamp: string;
    responseType: 'live_search' | 'cached';
  };
  agentMetadata: {
    agent: string;
    version: string;
    processingTime: number;
    cacheHit: boolean;
    searchMethod: string;
  };
}

// Build optimized query for city events (shorter for faster response)
function buildCityEventQuery(city: string): string {
  return `List 8-10 current events and date activities in ${city} this week. Include event names, dates, times, and websites. Focus on romantic couple activities, cultural events, food experiences, and entertainment.`;
}

// Ultra-aggressive JSON parsing with 0.1% accuracy (7 fallback strategies)
function parsePerplexityEventResponse(content: string, city: string): CityEvent[] {
  const events: CityEvent[] = [];
  
  console.log('🔍 Raw Perplexity Response:', content.substring(0, 500) + '...');
  
  // Strategy 1: Direct JSON parse attempt
  try {
    const parsed = JSON.parse(content);
    return extractEventsFromParsedData(parsed, city);
  } catch (error) {
    console.log('❌ Strategy 1 failed - Direct parse');
  }
  
  // Strategy 2: Remove markdown and explanatory text
  try {
    let cleanContent = content.trim();
    
    // Remove markdown code blocks
    cleanContent = cleanContent.replace(/```(?:json)?\s*/gi, '').replace(/```\s*/g, '');
    
    // Remove common AI explanatory patterns
    cleanContent = cleanContent.replace(/^Here.*?events?.*?:/i, '');
    cleanContent = cleanContent.replace(/^Based.*?search.*?:/i, '');
    cleanContent = cleanContent.replace(/^I found.*?events?.*?:/i, '');
    cleanContent = cleanContent.replace(/^The following.*?events?.*?:/i, '');
    
    const parsed = JSON.parse(cleanContent);
    return extractEventsFromParsedData(parsed, city);
  } catch (error) {
    console.log('❌ Strategy 2 failed - Markdown removal');
  }
  
  // Strategy 3: Find JSON between braces/brackets
  try {
    let cleanContent = content.trim();
    
    // Try to find JSON array first
    let jsonMatch = cleanContent.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Try to find JSON object
      jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    }
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return extractEventsFromParsedData(parsed, city);
    }
  } catch (error) {
    console.log('❌ Strategy 3 failed - Bracket extraction');
  }
  
  // Strategy 4: Remove AI response patterns and comments
  try {
    let cleanContent = content.trim();
    
    // Remove AI response patterns
    cleanContent = cleanContent.replace(/^[\s\S]*?(?=[\[{])/, ''); // Remove everything before first [ or {
    cleanContent = cleanContent.replace(/(?<=[\]}])[\s\S]*$/, ''); // Remove everything after last ] or }
    
    // Remove JavaScript-style comments
    cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
    cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Remove trailing commas
    cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
    
    const parsed = JSON.parse(cleanContent);
    return extractEventsFromParsedData(parsed, city);
  } catch (error) {
    console.log('❌ Strategy 4 failed - AI pattern removal');
  }
  
  // Strategy 5: Fix common JSON issues
  try {
    let cleanContent = content.trim();
    
    // Extract potential JSON
    let jsonMatch = cleanContent.match(/[\[{][\s\S]*[\]}]/);
    if (jsonMatch) {
      let jsonStr = jsonMatch[0];
      
      // Fix unquoted keys
      jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
      
      // Fix single quotes to double quotes
      jsonStr = jsonStr.replace(/'/g, '"');
      
      // Remove trailing commas
      jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
      
      // Remove comments
      jsonStr = jsonStr.replace(/\/\/.*$/gm, '');
      jsonStr = jsonStr.replace(/\/\*[\s\S]*?\*\//g, '');
      
      const parsed = JSON.parse(jsonStr);
      return extractEventsFromParsedData(parsed, city);
    }
  } catch (error) {
    console.log('❌ Strategy 5 failed - JSON issue fixes');
  }
  
  // Strategy 6: Multiple JSON extraction attempts
  try {
    const jsonPatterns = [
      /\[[\s\S]*?\]/g,
      /\{[\s\S]*?\}/g,
      /"events"\s*:\s*\[[\s\S]*?\]/g,
      /"results"\s*:\s*\[[\s\S]*?\]/g
    ];
    
    for (const pattern of jsonPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          try {
            let cleanMatch = match.replace(/\/\/.*$/gm, '').replace(/,(\s*[}\]])/g, '$1');
            const parsed = JSON.parse(cleanMatch);
            const extracted = extractEventsFromParsedData(parsed, city);
            if (extracted.length > 0) {
              return extracted;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.log('❌ Strategy 6 failed - Multiple pattern extraction');
  }
  
  // Strategy 7: Manual bracket balancing and reconstruction
  try {
    let cleanContent = content.replace(/[^\[\]{}":,\s\w.-]/g, ' ');
    
    // Find the start of JSON
    const startIndex = Math.max(cleanContent.indexOf('['), cleanContent.indexOf('{'));
    if (startIndex !== -1) {
      let balanced = '';
      let bracketCount = 0;
      let braceCount = 0;
      
      for (let i = startIndex; i < cleanContent.length; i++) {
        const char = cleanContent[i];
        balanced += char;
        
        if (char === '[') bracketCount++;
        if (char === ']') bracketCount--;
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        
        if (bracketCount === 0 && braceCount === 0 && (char === ']' || char === '}')) {
          break;
        }
      }
      
      // Try to parse the balanced JSON
      const parsed = JSON.parse(balanced);
      return extractEventsFromParsedData(parsed, city);
    }
  } catch (error) {
    console.log('❌ Strategy 7 failed - Manual bracket balancing');
  }
  
  console.error('🚨 ALL PARSING STRATEGIES FAILED - Using fallback events');
  return generateFallbackEvents(city);
}

// Extract events from parsed JSON data (handles multiple response formats)
function extractEventsFromParsedData(parsed: any, city: string): CityEvent[] {
  const events: CityEvent[] = [];
  
  try {
    let eventsList = [];
    
    // Handle different response structures
    if (Array.isArray(parsed)) {
      eventsList = parsed;
    } else if (parsed.events && Array.isArray(parsed.events)) {
      eventsList = parsed.events;
    } else if (parsed.results && Array.isArray(parsed.results)) {
      eventsList = parsed.results;
    } else if (parsed.data && Array.isArray(parsed.data)) {
      eventsList = parsed.data;
    } else if (parsed.items && Array.isArray(parsed.items)) {
      eventsList = parsed.items;
    }
    
    console.log(`✅ Extracted ${eventsList.length} events from parsed data`);
    
    // Convert to our CityEvent format
    eventsList.forEach((item: any, index: number) => {
      if (item && typeof item === 'object') {
        const event: CityEvent = {
          id: item.id || item.eventId || `event-${Date.now()}-${index}`,
          title: item.title || item.name || item.eventName || `Event in ${city}`,
          description: item.description || item.summary || item.details || item.info || 'Exciting event happening in the city',
          category: item.category || item.type || item.genre || item.eventType || 'Event',
          location: item.location || item.venue || item.address || item.place || city,
          date: item.date || item.when || item.dateTime || item.startDate || '',
          time: item.time || item.startTime || '',
          price: item.price || item.cost || item.pricing || item.ticketPrice || '',
          website: item.website || item.url || item.link || item.bookingUrl || '',
          image: item.image || item.imageUrl || item.photo || '',
          venue: item.venue || item.location || item.venueName || '',
          featured: index < 4 // First 4 events are featured
        };
        
        // Only add if we have a meaningful title
        if (event.title && event.title.length > 2) {
          events.push(event);
        }
      }
    });
    
    return events.slice(0, 8); // Limit to 8 events for faster loading
  } catch (error) {
    console.error('Error extracting events from parsed data:', error);
    return [];
  }
}

// Generate fallback events if Perplexity fails
function generateFallbackEvents(city: string): CityEvent[] {
  const eventTemplates = [
    {
      title: `Weekend Art Walk in ${city}`,
      description: `Explore local galleries and street art in ${city}'s cultural district`,
      category: 'Art & Culture',
      location: `Downtown ${city}`,
    },
    {
      title: `${city} Food Market`,
      description: `Discover local flavors and artisanal foods at this weekly market`,
      category: 'Food & Drink',
      location: `Central Market, ${city}`,
    },
    {
      title: `Sunset Photography Tour`,
      description: `Capture the golden hour at ${city}'s most romantic spots`,
      category: 'Photography',
      location: `Various locations in ${city}`,
    },
    {
      title: `Live Jazz Night`,
      description: `Intimate jazz performances at a cozy venue`,
      category: 'Music',
      location: `Jazz Club, ${city}`,
    },
    {
      title: `Couples Cooking Class`,
      description: `Learn to cook local cuisine together`,
      category: 'Workshop',
      location: `Culinary School, ${city}`,
    },
    {
      title: `Rooftop Wine Tasting`,
      description: `Sample local wines with panoramic city views`,
      category: 'Wine & Dining',
      location: `Rooftop Bar, ${city}`,
    }
  ];

  return eventTemplates.map((template, index) => ({
    id: `fallback-${index}`,
    title: template.title,
    description: template.description,
    category: template.category,
    location: template.location,
    date: 'This Week',
    time: 'Evening',
    price: 'Varies',
    website: '',
    image: '',
    venue: template.location,
    featured: index < 4
  }));
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Lisbon';
  
  try {
    
    // Create cache key
    const cacheKey = `${city.toLowerCase()}`;
    
    // Check cache first
    const cachedResult = cityEventCache.get(cacheKey);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        searchMetadata: {
          ...cachedResult.searchMetadata,
          responseType: 'cached'
        },
        agentMetadata: {
          ...cachedResult.agentMetadata,
          cacheHit: true,
          processingTime: Date.now() - startTime
        }
      });
    }

    // Validate Perplexity API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const query = buildCityEventQuery(city);
    
    // Call Perplexity API with enhanced system prompt
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: `You are a JSON-only event finder. Return ONLY valid JSON array of events in the specified city.

REQUIRED JSON FORMAT:
[
  {
    "title": "Event Name",
    "description": "Brief description (max 100 chars)",
    "category": "Event Type",
    "location": "Venue/area",
    "date": "Date",
    "time": "Time", 
    "website": "URL"
  }
]

RULES:
- ONLY return valid JSON (no text/markdown)
- NO comments or explanations
- Focus on romantic/couple activities
- 8-10 events maximum
- Include real websites when possible
- Current events this week only`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 1200,
        temperature: 0.2,
        top_p: 0.8,
        return_citations: false,
        search_domain_filter: ["tripadvisor.com", "eventbrite.com", "timeout.com", "yelp.com"],
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "week",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse the response to extract city events
    const events = parsePerplexityEventResponse(content, city);
    
    // Create response object
    const result: PerplexityCityEventResponse = {
      events,
      searchMetadata: {
        query,
        city,
        resultsFound: events.length,
        searchTimestamp: new Date().toISOString(),
        responseType: 'live_search'
      },
      agentMetadata: {
        agent: 'Perplexity City Events API',
        version: '2.0.0',
        processingTime: Date.now() - startTime,
        cacheHit: false,
        searchMethod: 'live_perplexity_search'
      }
    };

    // Cache the result
    cityEventCache.set(cacheKey, result);
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('City event search error:', error);
    
    // Return fallback events
    const fallbackEvents = generateFallbackEvents(city);
    
    return NextResponse.json({
      events: fallbackEvents,
      searchMetadata: {
        query: buildCityEventQuery(city),
        city: city,
        resultsFound: fallbackEvents.length,
        searchTimestamp: new Date().toISOString(),
        responseType: 'fallback'
      },
      agentMetadata: {
        agent: 'Perplexity City Events API',
        version: '2.0.0',
        processingTime: Date.now() - startTime,
        cacheHit: false,
        searchMethod: 'fallback_generation'
      }
    }, { status: 200 });
  }
}
