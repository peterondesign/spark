import { NextRequest, NextResponse } from 'next/server';
// Assuming imageService is accessible from here, adjust path if needed
import { getImageUrl, getPlaceholderImage } from '@/app/utils/imageService'; 

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
        model: 'sonar-pro', 
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
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
        console.error("Perplexity response missing content:", data);
        return NextResponse.json({ error: 'Perplexity returned empty content' }, { status: 500 });
    }

    // --- JSON Parsing Logic ---
    let parsedResponse: PerplexityResponse | null = null;
    try {
        // Attempt 1: Parse the content directly as JSON
        parsedResponse = JSON.parse(rawContent);
        if (!parsedResponse || !Array.isArray(parsedResponse.events)) {
            console.warn("Parsed JSON, but invalid structure (Attempt 1):");
            parsedResponse = null; // Reset if structure is wrong
        }
    } catch (parseError) {
        console.warn("Failed direct JSON parse (Attempt 1):", parseError);
        // Attempt 2: Try to extract JSON from potential markdown code blocks
        const jsonMatchMarkdown = rawContent.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatchMarkdown && jsonMatchMarkdown[1]) {
            try {
                parsedResponse = JSON.parse(jsonMatchMarkdown[1]);
                 if (!parsedResponse || !Array.isArray(parsedResponse.events)) {
                    console.warn("Parsed JSON from markdown, but invalid structure (Attempt 2):");
                    parsedResponse = null; // Reset if structure is wrong
                }
            } catch (fallbackParseError) {
                 console.warn("Failed to parse fallback JSON from markdown (Attempt 2):", fallbackParseError);
            }
        }

        // Attempt 3: Try to extract JSON object embedded in text if previous attempts failed
        if (!parsedResponse) {
            const jsonMatchEmbedded = rawContent.match(/{\s*"events"\s*:\s*\[[\s\S]*?\]\s*}/);
            if (jsonMatchEmbedded && jsonMatchEmbedded[0]) {
                try {
                    parsedResponse = JSON.parse(jsonMatchEmbedded[0]);
                    if (!parsedResponse || !Array.isArray(parsedResponse.events)) {
                        console.warn("Parsed embedded JSON, but invalid structure (Attempt 3):");
                        parsedResponse = null; // Reset if structure is wrong
                    }
                } catch (embeddedParseError) {
                    console.warn("Failed to parse embedded JSON (Attempt 3):", embeddedParseError);
                }
            }
        }
    }

    // Check if we successfully parsed a valid structure
    if (!parsedResponse) {
        console.error("Failed to extract valid JSON response from Perplexity after all attempts.");
        console.error("Raw content received:", rawContent);
        return NextResponse.json({ error: 'Failed to parse valid JSON response from Perplexity', details: rawContent }, { status: 500 });
    }

    // --- Image URL Handling & Affiliate Link Appending ---
    const affiliateParams = "partner_id=5QQHAHP&utm_medium=online_publisher";

    const processedEvents = await Promise.all(
        parsedResponse.events.map(async (event) => {
            let imageUrl = event.image_url;
            let eventUrl = event.event_url;

            // Normalize provided imageUrl: if it's not a valid URL, reset to fallback logic
            if (imageUrl && !/^https?:\/\//.test(imageUrl)) {
                imageUrl = '';
            }

            // Append affiliate parameters to GetYourGuide links
            if (eventUrl && eventUrl.startsWith('https://www.getyourguide.com/')) {
                if (eventUrl.includes('?')) {
                    eventUrl += `&${affiliateParams}`;
                } else {
                    eventUrl += `?${affiliateParams}`;
                }
            }

            // If image_url is missing or empty, try to fetch one
            if (!imageUrl || imageUrl.trim() === "") {
                // First, attempt to scrape the event page for og:image
                try {
                    const pageRes = await fetch(eventUrl);
                    if (pageRes.ok) {
                        const html = await pageRes.text();
                        const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
                        if (ogMatch && ogMatch[1]) {
                            imageUrl = ogMatch[1];
                        }
                    }
                } catch (scrapeError) {
                    console.warn(`Failed to scrape OG image for "${event.title}":`, scrapeError);
                }

                // If still no imageUrl, use Pexels fallback
                if (!imageUrl || imageUrl.trim() === "") {
                    try {
                        const imageQuery = `${event.title} ${city}`;
                        imageUrl = await getImageUrl(imageQuery, event.title, 400, 200);
                    } catch (imageError) {
                        console.warn(`Failed to fetch image for "${event.title}":`, imageError);
                        imageUrl = getPlaceholderImage(400, 200, event.title);
                    }
                }
            } else {
                 // Ensure the provided image_url is treated as the source
                 // No action needed here, just use the provided imageUrl
            }

            // If after attempting fetch, imageUrl is still empty or just a placeholder path was generated by getImageUrl,
            // ensure it's the placeholder path.
            if (!imageUrl || imageUrl.trim() === "" || imageUrl.startsWith('/placeholder.svg')) {
                 imageUrl = getPlaceholderImage(400, 200, event.title); // Ensure placeholder path format
            }

            return { 
                ...event, 
                image_url: imageUrl, // This will be the external URL or the placeholder path
                event_url: eventUrl // Updated URL with affiliate params if applicable
            };
        })
    );

    // Return the processed events array
    return NextResponse.json({ events: processedEvents });

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error in API route' }, { status: 500 });
  }
}
