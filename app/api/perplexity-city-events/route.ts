import { NextRequest, NextResponse } from 'next/server';

// Cache system for Perplexity city events
class PerplexityCityEventCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly maxSize = 100;
  private readonly cacheDuration = 2 * 60 * 60 * 1000; // 2 hours for ultra-fast loading

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

// Pre-seed cache with instant data for popular cities
const INSTANT_CITY_DATA = {
  'lisbon': {
    events: [
      {
        id: 'lisbon-1',
        title: 'Fado Night at Alfama',
        description: 'Traditional Portuguese fado music in historic quarter',
        category: 'Music',
        location: 'Alfama District',
        date: 'This Week',
        time: '9:00 PM',
        website: 'https://timeout.com/lisbon',
        image: '',
        venue: 'Casa do Fado',
        featured: true
      },
      {
        id: 'lisbon-2',
        title: 'Sunset at Miradouro da Senhora do Monte',
        description: 'Romantic sunset views over the city',
        category: 'Romance',
        location: 'Graça',
        date: 'Daily',
        time: '7:30 PM',
        website: 'https://visitlisboa.com',
        image: '',
        venue: 'Miradouro da Senhora do Monte',
        featured: true
      },
      {
        id: 'lisbon-3',
        title: 'Time Out Market Food Tour',
        description: 'Explore local flavors and artisanal foods',
        category: 'Food',
        location: 'Mercado da Ribeira',
        date: 'This Week',
        time: '6:00 PM',
        website: 'https://timeoutmarket.com',
        image: '',
        venue: 'Time Out Market',
        featured: true
      },
      {
        id: 'lisbon-4',
        title: 'Tram 28 Romantic Tour',
        description: 'Historic tram ride through Lisbon landmarks',
        category: 'Tours',
        location: 'City Center',
        date: 'Daily',
        time: '10:00 AM',
        website: 'https://carris.pt',
        image: '',
        venue: 'Tram 28',
        featured: true
      },
      {
        id: 'lisbon-5',
        title: 'LX Factory Art Walk',
        description: 'Underground art scene and creative spaces',
        category: 'Art',
        location: 'LX Factory',
        date: 'This Week',
        time: '3:00 PM',
        website: 'https://lxfactory.com',
        image: '',
        venue: 'LX Factory',
        featured: false
      }
    ]
  },
  'newyork': {
    events: [
      {
        id: 'ny-1',
        title: 'Broadway Show Date Night',
        description: 'Latest Broadway productions and classic shows',
        category: 'Theater',
        location: 'Theater District',
        date: 'This Week',
        time: '8:00 PM',
        website: 'https://broadway.com',
        image: '',
        venue: 'Broadway Theaters',
        featured: true
      },
      {
        id: 'ny-2',
        title: 'Central Park Picnic',
        description: 'Romantic picnic in the heart of Manhattan',
        category: 'Outdoors',
        location: 'Central Park',
        date: 'Daily',
        time: '12:00 PM',
        website: 'https://centralparknyc.org',
        image: '',
        venue: 'Central Park',
        featured: true
      },
      {
        id: 'ny-3',
        title: 'Museum of Modern Art',
        description: 'World-class contemporary art exhibitions',
        category: 'Art',
        location: 'Midtown Manhattan',
        date: 'This Week',
        time: '11:00 AM',
        website: 'https://moma.org',
        image: '',
        venue: 'MoMA',
        featured: true
      },
      {
        id: 'ny-4',
        title: 'High Line Sunset Walk',
        description: 'Elevated park with stunning city views',
        category: 'Romance',
        location: 'Chelsea',
        date: 'Daily',
        time: '6:00 PM',
        website: 'https://thehighline.org',
        image: '',
        venue: 'High Line',
        featured: true
      },
      {
        id: 'ny-5',
        title: 'Rooftop Bar Hopping',
        description: 'Sky-high cocktails with Manhattan views',
        category: 'Nightlife',
        location: 'Various Rooftops',
        date: 'This Week',
        time: '7:00 PM',
        website: 'https://timeout.com/newyork',
        image: '',
        venue: 'NYC Rooftops',
        featured: false
      }
    ]
  },
  'london': {
    events: [
      {
        id: 'london-1',
        title: 'Thames River Cruise',
        description: 'Romantic boat ride along the Thames',
        category: 'Romance',
        location: 'Thames River',
        date: 'Daily',
        time: '7:00 PM',
        website: 'https://thamesclippers.com',
        image: '',
        venue: 'Thames River',
        featured: true
      },
      {
        id: 'london-2',
        title: 'West End Show',
        description: 'World-class theater productions',
        category: 'Theater',
        location: 'West End',
        date: 'This Week',
        time: '7:30 PM',
        website: 'https://londontheatre.co.uk',
        image: '',
        venue: 'West End Theaters',
        featured: true
      },
      {
        id: 'london-3',
        title: 'Borough Market Food Tour',
        description: 'Gourmet food market experience',
        category: 'Food',
        location: 'Borough Market',
        date: 'This Week',
        time: '11:00 AM',
        website: 'https://boroughmarket.org.uk',
        image: '',
        venue: 'Borough Market',
        featured: true
      },
      {
        id: 'london-4',
        title: 'London Eye at Sunset',
        description: 'Iconic observation wheel with city views',
        category: 'Romance',
        location: 'South Bank',
        date: 'Daily',
        time: '6:30 PM',
        website: 'https://londoneye.com',
        image: '',
        venue: 'London Eye',
        featured: true
      }
    ]
  },
  'paris': {
    events: [
      {
        id: 'paris-1',
        title: 'Seine River Dinner Cruise',
        description: 'Romantic dinner cruise with Eiffel Tower views',
        category: 'Romance',
        location: 'Seine River',
        date: 'Daily',
        time: '8:00 PM',
        website: 'https://bateauxparisiens.com',
        image: '',
        venue: 'Seine River',
        featured: true
      },
      {
        id: 'paris-2',
        title: 'Louvre Museum Evening',
        description: 'World-famous art museum after hours',
        category: 'Art',
        location: 'Louvre',
        date: 'This Week',
        time: '6:00 PM',
        website: 'https://louvre.fr',
        image: '',
        venue: 'Louvre Museum',
        featured: true
      },
      {
        id: 'paris-3',
        title: 'Montmartre Artist Quarter',
        description: 'Bohemian neighborhood with street artists',
        category: 'Art',
        location: 'Montmartre',
        date: 'Daily',
        time: '3:00 PM',
        website: 'https://parisinfo.com',
        image: '',
        venue: 'Montmartre',
        featured: true
      },
      {
        id: 'paris-4',
        title: 'Eiffel Tower Picnic',
        description: 'Romantic picnic with iconic tower views',
        category: 'Romance',
        location: 'Champ de Mars',
        date: 'Daily',
        time: '5:00 PM',
        website: 'https://toureiffel.paris',
        image: '',
        venue: 'Champ de Mars',
        featured: true
      }
    ]
  },
  'tokyo': {
    events: [
      {
        id: 'tokyo-1',
        title: 'Shibuya Sky Observation Deck',
        description: 'Panoramic views of Tokyo skyline',
        category: 'Romance',
        location: 'Shibuya',
        date: 'Daily',
        time: '6:00 PM',
        website: 'https://shibuya-sky.com',
        image: '',
        venue: 'Shibuya Sky',
        featured: true
      },
      {
        id: 'tokyo-2',
        title: 'Tsukiji Outer Market Food Tour',
        description: 'Fresh sushi and Japanese street food',
        category: 'Food',
        location: 'Tsukiji',
        date: 'This Week',
        time: '9:00 AM',
        website: 'https://tsukiji.or.jp',
        image: '',
        venue: 'Tsukiji Market',
        featured: true
      },
      {
        id: 'tokyo-3',
        title: 'Traditional Tea Ceremony',
        description: 'Authentic Japanese tea ceremony experience',
        category: 'Culture',
        location: 'Various Tea Houses',
        date: 'This Week',
        time: '2:00 PM',
        website: 'https://gotokyo.org',
        image: '',
        venue: 'Traditional Tea House',
        featured: true
      },
      {
        id: 'tokyo-4',
        title: 'Senso-ji Temple Evening',
        description: 'Historic temple illuminated at night',
        category: 'Culture',
        location: 'Asakusa',
        date: 'Daily',
        time: '7:00 PM',
        website: 'https://senso-ji.jp',
        image: '',
        venue: 'Senso-ji Temple',
        featured: true
      }
    ]
  }
};

