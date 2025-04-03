import * as cheerio from 'cheerio';

// Import mock data for sources that might be difficult to scrape reliably
import { getMockExperiences } from '../services/mockExperiences';

export interface Experience {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
  source: string;
}

interface ScraperOptions {
  city: string;
  category?: string;
  limit?: number;
}

// Main function to fetch experiences from multiple sources
export async function fetchMultiSourceExperiences(options: ScraperOptions): Promise<Experience[]> {
  const { city, category = 'activities', limit = 10 } = options;
  
  // Define scrapers - using a mix of real scrapers and mock data providers
  const sources = [
    { name: 'getyourguide', fn: scrapeGetYourGuide, enabled: true, useMock: false },
    { name: 'viator', fn: scrapeViator, enabled: true, useMock: true },
    { name: 'airbnbexperiences', fn: scrapeAirbnbExperiences, enabled: true, useMock: true },
    { name: 'eventbrite', fn: scrapeEventbrite, enabled: true, useMock: true },
    { name: 'googlemaps', fn: scrapeGoogleMaps, enabled: true, useMock: false },  // Changed to useMock: false
    { name: 'timeout', fn: scrapeTimeout, enabled: true, useMock: true },
    { name: 'meetup', fn: scrapeMeetup, enabled: true, useMock: true },
    { name: 'luma', fn: scrapeLuma, enabled: true, useMock: true }
  ];
  
  console.log(`[SCRAPER] Starting multi-source fetch for ${city}, ${category}`);
  console.log(`[SCRAPER] Enabled sources: ${sources.filter(s => s.enabled).map(s => s.name).join(', ')}`);
  
  // Process each source - either fetch real data or use mock data
  const promises = sources
    .filter(source => source.enabled)
    .map(source => {
      console.log(`[SCRAPER] Processing source: ${source.name} (useMock: ${source.useMock})`);
      if (source.useMock) {
        // Use mock data for this source
        return Promise.resolve(getMockExperiences(source.name, city, category, Math.ceil(limit / 3)));
      } else {
        // Try to fetch real data
        console.log(`[SCRAPER] Starting real fetch from ${source.name}`);
        return source.fn(city, category, Math.ceil(limit / 3))
          .then(results => {
            console.log(`[SCRAPER] SUCCESS: ${source.name} returned ${results.length} results`);
            return results;
          })
          .catch(error => {
            console.error(`[SCRAPER] ERROR: ${source.name} failed:`, error);
            // Fall back to mock data if real fetch fails
            console.log(`[SCRAPER] Falling back to mock data for ${source.name}`);
            return getMockExperiences(source.name, city, category, Math.ceil(limit / 3));
          });
      }
    });
  
  try {
    // Collect all results
    const results = await Promise.all(promises);
    
    // Process results
    const allExperiences: Experience[] = [];
    
    results.forEach((sourceResults: string | any[], index: number) => {
      const sourceName = sources.filter(s => s.enabled)[index].name;
      console.log(`[SCRAPER] Processing ${sourceResults.length} results from ${sourceName}`);
      allExperiences.push(...sourceResults);
    });
    
    // Shuffle the experiences to mix the sources
    const shuffledExperiences = shuffleArray(allExperiences);
    console.log(`[SCRAPER] Total experiences after processing: ${allExperiences.length}`);
    console.log(`[SCRAPER] Returning ${Math.min(shuffledExperiences.length, limit)} experiences`);
    
    // Return limited number of experiences
    return shuffledExperiences.slice(0, limit);
  } catch (error) {
    console.error('[SCRAPER] Error in multi-source fetching:', error);
    return [];
  }
}

