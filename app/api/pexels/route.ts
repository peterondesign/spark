import { NextResponse } from 'next/server';

// Pexels API configuration
const PEXELS_API_URL = "https://api.pexels.com/v1";
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Rate limiting configuration - more conservative values
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_REQUESTS_PER_WINDOW = 80; // More conservative limit (reduced from 100)
const MIN_REQUEST_INTERVAL = 200; // Increased from 100ms to 200ms between requests

// Cache configuration
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 500; // Maximum number of items to keep in cache

// In-memory cache
interface CacheItem {
  data: any;
  timestamp: number;
}

interface Cache {
  [key: string]: CacheItem;
}

const responseCache: Cache = {};

// Rate limit tracking
let rateLimitInfo = {
  limit: 20000, // Default Pexels limit
  remaining: 20000,
  reset: Date.now() + (RATE_LIMIT_WINDOW * 1000),
  lastUpdated: Date.now()
};

// In-memory request tracking
let requestCount = 0;
let windowStart = Date.now();
let lastRequestTime = Date.now();
let requestQueue: Array<() => Promise<void>> = [];
let isProcessing = false;

// Cache management functions
function getCacheKey(query: string, perPage: string, size: string): string {
  return `pexels_${query}_${perPage}_${size}`;
}

function getFromCache(key: string): any | null {
  const cacheItem = responseCache[key];
  
  if (!cacheItem) {
    return null;
  }
  
  if (Date.now() - cacheItem.timestamp > CACHE_TTL) {
    delete responseCache[key];
    return null;
  }
  
  return cacheItem.data;
}

function saveToCache(key: string, data: any): void {
  // If cache is at max size, remove oldest item
  const cacheSize = Object.keys(responseCache).length;
  if (cacheSize >= MAX_CACHE_SIZE) {
    const oldestKey = Object.keys(responseCache).reduce((oldest, key) => {
      return responseCache[key].timestamp < responseCache[oldest].timestamp ? key : oldest;
    }, Object.keys(responseCache)[0]);
    
    delete responseCache[oldestKey];
  }
  
  responseCache[key] = {
    data,
    timestamp: Date.now()
  };
}

function cleanupCache(): void {
  const now = Date.now();
  Object.keys(responseCache).forEach(key => {
    if (now - responseCache[key].timestamp > CACHE_TTL) {
      delete responseCache[key];
    }
  });
}

// Run cache cleanup every hour
setInterval(cleanupCache, 60 * 60 * 1000);

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    // Check if we need to reset the rate limit window
    if (Date.now() - windowStart > RATE_LIMIT_WINDOW * 1000) {
      requestCount = 0;
      windowStart = Date.now();
    }
    
    // Check if we're over the request limit
    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      const resetTime = new Date(windowStart + RATE_LIMIT_WINDOW * 1000);
      console.log(`Rate limit reached, waiting until ${resetTime.toISOString()}`);
      await new Promise(resolve => setTimeout(resolve, resetTime.getTime() - Date.now()));
      continue;
    }
    
    // Ensure minimum time between requests
    const timeSinceLastRequest = Date.now() - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
    }
    
    const request = requestQueue.shift();
    if (request) {
      try {
        lastRequestTime = Date.now();
        await request();
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }
  }
  
  isProcessing = false;
}

