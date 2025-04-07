import { NextResponse } from 'next/server';

// Pexels API configuration
const PEXELS_API_URL = "https://api.pexels.com/v1";
const PEXELS_API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const MAX_REQUESTS_PER_WINDOW = 100; // Conservative limit
const MIN_REQUEST_INTERVAL = 100; // ms between requests

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

async function processQueue() {
  if (isProcessing || requestQueue.length === 0) return;
  
  isProcessing = true;
  
  while (requestQueue.length > 0) {
    if (Date.now() - windowStart > RATE_LIMIT_WINDOW * 1000) {
      requestCount = 0;
      windowStart = Date.now();
    }

    if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
      const resetTime = new Date(windowStart + RATE_LIMIT_WINDOW * 1000);
      await new Promise(resolve => setTimeout(resolve, resetTime.getTime() - Date.now()));
      continue;
    }

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
      'Access-Control-Expose-Headers': 'X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset'
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const perPage = searchParams.get('per_page') || '1';
  const size = searchParams.get('size') || 'medium';
  
  // Check if this is a rate limit info request
  if (searchParams.get('info') === 'ratelimit') {
    return NextResponse.json({
      limit: rateLimitInfo.limit,
      remaining: rateLimitInfo.remaining,
      reset: Math.floor(rateLimitInfo.reset / 1000),
      lastUpdated: rateLimitInfo.lastUpdated
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

  const requestPromise = () => new Promise<NextResponse>(async (resolve) => {
    try {
      const pexelsUrl = `${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&size=${size}`;
      
      const response = await fetch(pexelsUrl, {
        headers: {
          'Authorization': PEXELS_API_KEY,
          'User-Agent': 'Date Ideas Site/1.0',
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
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
        
        resolve(NextResponse.json(data, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
            'X-Ratelimit-Limit': rateLimitInfo.limit.toString(),
            'X-Ratelimit-Remaining': rateLimitInfo.remaining.toString(),
            'X-Ratelimit-Reset': Math.floor(rateLimitInfo.reset / 1000).toString(),
            'Access-Control-Expose-Headers': 'X-Ratelimit-Limit, X-Ratelimit-Remaining, X-Ratelimit-Reset'
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