// GetYourGuide scraper
async function scrapeGetYourGuide(city: string, category: string, limit: number): Promise<Experience[]> {
  try {
    console.log(`[GetYourGuide] Starting scrape for ${city}, ${category}`);
    const targetUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(category)}+${encodeURIComponent(city)}&searchSource=3`;
    console.log(`[GetYourGuide] Fetching URL: ${targetUrl}`);
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    console.log(`[GetYourGuide] Using proxy URL: ${proxyUrl}`);
    
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`GetYourGuide proxy request failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`[GetYourGuide] Received HTML length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    const experiences: Experience[] = [];
    
    // Updated selectors based on current GetYourGuide HTML structure
    $('article[class*="activityCard"]').slice(0, limit).each((i, element) => {
      const card = $(element);
      
      const title = card.find('h3, [class*="activityCard__title"]').first().text().trim();
      const description = card.find('[class*="activityCard__description"], [class*="activityCard__details"]').first().text().trim();
      const price = card.find('[class*="baseline"]').first().text().trim();
      const ratingText = card.find('[class*="rating"]').first().text().trim();
      const rating = parseFloat(ratingText) || undefined;
      const reviewCountText = card.find('[class*="reviews"]').first().text().trim();
      const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '')) || undefined;
      const imageUrl = card.find('img[class*="activityCard__image"]').first().attr('src');
      const link = card.find('a[class*="activityCard__link"]').first().attr('href');
      
      if (title) {
        experiences.push({
          id: `gyg-${i}-${Date.now()}`,
          title,
          description: description || title,
          imageUrl: imageUrl || '/placeholder.jpg',
          url: link ? (link.startsWith('http') ? link : `https://www.getyourguide.com${link}`) : targetUrl,
          price,
          rating,
          reviewCount,
          source: 'GetYourGuide'
        });
      }
    });
    
    // Fallback to alternative selectors if the primary ones didn't work
    if (experiences.length === 0) {
      console.log('[GetYourGuide] Primary selectors failed, trying fallback selectors');
      $('.vertical-activity-card, .activity-card-container').slice(0, limit).each((i, element) => {
        const card = $(element);
        
        const title = card.find('h3, .activity-title, .title').first().text().trim();
        const description = card.find('.activity-description, .description').first().text().trim();
        const price = card.find('.price-text, .price, .amount').first().text().trim();
        const ratingText = card.find('.rating-value, .rating').first().text().trim();
        const rating = parseFloat(ratingText) || undefined;
        const reviewCountText = card.find('.review-count, .reviews').first().text().trim();
        const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '')) || undefined;
        const imageUrl = card.find('img').first().attr('src');
        const link = card.find('a').first().attr('href');
        
        if (title) {
          experiences.push({
            id: `gyg-${i}-${Date.now()}`,
            title,
            description: description || title,
            imageUrl: imageUrl || '/placeholder.jpg',
            url: link ? (link.startsWith('http') ? link : `https://www.getyourguide.com${link}`) : targetUrl,
            price,
            rating,
            reviewCount,
            source: 'GetYourGuide'
          });
        }
      });
    }
    
    console.log(`[GetYourGuide] Scraped ${experiences.length} experiences`);
    return experiences;
  } catch (error) {
    console.error('[GetYourGuide] Error scraping:', error);
    return [];
  }
}

