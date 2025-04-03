import { NextResponse } from 'next/server';

// Maximum number of retries when a proxy fails
const MAX_RETRIES = 2;

// List of alternative proxy services to try if the primary one fails
const PROXY_SERVICES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
  (url: string) => `https://proxy.cors.sh/${url}`
];

// Common user agents to rotate through to avoid detection
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
];

// Get a random user agent
function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  console.log(`[PROXY] Fetching URL: ${url}`);

  // Try direct fetch first (with appropriate headers)
  try {
    const directResponse = await fetchWithRetries(url);
    
    if (directResponse.ok) {
      console.log(`[PROXY] Direct fetch successful for: ${url}`);
      const data = await directResponse.text();
      return new NextResponse(data, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  } catch (error) {
    console.log(`[PROXY] Direct fetch failed for: ${url}, error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // If direct fetch failed, try with proxy services
  for (let i = 0; i < PROXY_SERVICES.length; i++) {
    const proxyUrl = PROXY_SERVICES[i](url);
    
    try {
      console.log(`[PROXY] Trying proxy ${i + 1}: ${proxyUrl}`);
      const response = await fetchWithRetries(proxyUrl);
      
      if (response.ok) {
        console.log(`[PROXY] Proxy ${i + 1} successful for: ${url}`);
        const data = await response.text();
        return new NextResponse(data, {
          headers: {
            'Content-Type': 'text/html',
            'Access-Control-Allow-Origin': '*'
          }
        });
      } else {
        console.log(`[PROXY] Proxy ${i + 1} failed with status: ${response.status} for: ${url}`);
      }
    } catch (error) {
      console.error(`[PROXY] Error with proxy ${i + 1}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // All proxies failed
  return NextResponse.json({ 
    error: 'Failed to fetch through all available proxies',
    details: `Could not fetch ${url} through any available proxy`
  }, { status: 500 });
}

// Helper function to fetch with retries and rotated user agents
async function fetchWithRetries(url: string): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const userAgent = getRandomUserAgent();
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        },
        redirect: 'follow',
        cache: 'no-store'
      });

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.log(`[PROXY] Attempt ${attempt + 1}/${MAX_RETRIES + 1} failed: ${lastError.message}`);
      
      // Wait before retry (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after multiple attempts');
}