// Pre-seed the cache with instant data
Object.entries(INSTANT_CITY_DATA).forEach(([city, data]) => {
  const response = {
    events: data.events,
    searchMetadata: {
      query: `Events in ${city}`,
      city: city,
      resultsFound: data.events.length,
      searchTimestamp: new Date().toISOString(),
      responseType: 'instant_cache' as const
    },
    agentMetadata: {
      agent: 'Perplexity City Events API',
      version: '2.0.0',
      processingTime: 0,
      cacheHit: false,
      searchMethod: 'instant_preload'
    }
  };
  cityEventCache.set(city, response);
});

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

// Get city-specific domains for better local results
function getCitySpecificDomains(city: string): string[] {
  const baseDomains = [
    "timeout.com", 
    "ticketmaster.com", 
    "meetup.com", 
    "facebook.com/events",
    "allevents.in",
    "bandsintown.com",
    "songkick.com",
    "resident-advisor.net",
    "dice.fm",
    "designmynight.com",
    "goldstar.com",
    "universe.com",
    "peatix.com",
    "foursquare.com",
    "citysocializer.com"
  ];

  // Add city-specific domains
  const cityLower = city.toLowerCase().replace(/\s+/g, '');
  
  switch (cityLower) {
    case 'newyork':
      return [...baseDomains, "timeout.com/newyork", "nycgo.com", "nyc.gov/events", "newyorker.com"];
    case 'london':
      return [...baseDomains, "timeout.com/london", "londonist.com", "visitlondon.com", "designmynight.com"];
    case 'paris':
      return [...baseDomains, "timeout.fr", "parisinfo.com", "sortiraparis.com", "paris.fr"];
    case 'tokyo':
      return [...baseDomains, "timeout.com/tokyo", "tokyocheapo.com", "gotokyo.org", "japantimes.co.jp"];
    case 'barcelona':
      return [...baseDomains, "timeout.com/barcelona", "barcelona.cat", "bcn.travel", "timeout.cat"];
    case 'amsterdam':
      return [...baseDomains, "timeout.com/amsterdam", "iamsterdam.com", "amsterdam.nl", "dutchreview.com"];
    case 'berlin':
      return [...baseDomains, "timeout.com/berlin", "berlin.de", "visitberlin.de", "exberliner.com"];
    case 'rome':
      return [...baseDomains, "timeout.com/rome", "turismoroma.it", "rome.net", "wantedinrome.com"];
    case 'madrid':
      return [...baseDomains, "timeout.com/madrid", "esmadrid.com", "madrid.es", "madridsecreto.co"];
    case 'lisbon':
      return [...baseDomains, "timeout.com/lisbon", "visitlisboa.com", "lisbonlux.com", "golisbon.com"];
    default:
      return baseDomains;
  }
}
function buildCityEventQuery(city: string): string {
  return `Search TimeOut, Bandsintown, Meetup, Facebook Events, Ticketmaster, and local venue websites for current events in ${city} this week. Find diverse activities: live music, art exhibitions, food markets, workshops, cultural events, nightlife. Include venue names, dates, times, and direct booking URLs. Focus on couple-friendly experiences from non-Eventbrite sources.`;
}