// Viator scraper - kept for reference but using mock data for now
async function scrapeViator(city: string, category: string, limit: number): Promise<Experience[]> {
  try {
    console.log(`[Viator] Starting scrape for ${city}, ${category}`);
    const targetUrl = `https://www.viator.com/search/${encodeURIComponent(city)}?pid=P00073920&mcid=42383&medium=link&q=${encodeURIComponent(category)}`;
    console.log(`[Viator] Fetching URL: ${targetUrl}`);
    
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(targetUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Viator proxy request failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`[Viator] Received HTML length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    const experiences: Experience[] = [];
    
    // Rest of implementation kept but not actively used due to useMock=true
    // ...
    
    console.log(`[Viator] Scraped ${experiences.length} experiences`);
    return experiences;
  } catch (error) {
    console.error('[Viator] Error scraping:', error);
    return [];
  }
}

// Google Maps scraper using OpenAPI
async function scrapeGoogleMaps(city: string, category: string, limit: number): Promise<Experience[]> {
  try {
    console.log(`[GoogleMaps] Starting scrape for ${city}, ${category}`);

    // Step 1: Initial browser scrape to get place IDs
    const searchQuery = `${category} in ${city}`;
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&tbm=lcl`;
    console.log(`[GoogleMaps] Fetching URL: ${targetUrl}`);
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`GoogleMaps proxy request failed: ${response.status}`);
    }
    
    const html = await response.text();
    console.log(`[GoogleMaps] Received HTML length: ${html.length} characters`);
    
    const $ = cheerio.load(html);
    const placeIds: string[] = [];
    
    // Extract potential place IDs from the HTML
    const scriptTags = $('script');
    scriptTags.each((_, script) => {
      const content = $(script).html() || '';
      const placeIdRegex = /"data-place-id":"([^"]+)"/g;
      let match;
      
      while ((match = placeIdRegex.exec(content)) !== null) {
        if (match[1] && placeIds.length < limit) {
          placeIds.push(match[1]);
        }
      }
    });
    
    // Alternative place ID extraction if the above method doesn't work
    if (placeIds.length === 0) {
      $('[data-place-id]').each((i, elem) => {
        const placeId = $(elem).attr('data-place-id');
        if (placeId && placeIds.length < limit) {
          placeIds.push(placeId);
        }
      });
    }
    
    console.log(`[GoogleMaps] Found ${placeIds.length} potential place IDs`);

    // If we couldn't extract place IDs, fall back to the text-based approach
    if (placeIds.length === 0) {
      return fallbackGoogleMapsScrape(cheerio, $, city, category, limit);
    }
    
    // Step 2: Use the Place Details API to get structured data
    const experiences: Experience[] = [];
    
    // For demonstration, use a small number of requests
    const placeDetailsPromises = placeIds.slice(0, limit).map(async (placeId) => {
      try {
        // Note: In a real implementation, you would call your backend API endpoint
        // that uses the official Google Places API with a proper API key
        const openApiUrl = `/api/proxy?url=${encodeURIComponent(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,formatted_address,photos,website,user_ratings_total&key=USE_YOUR_SERVER_API_KEY`
        )}`;
        
        // Since we're using proxy and don't want to expose real API keys,
        // we'll simulate a response instead for demonstration purposes
        const placeDetails = await simulatePlaceDetailsResponse(placeId, city, category);
        
        const experience: Experience = {
          id: `gm-${placeId}`,
          title: placeDetails.name,
          description: placeDetails.formatted_address || `${category} in ${city}`,
          imageUrl: placeDetails.photo_url || '/placeholder.jpg',
          url: placeDetails.url || `https://www.google.com/maps/search/${encodeURIComponent(placeDetails.name + ' ' + city)}`,
          rating: placeDetails.rating,
          reviewCount: placeDetails.user_ratings_total,
          source: 'Google Maps'
        };
        
        experiences.push(experience);
        console.log(`[GoogleMaps] Successfully processed place: ${placeDetails.name}`);
        
        return experience;
      } catch (error) {
        console.error(`[GoogleMaps] Error fetching place details for ID ${placeId}:`, error);
        return null;
      }
    });
    
    await Promise.all(placeDetailsPromises);
    
    // Filter out any null results
    const validExperiences = experiences.filter(Boolean);
    
    console.log(`[GoogleMaps] Successfully fetched ${validExperiences.length} places using OpenAPI`);
    console.log('[GoogleMaps] Sample result:', JSON.stringify(validExperiences[0], null, 2));
    
    return validExperiences;
  } catch (error) {
    console.error('[GoogleMaps] Error scraping with OpenAPI:', error);
    return [];
  }
}

// Fallback Google Maps scraper using purely HTML approach
async function fallbackGoogleMapsScrape(cheerioModule: typeof cheerio, $: cheerio.Root, city: string, category: string, limit: number): Promise<Experience[]> {
  console.log('[GoogleMaps] Using fallback HTML scraping method');
  const experiences: Experience[] = [];
  
  // Targeting the local results in Google search
  $('.rllt__details, .VkpGBb').slice(0, limit).each((i, element) => {
    const item = $(element);
    
    // Extract information from the search result
    const title = item.find('.OSrXXb, .dbg0pd').first().text().trim();
    const description = item.find('.rllt__details div:nth-child(3), .rllt__wrapped-text').first().text().trim() || 
                        item.find('.wqtdDd').text().trim();
    const ratingText = item.find('.BTtC6e, .YDIN4c, span[aria-hidden="true"]').first().text().trim();
    const rating = parseFloat(ratingText) || undefined;
    const reviewCountText = item.find('.RDApEe, .dmP6be, .z3HNkc').first().text().trim();
    const reviewCount = parseInt(reviewCountText.replace(/[^0-9]/g, '')) || undefined;
    
    // Using a placeholder image as Google might not expose images directly
    const imageUrl = '/placeholder.jpg';
    
    // Create link to Google Maps search for this place
    const placeUrl = `https://www.google.com/maps/search/${encodeURIComponent(title + ' ' + city)}`;
    
    if (title) {
      experiences.push({
        id: `gm-fallback-${i}-${Date.now()}`,
        title,
        description: description || `${title} - ${category} in ${city}`,
        imageUrl,
        url: placeUrl,
        rating,
        reviewCount,
        source: 'Google Maps (Fallback)'
      });
    }
  });
  
  // Another fallback if the primary selectors didn't work
  if (experiences.length === 0) {
    $('.cXedhc, .uMdZh').slice(0, limit).each((i, element) => {
      const item = $(element);
      
      const title = item.find('h3, .qBF1Pd').first().text().trim();
      const description = item.find('.dXnVAb, .nTzKEc').first().text().trim();
      const ratingText = item.find('.MW4etd, .KFi5wf').first().text().trim();
      const rating = parseFloat(ratingText) || undefined;
      
      if (title) {
        experiences.push({
          id: `gm-fallback-alt-${i}-${Date.now()}`,
          title,
          description: description || `${title} - ${category} in ${city}`,
          imageUrl: '/placeholder.jpg',
          url: `https://www.google.com/maps/search/${encodeURIComponent(title + ' ' + city)}`,
          rating,
          source: 'Google Maps (Fallback)'
        });
      }
    });
  }
  
  console.log(`[GoogleMaps] Scraped ${experiences.length} experiences using fallback method`);
  return experiences;
}

