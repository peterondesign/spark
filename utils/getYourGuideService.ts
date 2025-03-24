import { RateLimiter } from 'limiter';
import { BrowserContext } from 'playwright';

// IP rate limiter - 100 requests per hour per IP
const ipLimiters: Map<string, RateLimiter> = new Map();
const blockedIPs: Set<string> = new Set();

interface GetYourGuideEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
}

/**
 * Check if the request should be rate limited
 */
export const checkRateLimit = (ip: string): boolean => {
  // If IP is blocked, reject immediately
  if (blockedIPs.has(ip)) {
    return false;
  }
  
  // Create a new limiter if one doesn't exist for this IP
  if (!ipLimiters.has(ip)) {
    // Allow 100 requests per hour
    ipLimiters.set(ip, new RateLimiter({ tokensPerInterval: 100, interval: 'hour' }));
  }
  
  const limiter = ipLimiters.get(ip)!;
  
  // Try to take a token
  const hasToken = limiter.tryRemoveTokens(1);
  
  // If no token available, maybe block the IP if it's abusing the system
  if (!hasToken) {
    // If limiter is empty and they're still trying, block the IP
    if (limiter.getTokensRemaining() === 0) {
      console.warn(`Blocking abusive IP: ${ip}`);
      blockedIPs.add(ip);
    }
    return false;
  }
  
  return true;
};

/**
 * Fetch events from GetYourGuide for a specific city
 */
export const getEventsForCity = async (
  city: string, 
  category: string, 
  context: BrowserContext, 
  apiKey: string
): Promise<GetYourGuideEvent[]> => {
  try {
    // Use OpenAI to generate a more relevant search query
    const enhancedQuery = await enhanceSearchQuery(city, category, apiKey);
    
    // Use a headless browser to fetch GetYourGuide data
    const page = await context.newPage();
    
    // Navigate to GetYourGuide search page
    await page.goto(`https://www.getyourguide.com/${city.toLowerCase()}-l${enhancedQuery}`);
    
    // Wait for results to load
    await page.waitForSelector('.activity-card', { timeout: 10000 });
    
    // Extract event information
    const events = await page.evaluate(() => {
      const eventCards = Array.from(document.querySelectorAll('.activity-card'));
      return eventCards.slice(0, 5).map(card => {
        const titleElement = card.querySelector('.activity-card-title');
        const priceElement = card.querySelector('.activity-card-price');
        const ratingElement = card.querySelector('.activity-card-rating');
        const reviewElement = card.querySelector('.activity-card-reviews-count');
        const imageElement = card.querySelector('img');
        const linkElement = card.querySelector('a');
        
        return {
          id: card.getAttribute('data-activity-id') || '',
          title: titleElement ? titleElement.textContent?.trim() || 'Event' : 'Event',
          price: priceElement ? priceElement.textContent?.trim() : undefined,
          rating: ratingElement ? parseFloat(ratingElement.textContent?.trim() || '0') : undefined,
          reviewCount: reviewElement ? parseInt(reviewElement.textContent?.trim() || '0', 10) : undefined,
          imageUrl: imageElement ? imageElement.getAttribute('src') || '' : '',
          url: linkElement ? `https://www.getyourguide.com${linkElement.getAttribute('href') || ''}` : '',
          description: 'Explore this exciting activity in ' + city
        };
      });
    });
    
    await page.close();
    return events;
    
  } catch (error) {
    console.error('Error fetching GetYourGuide events:', error);
    return [];
  }
};

/**
 * Use OpenAI to enhance the search query for better results
 */
const enhanceSearchQuery = async (city: string, category: string, apiKey: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-instruct',
        prompt: `Transform "${category} activities in ${city}" into a concise GetYourGuide search keyword or phrase (no more than 3-5 words).`,
        max_tokens: 50,
        temperature: 0.3
      })
    });
    
    const data = await response.json();
    const enhancedQuery = data.choices[0].text.trim().toLowerCase();
    return enhancedQuery;
  } catch (error) {
    console.error('Error enhancing search query with OpenAI:', error);
    // Fall back to simple search if OpenAI fails
    return `${city.toLowerCase()}-activities`;
  }
};