// Ultra-aggressive JSON parsing with 0.1% accuracy (8 enhanced fallback strategies)
function parsePerplexityEventResponse(content: string, city: string): CityEvent[] {
  console.log('🔍 Raw Perplexity Response:', content.substring(0, 500) + '...');
  
  // Strategy 1: Direct JSON parse attempt
  try {
    const parsed = JSON.parse(content);
    return extractEventsFromParsedData(parsed, city);
  } catch (error) {
    console.log('❌ Strategy 1 failed - Direct parse');
  }
  
  // Strategy 2: Extract and reconstruct JSON from descriptive text
  try {
    const events: CityEvent[] = [];
    const lines = content.split('\n');
    let currentEvent: any = {};
    let eventIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Detect event start (numbered items)
      if (/^\d+\.\s?\*\*/.test(line) || /^\*\*\d+/.test(line)) {
        if (currentEvent.title) {
          events.push(createEventFromData(currentEvent, city, eventIndex++));
        }
        currentEvent = {};
        // Extract title
        const titleMatch = line.match(/\*\*(.*?)\*\*/);
        if (titleMatch) {
          currentEvent.title = titleMatch[1].trim();
        }
      }
      
      // Extract specific fields
      if (line.includes('**Title:**')) {
        currentEvent.title = line.replace(/.*\*\*Title:\*\*\s*/, '').trim();
      }
      if (line.includes('**Description:**')) {
        currentEvent.description = line.replace(/.*\*\*Description:\*\*\s*/, '').trim();
      }
      if (line.includes('**Category:**')) {
        currentEvent.category = line.replace(/.*\*\*Category:\*\*\s*/, '').trim();
      }
      if (line.includes('**Location:**')) {
        currentEvent.location = line.replace(/.*\*\*Location:\*\*\s*/, '').trim();
      }
      if (line.includes('**Date:**')) {
        currentEvent.date = line.replace(/.*\*\*Date:\*\*\s*/, '').trim();
      }
      if (line.includes('**Time:**')) {
        currentEvent.time = line.replace(/.*\*\*Time:\*\*\s*/, '').trim();
      }
      if (line.includes('**Website:**')) {
        const websiteMatch = line.match(/\[(.*?)\]\((.*?)\)/);
        if (websiteMatch) {
          currentEvent.website = websiteMatch[2];
        }
      }
    }
    
    // Add the last event
    if (currentEvent.title) {
      events.push(createEventFromData(currentEvent, city, eventIndex));
    }
    
    if (events.length > 0) {
      console.log(`✅ Strategy 2 success - Extracted ${events.length} events from descriptive text`);
      return events.slice(0, 8);
    }
  } catch (error) {
    console.log('❌ Strategy 2 failed - Descriptive text parsing');
  }
  
  // Strategy 3: Remove markdown and explanatory text
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
    console.log('❌ Strategy 3 failed - Markdown removal');
  }
  
  // Strategy 4: Find JSON between braces/brackets
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
    console.log('❌ Strategy 4 failed - Bracket extraction');
  }
  
  // Strategy 5: Remove AI response patterns and comments
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
    console.log('❌ Strategy 5 failed - AI pattern removal');
  }
  
  // Strategy 6: Fix common JSON issues
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
    console.log('❌ Strategy 6 failed - JSON issue fixes');
  }
  
  // Strategy 7: Multiple JSON extraction attempts
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
    console.log('❌ Strategy 7 failed - Multiple pattern extraction');
  }
  
  // Strategy 8: Manual bracket balancing and reconstruction
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
    console.log('❌ Strategy 8 failed - Manual bracket balancing');
  }
  
  console.error('🚨 ALL PARSING STRATEGIES FAILED - Using fallback events');
  return generateFallbackEvents(city);
}

