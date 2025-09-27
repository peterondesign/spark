// Define the CityEvent type
interface CityEvent {
  title: string;
  description: string;
  category: string;
  venue: string;
  location: string;
}

// Helper function to infer category from sentence content
function inferCategory(sentence: string, fallback: string): string {
  const categories = {
    'food': ['restaurant', 'cafe', 'bar', 'market', 'dining'],
    'arts': ['museum', 'gallery', 'theater', 'theatre', 'exhibition', 'show'],
    'entertainment': ['club', 'concert', 'festival', 'tour'],
    'education': ['workshop', 'class', 'experience'],
    'outdoor': ['park', 'garden', 'beach']
  };
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => sentence.includes(keyword))) {
      return category;
    }
  }
  
  return fallback || 'general';
}

// Strategy 8: Aggressive text reconstruction for venues
function aggressiveTextReconstruction(content: string, city: string): CityEvent[] {
  try {
    // Look for any venue/event mentions and build events from them
    const venueKeywords = [
      'museum', 'gallery', 'theater', 'theatre', 'club', 'bar', 'restaurant',
      'cafe', 'market', 'festival', 'concert', 'show', 'exhibition', 'tour',
      'workshop', 'class', 'experience', 'venue', 'center', 'hall', 'park'
    ];
    
    const events: CityEvent[] = [];
    const sentences = content.toLowerCase().split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (events.length >= 8) break;
      
      const hasVenueKeyword = venueKeywords.some(keyword => sentence.includes(keyword));
      if (!hasVenueKeyword) continue;
      
      // Extract potential venue names (capitalized words)
      const originalSentence = content.split(/[.!?]+/).find((s: string) => 
        s.toLowerCase().trim() === sentence.trim()
      ) || sentence;
      
      const venueMatches = originalSentence.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g);
      if (venueMatches && venueMatches.length > 0) {
        const venueName = venueMatches[0];
        
        const event = {
          title: venueName,
          description: `Visit ${venueName} in ${city}`,
          category: inferCategory(sentence, ''),
          venue: venueName,
          location: city
        };
        
        events.push(event);
      }
    }
    
    if (events.length > 0) {
      console.log(`✅ Strategy 8 success - Reconstructed ${events.length} venues from text`);
      return events;
    }
    
    return [];
  } catch (error) {
    console.log('❌ Strategy 8 failed - Text reconstruction');
    return [];
  }
}

// Next.js API route handler
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    
    if (!city) {
      return Response.json({ error: 'City parameter is required' }, { status: 400 });
    }

    // For now, return empty array until full implementation
    const events: CityEvent[] = [];
    
    return Response.json({ events, city });
  } catch (error) {
    console.error('Error in perplexity-city-events API:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