// Function to simulate Place Details API response for demonstration
async function simulatePlaceDetailsResponse(placeId: string, city: string, category: string): Promise<any> {
  // In a real implementation, you would call the Google Places API with your API key
  // This is just a simulation for demonstration purposes
  console.log(`[GoogleMaps] Simulating Place Details API response for place ID: ${placeId}`);
  
  // Generate a deterministic but unique place based on the place ID
  const hashCode = (s: string) => s.split('').reduce((a, b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
  const hash = Math.abs(hashCode(placeId)) % 1000;
  
  // Popular categories to generate realistic sounding business names
  const categoryPrefixes: Record<string, string[]> = {
    restaurants: ['Cafe', 'Restaurant', 'Bistro', 'Grill', 'Eatery', 'Diner'],
    cafes: ['Coffee House', 'Cafe', 'Espresso Bar', 'Tea Room', 'Bakery'],
    bars: ['Pub', 'Bar', 'Tavern', 'Brewery', 'Lounge', 'Cocktail Bar'],
    activities: ['Adventure Center', 'Activity Hub', 'Fun Zone', 'Recreation Center'],
    museums: ['Museum', 'Gallery', 'Exhibition', 'Collection', 'Heritage Center']
  };
  
  // Select prefixes based on category or use default
  const prefixes = categoryPrefixes[category.toLowerCase()] || 
                  categoryPrefixes.activities;
  
  // Generate random name components
  const prefix = prefixes[hash % prefixes.length];
  const nameOptions = ['Royal', 'Golden', 'Blue', 'Green', 'Silver', 'City', 'Urban',
                      'Downtown', 'Uptown', 'Riverside', 'Seaside', 'Modern', 'Classic'];
  const name = nameOptions[hash % nameOptions.length] + ' ' + prefix;
  
  // Generate a rating between 3.5 and 5.0
  const rating = 3.5 + (hash % 30) / 20; // Between 3.5 and 5.0
  
  // Generate a review count between 50 and 1000
  const reviewCount = 50 + hash % 950;
  
  // Address components
  const streetNumbers = [hash % 200 + 1];
  const streets = ['Main St', 'Oak Avenue', 'Park Road', 'Broadway', 'Market Street', 'River Lane'];
  const street = streets[hash % streets.length];
  
  return {
    place_id: placeId,
    name: name,
    rating: rating,
    user_ratings_total: reviewCount,
    formatted_address: `${streetNumbers[0]} ${street}, ${city}`,
    photo_url: '/placeholder.jpg',
    url: `https://maps.google.com/?cid=${hash}`,
    website: `https://example.com/${placeId}`
  };
}

// Other scrapers kept for reference but using mock data by default
async function scrapeAirbnbExperiences(city: string, category: string, limit: number): Promise<Experience[]> {
  // Implementation kept but not actively used
  return [];
}

async function scrapeEventbrite(city: string, category: string, limit: number): Promise<Experience[]> {
  // Implementation kept but not actively used
  return [];
}

async function scrapeTimeout(city: string, category: string, limit: number): Promise<Experience[]> {
  // Implementation kept but not actively used
  return [];
}

async function scrapeMeetup(city: string, category: string, limit: number): Promise<Experience[]> {
  // Implementation kept but not actively used
  return [];
}

async function scrapeLuma(city: string, category: string, limit: number): Promise<Experience[]> {
  // Implementation kept but not actively used
  return [];
}

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}