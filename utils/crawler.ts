// Ethical web crawler that respects robots.txt and rate limits

import axios from 'axios';
import { JSDOM } from 'jsdom';
import { parse as parseUrl } from 'url';

// Types
export interface CrawlerOptions {
  maxRequests: number;
  headless: boolean;
  debug: string | boolean;
  customHandlers?: {
    parseActivityData?: boolean;
  };
}

export interface CrawlResult {
  title: string;
  url: string;
  price: string;
  rating: string;
  reviewCount: number;
  duration: string;
  image: string;
  description?: string;
}

// Configure axios with proper headers to mimic a browser
const axiosInstance = axios.create({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; DateIdeasCrawler/1.0; +https://dateideas.xyz/crawler)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://dateideas.xyz/',
  },
  timeout: 10000,
});

// Function to check robots.txt before crawling
async function canCrawl(url: string): Promise<boolean> {
  try {
    const parsedUrl = parseUrl(url);
    const robotsUrl = `${parsedUrl.protocol}//${parsedUrl.host}/robots.txt`;
    
    const response = await axiosInstance.get(robotsUrl);
    const robotsTxt = response.data;
    
    // Very basic robots.txt parsing - would need a proper library for production
    if (robotsTxt.includes('User-agent: *') && 
        robotsTxt.includes('Disallow: /')) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.warn('Error checking robots.txt, proceeding with caution', error);
    return true; // Assume we can crawl if robots.txt is not available
  }
}

// Function to extract data from an HTML page
function extractDataFromHtml(html: string, url: string): Partial<CrawlResult> {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  // This is a simplified example - would need more robust selectors for production
  const title = document.querySelector('h1')?.textContent || '';
  const priceElement = document.querySelector('[data-test="activity-card-price"]');
  const price = priceElement ? priceElement.textContent || '' : '';
  
  const ratingElement = document.querySelector('[data-test="rating-score"]');
  const rating = ratingElement ? ratingElement.textContent || '' : '';
  
  const reviewCountElement = document.querySelector('[data-test="rating-count"]');
  let reviewCount = 0;
  if (reviewCountElement) {
    const match = reviewCountElement.textContent?.match(/\d+/);
    if (match) {
      reviewCount = parseInt(match[0], 10);
    }
  }
  
  const durationElement = document.querySelector('[data-test="activity-duration"]');
  const duration = durationElement ? durationElement.textContent || '' : '';
  
  const imageElement = document.querySelector('img.activity-card-image');
  const image = imageElement ? imageElement.getAttribute('src') || '' : '';
  
  const descriptionElement = document.querySelector('[data-test="activity-description"]');
  const description = descriptionElement ? descriptionElement.textContent || '' : '';
  
  return {
    title,
    url,
    price,
    rating,
    reviewCount,
    duration,
    image,
    description,
  };
}

// Add delay to respect rate limits
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main crawler function
 */
export async function runCrawler(urls: string[], options: CrawlerOptions): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  const processedUrls = new Set<string>();
  let requestCount = 0;
  
  console.log(`Starting ethical crawler for URLs: ${urls.join(', ')}`);
  console.log(`Options: ${JSON.stringify(options)}`);
  
  // Add random delay between requests (1-3 seconds)
  const getRandomDelay = () => Math.floor(Math.random() * 2000) + 1000;
  
  // Process each URL
  for (const url of urls) {
    if (requestCount >= options.maxRequests) {
      console.log(`Reached max requests limit (${options.maxRequests})`);
      break;
    }
    
    if (processedUrls.has(url)) {
      continue;
    }
    
    // Check robots.txt
    if (!await canCrawl(url)) {
      console.log(`Robots.txt disallows crawling ${url}, skipping`);
      continue;
    }
    
    try {
      console.log(`Crawling ${url}`);
      
      // Add delay before request
      await delay(getRandomDelay());
      
      const response = await axiosInstance.get(url);
      requestCount++;
      processedUrls.add(url);
      
      if (response.status === 200) {
        const data = extractDataFromHtml(response.data, url);
        
        if (data.title) {
          results.push(data as CrawlResult);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    }
  }
  
  console.log(`Crawler completed. Found ${results.length} results.`);
  return results;
}

/**
 * Function to get activities based on a search query
 */
export async function getActivitiesBySearch(query: string, location?: string): Promise<CrawlResult[]> {
  // Format search parameters
  const searchQuery = encodeURIComponent(query);
  const locationParam = location ? encodeURIComponent(location) : '';
  
  // Create search URL - this would need to be updated based on the target site structure
  const searchUrl = `https://www.example.com/search?q=${searchQuery}${locationParam ? `&location=${locationParam}` : ''}`;
  
  // For demonstration, return some mocked results
  // In production, you would crawl the actual search results page
  return [
    {
      title: `${query} Experience`,
      url: `https://www.example.com/activity-1`,
      price: '$49.99',
      rating: '4.8',
      reviewCount: 256,
      duration: '3 hours',
      image: 'https://via.placeholder.com/400x300?text=Activity+1',
      description: `Discover amazing ${query} in ${location || 'popular destinations'}.`
    },
    {
      title: `${location || 'Local'} Adventure`,
      url: `https://www.example.com/activity-2`,
      price: '$59.99',
      rating: '4.7',
      reviewCount: 189,
      duration: '4 hours',
      image: 'https://via.placeholder.com/400x300?text=Activity+2',
      description: 'Explore the hidden gems with our professional guides.'
    },
    {
      title: 'Cultural Tour',
      url: `https://www.example.com/activity-3`,
      price: '$39.99',
      rating: '4.9',
      reviewCount: 312,
      duration: '2 hours',
      image: 'https://via.placeholder.com/400x300?text=Activity+3',
      description: 'Immerse yourself in local culture and traditions.'
    }
  ];
}

// Cache for search results to minimize crawling
const searchCache = new Map<string, { timestamp: number, results: CrawlResult[] }>();

/**
 * Function to get activity suggestions with caching
 */
export async function getActivitySuggestions(query: string, location?: string): Promise<CrawlResult[]> {
  const cacheKey = `${query}:${location || ''}`;
  const cachedResult = searchCache.get(cacheKey);
  
  // Use cache if available and less than 1 hour old
  if (cachedResult && (Date.now() - cachedResult.timestamp < 3600000)) {
    return cachedResult.results;
  }
  
  // Get new results
  const results = await getActivitiesBySearch(query, location);
  
  // Update cache
  searchCache.set(cacheKey, {
    timestamp: Date.now(),
    results
  });
  
  return results;
}
