import { NextRequest, NextResponse } from 'next/server';
// Assuming imageService is accessible from here, adjust path if needed
import { getImageUrl, getPlaceholderImage } from '@/app/utils/imageService'; 

// Cache for scraped OG images to avoid repeated fetches
const ogImageCache = new Map<string, string>();

// In-memory cache for API responses
const responseCache = new Map<string, { data: PerplexityResponse; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Define the expected event structure from Perplexity
interface PerplexityEvent {
  image_url?: string; // Make optional as it might be missing
  title: string;
  description: string;
  event_url: string;
}

// Define the expected overall JSON structure from Perplexity
interface PerplexityResponse {
  events: PerplexityEvent[];
}

export async function POST(req: NextRequest) {
  try {
    const { city, dateIdeaTitle } = await req.json(); // Get dateIdeaTitle as well
    if (!city || !dateIdeaTitle) {
      return NextResponse.json({ error: 'City and dateIdeaTitle are required' }, { status: 400 });
    }

    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Perplexity API key not set' }, { status: 500 });
    }

    // Check cache first
    const cacheKey = `${city}::${dateIdeaTitle}`;
    if (responseCache.has(cacheKey)) {
      const { data, timestamp } = responseCache.get(cacheKey)!;
      if (Date.now() - timestamp < CACHE_TTL) {
        return NextResponse.json(data);
      }
    }

    // Simplified Perplexity prompt requesting JSON
    const prompt = `Find me "${dateIdeaTitle}" events or related activities in ${city} on GetYourGuide, Google Maps, or Luma. Return results as a JSON object containing a single key "events" which is an array of objects. Each object in the array should have the following keys: "image_url" (string, use an empty string "" if no image is found), "title" (string), "description" (string), and "event_url" (string). Output ONLY the JSON object and nothing else.`;

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Request JSON response
      },
      body: JSON.stringify({
        model: 'sonar', 
        messages: [
          { role: 'system', content: 'You are an AI assistant that ONLY outputs valid JSON in the specified format. Respond with only the JSON object and nothing else.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 2000, // Adjust as needed
        temperature: 0.0, // Force deterministic JSON output
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Perplexity API Error:", response.status, errorText);
      return NextResponse.json({ error: `Perplexity API Error: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    // --- Preprocess raw content: remove markdown fences, trim to first JSON object ---
    let sanitized = rawContent.trim();
    // Remove any ```json or ``` fences
    sanitized = sanitized.replace(/```json/g, '').replace(/```/g, '');
    // Extract substring between first '{' and last '}'
    const first = sanitized.indexOf('{');
    const last = sanitized.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      sanitized = sanitized.slice(first, last + 1);
    }

    // --- JSON Parsing Logic (2 attempts) ---
    let parsedResponse: PerplexityResponse | null = null;
    try {
      parsedResponse = JSON.parse(sanitized);
      if (!parsedResponse || !Array.isArray(parsedResponse.events)) {
        parsedResponse = null;
      }
    } catch (e) {
      console.warn('JSON parse failed, invalid structure:', e);
    }
    if (!parsedResponse) {
      console.error('Unable to parse JSON after sanitization. Raw:', rawContent);
      return NextResponse.json({ error: 'Invalid JSON from AI', details: rawContent }, { status: 500 });
    }

    // --- Handle events with parallel image & affiliate logic ---
    const affiliateParams = 'partner_id=5QQHAHP&utm_medium=online_publisher';
    const processedEvents = await Promise.all(
      parsedResponse.events.map(async event => {
        let imageUrl = event.image_url || '';
        let eventUrl = event.event_url;

        // Normalize and append affiliate params
        if (/^https:\/\/www\.getyourguide\.com\//.test(eventUrl)) {
          eventUrl += eventUrl.includes('?') ? `&${affiliateParams}` : `?${affiliateParams}`;
        }
        // Ensure valid URL or reset
        if (!/^https?:\/\//.test(imageUrl)) imageUrl = '';

        // If missing image, scrape or fallback
        if (!imageUrl) {
          // Check cache
          if (ogImageCache.has(event.event_url)) {
            imageUrl = ogImageCache.get(event.event_url)!;
          } else {
            try {
              const html = await (await fetch(eventUrl)).text();
              const m = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
              if (m && m[1]) {
                imageUrl = m[1];
                ogImageCache.set(event.event_url, imageUrl);
              }
            } catch {}
          }
          // Fallback to Pexels or placeholder
          if (!imageUrl) {
            try {
              imageUrl = await getImageUrl(`${event.title} ${city}`, event.title, 400, 200);
            } catch {
              imageUrl = getPlaceholderImage(400, 200, event.title);
            }
          }
        }

        return { ...event, image_url: imageUrl, event_url: eventUrl };
      })
    );

    const filtered = processedEvents.filter(e => e.title && e.description && e.event_url);
    const result = { events: filtered };
    // Store in cache
    responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error in API route' }, { status: 500 });
  }
}