// Add endpoint to check rate limit info
export async function HEAD() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'X-Ratelimit-Limit': rateLimitInfo.limit.toString(),
      'X-Ratelimit-Remaining': rateLimitInfo.remaining.toString(),
      'X-Ratelimit-Reset': Math.floor(rateLimitInfo.reset / 1000).toString(),
      'X-Cache-Items': Object.keys(responseCache).length.toString(),
      'Access-Control-Expose-Headers': 'X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset, X-Cache-Items'
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const perPage = searchParams.get('per_page') || '1';
  const size = searchParams.get('size') || 'medium';
  const bypassCache = searchParams.get('bypass_cache') === 'true';
  
  // Check if this is a rate limit info request
  if (searchParams.get('info') === 'ratelimit') {
    return NextResponse.json({
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      reset: Math.floor(rateLimitInfo.reset / 1000),
      lastUpdated: rateLimitInfo.lastUpdated,
      cacheStats: {
        size: Object.keys(responseCache).length,
        maxSize: MAX_CACHE_SIZE
      }
    });
  }
  
  if (!query) {
    return NextResponse.json({ 
      error: 'Missing required parameter: query'
    }, { status: 400 });
  }
  
  if (!PEXELS_API_KEY) {
    console.error('Missing Pexels API key in environment variables');
    return NextResponse.json({ 
      error: 'Server configuration error',
      details: 'API key not configured'
    }, { status: 500 });
  }

  // Check cache first (unless bypass is requested)
  const cacheKey = getCacheKey(query, perPage, size);
  const cachedData = !bypassCache ? getFromCache(cacheKey) : null;
  
  if (cachedData) {
    console.log(`Cache hit for query "${query}"`);
    return NextResponse.json(cachedData, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
        'X-Cache': 'HIT',
        'X-Ratelimit-Limit': rateLimitInfo.limit.toString(),
        'X-Ratelimit-Remaining': rateLimitInfo.remaining.toString(),
        'X-Ratelimit-Reset': Math.floor(rateLimitInfo.reset / 1000).toString(),
        'Access-Control-Expose-Headers': 'X-Cache, X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset'
      }
    });
  }
  
  const requestPromise = () => new Promise<NextResponse>(async (resolve) => {
    try {
      const pexelsUrl = `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&size=${size}`;
      
      console.log(`Cache miss for query "${query}", fetching from Pexels API`);
      const response = await fetch(pexelsUrl, {
        headers: {
          'Authorization': PEXELS_API_KEY,
          'User-Agent': 'Date Ideas Site/1.0',
          'Content-Type': 'application/json'
        },
        next: { revalidate: 86400 } // Use Next.js built-in cache for 24 hours
      });
      
      // Update rate limit info from headers
      const limit = response.headers.get('X-Ratelimit-Limit');
      const remaining = response.headers.get('X-Ratelimit-Remaining');
      const reset = response.headers.get('X-Ratelimit-Reset');
      
      if (limit && remaining && reset) {
        rateLimitInfo = {
          limit: parseInt(limit),
          remaining: parseInt(remaining),
          reset: parseInt(reset) * 1000, // Convert to milliseconds
          lastUpdated: Date.now()
        };
      }
      
      if (response.ok) {
        const data = await response.json();
        requestCount++;
        
        // Save successful response to cache
        saveToCache(cacheKey, data);
        
        resolve(NextResponse.json(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
            'X-Cache': 'MISS',
            'X-Ratelimit-Limit': rateLimitInfo.limit.toString(),
            'X-Ratelimit-Remaining': rateLimitInfo.remaining.toString(),
            'X-Ratelimit-Reset': Math.floor(rateLimitInfo.reset / 1000).toString(),
            'Access-Control-Expose-Headers': 'X-Cache, X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset'
          }
        }));
      } else if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after') || '60';
        
        resolve(NextResponse.json({
          error: 'Rate limit exceeded by Pexels API',
          details: 'Too many requests to the Pexels API',
          rateLimit: {
            ...rateLimitInfo,
            retryAfter: parseInt(retryAfter)
          }
        }, {
          status: 429,
          headers: {
            'Retry-After': retryAfter,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
          }
        }));
      } else {
        const errorText = await response.text();
        resolve(NextResponse.json({
          error: 'Pexels API error',
          status: response.status,
          details: errorText,
          rateLimit: rateLimitInfo
        }, {
          status: response.status,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-store'
          }
        }));
      }
    } catch (error) {
      resolve(NextResponse.json({
        error: 'Failed to fetch from Pexels API',
        details: error instanceof Error ? error.message : 'Unknown error',
        rateLimit: rateLimitInfo
      }, {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store'
        }
      }));
    }
  });
  
  requestQueue.push(() => requestPromise().then());
  
  if (!isProcessing) {
    processQueue();
  }
  
  return requestPromise();
}