// Helper function to create event from extracted data
function createEventFromData(data: any, city: string, index: number): CityEvent {
  return {
    id: `extracted-${Date.now()}-${index}`,
    title: data.title || `Event in ${city}`,
    description: data.description || 'Exciting event happening in the city',
    category: data.category || 'Event',
    location: data.location || city,
    date: data.date || 'This Week',
    time: data.time || '',
    price: data.price || '',
    website: data.website || '',
    image: data.image || '',
    venue: data.venue || data.location || '',
    featured: index < 4
  };
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
      title: `Local Music Night at ${city} Jazz Club`,
      description: `Live jazz and blues performances by local artists`,
      category: 'Music',
      location: `Downtown ${city}`,
      website: 'https://timeout.com'
    },
    {
      title: `${city} Food & Wine Festival`,
      description: `Taste local cuisine and wines from regional producers`,
      category: 'Food & Drink',
      location: `Central Park, ${city}`,
      website: 'https://meetup.com'
    },
    {
      title: `Art Gallery Walk in ${city}`,
      description: `Explore contemporary art exhibitions and installations`,
      category: 'Art & Culture',
      location: `Arts District, ${city}`,
      website: 'https://timeout.com'
    },
    {
      title: `Couples Salsa Dancing Class`,
      description: `Learn salsa dancing in a fun, social environment`,
      category: 'Dance',
      location: `Dance Studio, ${city}`,
      website: 'https://meetup.com'
    },
    {
      title: `Rooftop Cinema Under the Stars`,
      description: `Watch classic films on a rooftop with city views`,
      category: 'Film',
      location: `Rooftop Venue, ${city}`,
      website: 'https://universe.com'
    },
    {
      title: `Local Brewery Tour & Tasting`,
      description: `Discover craft beers and brewing process`,
      category: 'Tours',
      location: `Brewery District, ${city}`,
      website: 'https://goldstar.com'
    },
    {
      title: `Night Photography Workshop`,
      description: `Capture the city's beauty in evening light`,
      category: 'Workshop',
      location: `Various locations, ${city}`,
      website: 'https://peatix.com'
    },
    {
      title: `Live Comedy Show`,
      description: `Stand-up comedy featuring local and touring comedians`,
      category: 'Comedy',
      location: `Comedy Club, ${city}`,
      website: 'https://ticketmaster.com'
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
    website: template.website,
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
    // Normalize city name for cache lookup
    const normalizedCity = city.toLowerCase().trim().replace(/\s+/g, '');
    const cacheKey = normalizedCity;
    
    console.log(`🔍 Looking for cached data for: "${cacheKey}" (original: "${city}")`);
    
    // Check cache first - prioritize instant cache
    const cachedResult = cityEventCache.get(cacheKey);
    if (cachedResult) {
      console.log(`✅ Cache HIT for ${cacheKey} - returning instant results`);
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
    
    console.log(`❌ Cache MISS for ${cacheKey} - proceeding with live API call`);

    // Validate Perplexity API key
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      throw new Error('Perplexity API key not configured');
    }

    const query = buildCityEventQuery(city);
    const searchDomains = getCitySpecificDomains(city);
    
    console.log('🔍 Perplexity API Request:', {
      city: normalizedCity,
      query: query.substring(0, 100) + '...'
    });
    
    const requestBody = {
      model: 'llama-3.1-sonar-small-128k-online',        messages: [
          {
            role: 'system',
            content: `CRITICAL: YOU MUST ONLY RETURN VALID JSON. NO TEXT, NO EXPLANATIONS, NO MARKDOWN.

REQUIRED JSON FORMAT (COPY EXACTLY):
[
  {
    "title": "Event Name",
    "description": "Brief description (max 100 chars)",
    "category": "Event Type",
    "location": "Venue/area",
    "date": "Date",
    "time": "Time", 
    "website": "Direct event URL"
  }
]

SEARCH REQUIREMENTS:
- Find 8-10 REAL events from diverse venues/platforms
- Search TimeOut, Bandsintown, Meetup, Facebook Events, Ticketmaster
- Include cultural events, music shows, food experiences, workshops  
- Focus on romantic/couple-friendly activities
- Current week events only
- Include direct booking/info URLs when available

CRITICAL: OUTPUT ONLY THE JSON ARRAY. NOTHING ELSE.`
          },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 1200,
      temperature: 0.2,
      stream: false
    };
    
    // Call Perplexity API with corrected parameters
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText} - ${errorText}`);
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

    // Cache the result with normalized key (only if not fallback)
    if (events.length > 0 && !events[0].id.startsWith('fallback-')) {
      cityEventCache.set(cacheKey, result);
      console.log(`💾 Cached result for ${cacheKey}`);
    } else {
      console.log(`⚠️ NOT caching fallback events for ${cacheKey}`);
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('City event search error:', error);
    
    // Return fallback events but DON'T cache them
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
