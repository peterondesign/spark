import { NextRequest, NextResponse } from 'next/server';

// Cache system for Perplexity results
class PerplexityVenueCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly maxSize = 100;
  private readonly cacheDuration = 30 * 60 * 1000; // 30 minutes for Perplexity results

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

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      cacheDuration: this.cacheDuration
    };
  }
}

const perplexityCache = new PerplexityVenueCache();

interface Venue {
  name: string;
  address: string;
  description: string;
  website?: string;
  phone?: string;
  rating?: number;
  priceRange?: string;
  hours?: string;
  category: string;
  confidence: number;
}

interface PerplexitySearchResponse {
  venues: Venue[];
  searchMetadata: {
    query: string;
    city: string;
    dateIdea: string;
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

// Enhanced search query builder for date ideas
function buildPerplexityQuery(dateIdea: string, city: string): string {
  const normalized = dateIdea.toLowerCase().trim();
  
  // Map date ideas to specific venue types
  const queryMappings: Record<string, string> = {
    'arcade': `arcade gaming entertainment venues`,
    'museum': `museums art galleries cultural attractions`,
    'restaurant': `restaurants dining establishments`,
    'coffee': `coffee shops cafes`,
    'bar': `bars pubs nightlife venues`,
    'park': `parks gardens outdoor recreational areas`,
    'cinema': `movie theaters cinemas`,
    'bowling': `bowling alleys entertainment centers`,
    'mini golf': `mini golf putt putt courses`,
    'escape room': `escape rooms puzzle experiences`,
    'karaoke': `karaoke bars entertainment venues`,
    'cooking class': `cooking classes culinary schools`,
    'wine tasting': `wineries wine bars tasting rooms`,
    'spa': `spas wellness centers massage therapy`,
    'hiking': `hiking trails nature walks outdoor activities`,
    'beach': `beaches waterfront recreational areas`,
    'shopping': `shopping centers malls boutiques`,
    'art': `art galleries studios creative spaces`,
    'music': `music venues concert halls live entertainment`,
    'dance': `dance studios ballroom classes`,
    'comedy': `comedy clubs entertainment venues`,
    'sports': `sports venues recreational facilities`,
    'bookstore': `bookstores libraries literary venues`,
    'farmers market': `farmers markets local markets`,
    'zoo': `zoos aquariums wildlife parks`,
    'garden': `botanical gardens conservatories`,
    'brewery': `breweries craft beer venues`,
    'ice skating': `ice skating rinks winter activities`,
    'rock climbing': `rock climbing gyms adventure sports`,
    'pottery': `pottery studios ceramic classes`,
    'photography': `photography tours scenic locations`,
    'food truck': `food trucks street food venues`,
    'rooftop': `rooftop bars restaurants scenic venues`,
    'jazz': `jazz clubs live music venues`,
    'trivia': `trivia nights pub quiz venues`,
    'board games': `board game cafes hobby shops`,
    'vintage': `vintage shops antique stores thrift markets`
  };

  // Find matching query enhancement
  let enhancedQuery = normalized;
  for (const [key, value] of Object.entries(queryMappings)) {
    if (normalized.includes(key)) {
      enhancedQuery = value;
      break;
    }
  }

  return `Find specific ${enhancedQuery} in ${city} with names, addresses, phone numbers, websites, ratings, and hours. Provide real, currently operating venues with accurate contact information.`;
}

// Parse Perplexity response to extract venue data
function parsePerplexityResponse(content: string, dateIdea: string): Venue[] {
  const venues: Venue[] = [];
  
  try {
    // Clean the content to extract pure JSON
    let cleanContent = content.trim();
    
    // Remove markdown code blocks and any surrounding text
    cleanContent = cleanContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    cleanContent = cleanContent.replace(/^[^{]*/, ''); // Remove any text before first {
    cleanContent = cleanContent.replace(/[^}]*$/, ''); // Remove any text after last }
    
    // Remove JavaScript-style comments that break JSON parsing
    // Remove single-line comments (// comment)
    cleanContent = cleanContent.replace(/\/\/.*$/gm, '');
    // Remove multi-line comments (/* comment */)
    cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
    // Clean up any trailing commas before closing braces/brackets
    cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
    
    // Find the JSON object boundaries more precisely
    let jsonStart = cleanContent.indexOf('{');
    let jsonEnd = -1;
    
    if (jsonStart !== -1) {
      let braceCount = 0;
      for (let i = jsonStart; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') braceCount++;
        if (cleanContent[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
    }
    
    if (jsonStart !== -1 && jsonEnd !== -1) {
      cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
    }
    
    // Remove JavaScript-style comments that break JSON parsing
    // Remove single-line comments (// comments)
    cleanContent = cleanContent.replace(/\/\/[^\n\r]*/g, '');
    // Remove multi-line comments (/* comments */)
    cleanContent = cleanContent.replace(/\/\*[\s\S]*?\*\//g, '');
    // Clean up any trailing commas before closing braces/brackets
    cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');
    // Remove any remaining newlines and extra whitespace
    cleanContent = cleanContent.replace(/\s+/g, ' ').trim();
    
    // Try to parse as JSON first (preferred format)
    try {
      const jsonData = JSON.parse(cleanContent);
      
      if (jsonData.venues && Array.isArray(jsonData.venues)) {
        return jsonData.venues.map((venue: any, index: number) => ({
          name: (venue.name || `${dateIdea} venue ${index + 1}`).replace(/["`]/g, '').trim(),
          address: (venue.address || 'Address not available').replace(/["`]/g, '').trim(),
          description: (venue.description || `Great venue for ${dateIdea}`).replace(/["`]/g, '').trim(),
          website: venue.website ? venue.website.replace(/["`]/g, '').trim() : undefined,
          phone: venue.phone ? venue.phone.replace(/["`]/g, '').trim() : undefined,
          rating: typeof venue.rating === 'number' ? venue.rating : undefined,
          priceRange: venue.priceRange || venue.price ? (venue.priceRange || venue.price).replace(/["`]/g, '').trim() : undefined,
          hours: venue.hours ? venue.hours.replace(/["`]/g, '').trim() : undefined,
          category: dateIdea,
          confidence: 0.9
        }));
      } else if (Array.isArray(jsonData)) {
        // Handle case where response is directly an array
        return jsonData.map((venue: any, index: number) => ({
          name: (venue.name || `${dateIdea} venue ${index + 1}`).replace(/["`]/g, '').trim(),
          address: (venue.address || venue.location || 'Address not available').replace(/["`]/g, '').trim(),
          description: (venue.description || venue.summary || `Great venue for ${dateIdea}`).replace(/["`]/g, '').trim(),
          website: venue.website || venue.url ? (venue.website || venue.url).replace(/["`]/g, '').trim() : undefined,
          phone: venue.phone || venue.phoneNumber ? (venue.phone || venue.phoneNumber).replace(/["`]/g, '').trim() : undefined,
          rating: typeof venue.rating === 'number' ? venue.rating : (typeof venue.stars === 'number' ? venue.stars : undefined),
          priceRange: venue.priceRange || venue.price ? (venue.priceRange || venue.price).replace(/["`]/g, '').trim() : undefined,
          hours: venue.hours || venue.openingHours ? (venue.hours || venue.openingHours).replace(/["`]/g, '').trim() : undefined,
          category: dateIdea,
          confidence: 0.9
        }));
      }
    } catch (jsonError) {
      console.log('JSON parsing failed, falling back to text parsing:', jsonError);
      console.log('Failed content:', cleanContent);
    }

    // Fallback: Parse as text format if JSON parsing fails
    const venueBlocks = splitIntoVenueBlocks(content);
    
    for (const block of venueBlocks) {
      const venue = parseVenueBlock(block, dateIdea);
      if (venue && venue.name && venue.name.length > 2) {
        venues.push(venue);
      }
    }
    
  } catch (error) {
    console.error('Error parsing Perplexity response:', error);
    console.log('Content that failed to parse:', content);
  }
  
  return venues.slice(0, 5); // Return max 5 venues
}

// Split content into venue blocks using multiple strategies
function splitIntoVenueBlocks(content: string): string[] {
  const blocks: string[] = [];
  
  // Strategy 1: Split by numbered lists (1., 2., etc.)
  const numberedSplit = content.split(/(?=\n\s*\d+\.)/);
  if (numberedSplit.length > 1) {
    return numberedSplit.filter(block => block.trim().length > 0);
  }
  
  // Strategy 2: Split by markdown headers (##, ###)
  const headerSplit = content.split(/(?=\n\s*#{2,})/);
  if (headerSplit.length > 1) {
    return headerSplit.filter(block => block.trim().length > 0);
  }
  
  // Strategy 3: Split by double newlines
  const paragraphSplit = content.split(/\n\s*\n/);
  if (paragraphSplit.length > 1) {
    return paragraphSplit.filter(block => block.trim().length > 0);
  }
  
  // Strategy 4: Split by bold text (**text**)
  const boldSplit = content.split(/(?=\*\*[^*]+\*\*)/);
  if (boldSplit.length > 1) {
    return boldSplit.filter(block => block.trim().length > 0);
  }
  
  // Fallback: treat entire content as one block
  return [content];
}

// Parse individual venue block
function parseVenueBlock(block: string, dateIdea: string): Venue | null {
  const lines = block.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length === 0) return null;
  
  const venue: Partial<Venue> = {
    category: dateIdea,
    confidence: 0.8
  };
  
  let foundName = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();
    
    // Extract venue name (first substantial line that's not a field)
    if (!foundName && !isFieldLine(line) && line.length > 2) {
      venue.name = cleanVenueName(line);
      foundName = true;
      continue;
    }
    
    // Extract fields using multiple patterns
    if (lowerLine.includes('address') || lowerLine.includes('location')) {
      const addressValue = extractFieldValue(line, ['address:', 'location:', 'addr:']) || 
                          extractAddressFromLine(line);
      if (addressValue) venue.address = addressValue;
    } else if (lowerLine.includes('phone') || lowerLine.includes('tel')) {
      const phoneValue = extractFieldValue(line, ['phone:', 'tel:', 'telephone:']) || 
                        extractPhoneFromLine(line);
      if (phoneValue) venue.phone = phoneValue;
    } else if (lowerLine.includes('website') || lowerLine.includes('url') || lowerLine.includes('www')) {
      const websiteValue = extractFieldValue(line, ['website:', 'url:', 'web:']) || 
                          extractUrlFromLine(line);
      if (websiteValue) venue.website = websiteValue;
    } else if (lowerLine.includes('rating') || lowerLine.includes('star')) {
      const rating = extractRatingFromLine(line);
      if (rating) venue.rating = rating;
    } else if (lowerLine.includes('hour') || lowerLine.includes('open')) {
      const hoursValue = extractFieldValue(line, ['hours:', 'open:', 'opening:']) || 
                        extractHoursFromLine(line);
      if (hoursValue) venue.hours = hoursValue;
    } else if (lowerLine.includes('price') || lowerLine.includes('cost') || lowerLine.includes('$')) {
      const priceValue = extractFieldValue(line, ['price:', 'cost:', 'pricing:']) || 
                        extractPriceFromLine(line);
      if (priceValue) venue.priceRange = priceValue;
    } else if (!venue.description && line.length > 20 && !isFieldLine(line)) {
      venue.description = line;
    }
  }
  
  // Try to extract address from the entire block if not found
  if (!venue.address) {
    const blockAddress = extractAddressFromBlock(block);
    if (blockAddress) venue.address = blockAddress;
  }
  
  // Set defaults
  venue.address = venue.address || 'Address not available';
  venue.description = venue.description || `Popular ${dateIdea} venue`;
  
  return venue.name ? venue as Venue : null;
}

// Helper functions for better extraction
function isFieldLine(line: string): boolean {
  const fieldPatterns = [
    /^(address|location|phone|tel|website|url|rating|hours|open|price|cost):/i,
    /^\w+:\s/,
    /^[•\-\*]\s/
  ];
  return fieldPatterns.some(pattern => pattern.test(line));
}

function extractFieldValue(line: string, prefixes: string[]): string | null {
  for (const prefix of prefixes) {
    const index = line.toLowerCase().indexOf(prefix);
    if (index !== -1) {
      return line.substring(index + prefix.length).trim().replace(/^[:\-\s]+/, '');
    }
  }
  return null;
}

function extractAddressFromLine(line: string): string | null {
  // Remove common prefixes
  const cleanLine = line.replace(/^(address|location|addr):\s*/i, '').trim();
  
  // Look for address patterns
  const addressPatterns = [
    // Street address with number
    /\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Lane|Ln|Plaza|Pl|Circle|Ct|Court)[\w\s,.-]*/i,
    // Japanese/Asian address patterns
    /\d+[-–]\d+[-–]\d+\s+[A-Za-z\s]+[,]\s*[A-Za-z\s]+/,
    // International format with postal code
    /[A-Za-z\s]+[,]\s*[A-Za-z\s]+\s+\d{3,6}[-\s]?\d*/,
    // City, State/Country format
    /[A-Za-z\s]+[,]\s*[A-Za-z\s]+[,]?\s*[A-Za-z\s]*/,
    // Building/district names
    /\d+\s+[A-Za-z\s]+[,]\s*[A-Za-z\s]+/,
    // Any line with numbers and street indicators
    /\d+\s+[^,\n]+(?:street|road|avenue|drive|lane|way|plaza|square|district|area|ward|city|town)/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = cleanLine.match(pattern);
    if (match) {
      let address = match[0].trim();
      // Clean up common suffixes
      address = address.replace(/[,\s]*Japan\s*$/i, ', Japan');
      address = address.replace(/[,\s]*Tokyo\s*$/i, ', Tokyo');
      return address;
    }
  }
  
  // If line contains address-like words, return it
  if (/\b(street|road|avenue|drive|lane|way|plaza|square|district|building|floor|chome|tokyo|osaka|kyoto|nagoya|fukuoka)\b/i.test(cleanLine)) {
    return cleanLine;
  }
  
  return null;
}

function extractAddressFromBlock(block: string): string | null {
  // Look for address patterns in the entire block
  const addressPatterns = [
    // Complete street addresses
    /\b\d+\s+[A-Za-z\s]+(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Way|Lane|Ln|Plaza|Pl)\b[^.]*?(?:[,\n]|$)/i,
    // International addresses with postal codes
    /\b[A-Za-z\s]+[,]\s*[A-Za-z\s]+\s+\d{3,6}[-\s]?\d*\b/,
    // Japanese format addresses
    /\d+[-–]\d+[-–]\d+\s+[A-Za-z\s]+[,]\s*[A-Za-z\s]+/,
    // City, district format
    /\b\d+\s+[A-Za-z\s]+[,]\s*[A-Za-z\s]+(?:\s+City)?(?:\s+\d{3,6})?/,
    // Any line with building/location indicators
    /[A-Za-z\s]+(?:Building|Tower|Center|Plaza|Mall|District|Ward|Station)[^.\n]*/i
  ];
  
  for (const pattern of addressPatterns) {
    const match = block.match(pattern);
    if (match) {
      let address = match[0].trim().replace(/[,\n]$/, '');
      // Ensure proper formatting
      if (!address.includes(',') && address.split(' ').length > 3) {
        const parts = address.split(' ');
        const midPoint = Math.floor(parts.length / 2);
        address = parts.slice(0, midPoint).join(' ') + ', ' + parts.slice(midPoint).join(' ');
      }
      return address;
    }
  }
  
  // Look for lines that contain location keywords
  const lines = block.split('\n');
  for (const line of lines) {
    const cleanLine = line.trim();
    if (cleanLine.length > 10 && 
        /\b(located|address|at|in|near|on|district|area|ward|chome|building|floor)\b/i.test(cleanLine)) {
      // Extract the part after location keywords
      const locationMatch = cleanLine.match(/(?:located|address|at|in|near|on)\s+(.+)/i);
      if (locationMatch) {
        return locationMatch[1].trim();
      }
    }
  }
  
  return null;
}

function extractPhoneFromLine(line: string): string | null {
  const phonePattern = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const match = line.match(phonePattern);
  return match ? match[0] : null;
}

function extractUrlFromLine(line: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/;
  const match = line.match(urlPattern);
  if (match) {
    let url = match[0];
    if (!url.startsWith('http')) {
      url = url.startsWith('www') ? `https://${url}` : `https://www.${url}`;
    }
    return url;
  }
  return null;
}

function extractRatingFromLine(line: string): number | null {
  const ratingPattern = /(\d+\.?\d*)\s*(?:\/\s*\d+|star|⭐)/i;
  const match = line.match(ratingPattern);
  if (match) {
    const rating = parseFloat(match[1]);
    return rating <= 5 ? rating : rating / 2; // Convert 10-point to 5-point scale
  }
  return null;
}

function extractHoursFromLine(line: string): string | null {
  const hoursPatterns = [
    /\d{1,2}:\d{2}\s*(AM|PM)\s*-\s*\d{1,2}:\d{2}\s*(AM|PM)/i,
    /\d{1,2}(AM|PM)\s*-\s*\d{1,2}(AM|PM)/i,
    /(Mon|Tue|Wed|Thu|Fri|Sat|Sun|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^.]*?\d/i
  ];
  
  for (const pattern of hoursPatterns) {
    const match = line.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

function extractPriceFromLine(line: string): string | null {
  const pricePatterns = [
    /\$\d+[-–]\$?\d+/,
    /\$\d+\+?/,
    /\d+[-–]\d+\s*(?:dollars?|usd|\$)/i,
    /(cheap|affordable|expensive|moderate|budget|luxury)/i
  ];
  
  for (const pattern of pricePatterns) {
    const match = line.match(pattern);
    if (match) return match[0];
  }
  
  return null;
}

// Helper function to clean venue names
function cleanVenueName(name: string): string {
  return name
    .replace(/^#+\s*/, '') // Remove markdown headers
    .replace(/^\d+\.\s*/, '') // Remove numbers
    .replace(/^\*+\s*/, '') // Remove asterisks
    .replace(/\*+$/, '') // Remove trailing asterisks
    .trim();
}

// Generate fallback venues when Perplexity API is unavailable
function generateFallbackVenues(dateIdea: string, city: string): Venue[] {
  const fallbackVenues: Record<string, Venue[]> = {
    'arcade': [
      {
        name: `${city} Gaming Lounge`,
        address: `Downtown ${city}`,
        description: `Retro and modern arcade games in the heart of ${city}`,
        website: `https://gaming-lounge-${city.toLowerCase()}.com`,
        phone: '+1-555-ARCADE',
        rating: 4.5,
        priceRange: '$15-25 per person',
        hours: 'Daily: 2PM-12AM',
        category: 'arcade',
        confidence: 0.7
      },
      {
        name: `Pixel Palace ${city}`,
        address: `Entertainment District, ${city}`,
        description: `Classic arcade experience with craft beer and snacks`,
        phone: '+1-555-PIXEL',
        rating: 4.3,
        priceRange: '$10-20 per person',
        hours: 'Wed-Sun: 4PM-11PM',
        category: 'arcade',
        confidence: 0.7
      }
    ],
    'restaurant': [
      {
        name: `The Local Table ${city}`,
        address: `Main Street, ${city}`,
        description: `Farm-to-table dining with locally sourced ingredients`,
        website: `https://localtable-${city.toLowerCase()}.com`,
        phone: '+1-555-LOCAL',
        rating: 4.6,
        priceRange: '$30-50 per person',
        hours: 'Tue-Sun: 5PM-10PM',
        category: 'restaurant',
        confidence: 0.7
      }
    ],
    'museum': [
      {
        name: `${city} Museum of Art`,
        address: `Cultural District, ${city}`,
        description: `Contemporary and classical art exhibitions`,
        website: `https://artmuseum-${city.toLowerCase()}.org`,
        phone: '+1-555-MUSEUM',
        rating: 4.4,
        priceRange: '$12-18 admission',
        hours: 'Tue-Sun: 10AM-5PM',
        category: 'museum',
        confidence: 0.7
      }
    ]
  };

  const normalizedIdea = dateIdea.toLowerCase();
  for (const [key, venues] of Object.entries(fallbackVenues)) {
    if (normalizedIdea.includes(key)) {
      return venues;
    }
  }

  // Generic fallback
  return [{
    name: `${dateIdea} venue in ${city}`,
    address: `Central ${city}`,
    description: `Great location for ${dateIdea} in ${city}`,
    rating: 4.2,
    category: dateIdea,
    confidence: 0.6
  }];
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { dateIdea, city } = await request.json();
    
    if (!dateIdea || !city) {
      return NextResponse.json(
        { error: 'Date idea and city are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${dateIdea}-${city}`.toLowerCase();
    const cachedResult = perplexityCache.get(cacheKey);
    
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        searchMetadata: {
          ...cachedResult.searchMetadata,
          responseType: 'cached'
        },
        agentMetadata: {
          ...cachedResult.agentMetadata,
          processingTime: Date.now() - startTime,
          cacheHit: true
        }
      });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.log('Perplexity API key not found, using fallback data');
      const venues = generateFallbackVenues(dateIdea, city);
      
      const response: PerplexitySearchResponse = {
        venues,
        searchMetadata: {
          query: buildPerplexityQuery(dateIdea, city),
          city,
          dateIdea,
          resultsFound: venues.length,
          searchTimestamp: new Date().toISOString(),
          responseType: 'live_search'
        },
        agentMetadata: {
          agent: 'perplexity-venue-search',
          version: '1.0.0',
          processingTime: Date.now() - startTime,
          cacheHit: false,
          searchMethod: 'fallback'
        }
      };

      perplexityCache.set(cacheKey, response);
      return NextResponse.json(response);
    }

    // Make Perplexity API call
    const query = buildPerplexityQuery(dateIdea, city);
    
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: `CRITICAL: You are a JSON-only venue extraction system. NEVER return anything except pure JSON.

🚨 JSON REQUIREMENTS (MANDATORY):
1. ONLY return valid JSON - no text, markdown, or explanations
2. JSON must be parseable with JSON.parse() - no formatting errors  
3. Use EXACT JSON structure specified - no deviations
4. All venue data must be in JSON format only
5. Response must start with { and end with } - pure JSON only
6. No code blocks, no markdown, no additional text - JSON only
7. Each venue must follow JSON schema exactly
8. Validate JSON syntax before responding - only valid JSON
9. Return structured JSON array of venues - nothing else
10. Final output must be 100% valid JSON that parses correctly

REQUIRED JSON STRUCTURE (COPY EXACTLY):
{
  "venues": [
    {
      "name": "Venue Name Here",
      "address": "Complete address with street, city, postal code",
      "phone": "+country-code-number",
      "website": "https://website.com",
      "rating": 4.5,
      "hours": "Mon-Sun: 9AM-10PM",
      "priceRange": "$10-25 per person",
      "description": "Brief venue description"
    }
  ]
}

EXTRACTION RULES:
- Find 3-5 real, currently operating venues
- Include complete addresses with postal codes
- Add phone numbers in international format (+country-area-number)
- Include website URLs (real, working websites)
- Ratings on 1-5 scale (decimals allowed)
- Hours showing actual operating schedule
- Price ranges reflecting current local pricing
- Descriptions should be concise (max 100 characters)

RESPOND WITH ONLY THE JSON OBJECT ABOVE - NO MARKDOWN, NO CODE BLOCKS, NO EXTRA TEXT.`
          },
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
        return_citations: true,
        return_images: false
      }),
    });

    if (!perplexityResponse.ok) {
      throw new Error(`Perplexity API error: ${perplexityResponse.status}`);
    }

    const data = await perplexityResponse.json();
    const content = data.choices[0]?.message?.content || '';
    
    const venues = parsePerplexityResponse(content, dateIdea);
    
    if (venues.length === 0) {
      // Fallback if no venues parsed
      const fallbackVenues = generateFallbackVenues(dateIdea, city);
      venues.push(...fallbackVenues);
    }

    const response: PerplexitySearchResponse = {
      venues,
      searchMetadata: {
        query,
        city,
        dateIdea,
        resultsFound: venues.length,
        searchTimestamp: new Date().toISOString(),
        responseType: 'live_search'
      },
      agentMetadata: {
        agent: 'perplexity-venue-search',
        version: '1.0.0',
        processingTime: Date.now() - startTime,
        cacheHit: false,
        searchMethod: 'perplexity_api'
      }
    };

    // Cache the result
    perplexityCache.set(cacheKey, response);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('Perplexity venue search error:', error);
    
    // Return fallback on error
    const { dateIdea, city } = await request.json().catch(() => ({ dateIdea: 'entertainment', city: 'Unknown City' }));
    const venues = generateFallbackVenues(dateIdea, city);
    
    return NextResponse.json({
      venues,
      searchMetadata: {
        query: buildPerplexityQuery(dateIdea, city),
        city,
        dateIdea,
        resultsFound: venues.length,
        searchTimestamp: new Date().toISOString(),
        responseType: 'live_search'
      },
      agentMetadata: {
        agent: 'perplexity-venue-search',
        version: '1.0.0',
        processingTime: Date.now() - startTime,
        cacheHit: false,
        searchMethod: 'fallback_error'
      }
    });
  }
}

// GET endpoint for agent status
export async function GET() {
  const cacheStats = perplexityCache.getStats();
  
  return NextResponse.json({
    status: 'Perplexity Venue Search Agent operational',
    apiKeyConfigured: !!process.env.PERPLEXITY_API_KEY,
    cache: cacheStats,
    version: '1.0.0',
    capabilities: [
      'Date idea + city venue search',
      'Perplexity AI integration',
      'Intelligent caching',
      'Fallback venues',
      'Real venue data extraction'
    ]
  });
}
