import { NextRequest } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, activity, max_results = 6 } = body;

    if (!city || !activity) {
      return new Response('City and activity are required', { status: 400 });
    }

    // Create a readable stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send instant initial data
        const instantData = {
          type: 'instant',
          data: {
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: 3,
            results: [
              {
                title: `Popular ${activity} Spot`,
                description: `Great ${activity.toLowerCase()} venue in ${city}`,
                address: { street: `${city} Main Street`, city, country: 'Portugal' },
                website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} ${city}`)}`,
                estimated_price_range: '€€',
                instant: true
              },
              {
                title: `${city} ${activity} Center`,
                description: `Popular destination for ${activity.toLowerCase()}`,
                address: { street: `${city} Central Avenue`, city, country: 'Portugal' },
                website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} center ${city}`)}`,
                estimated_price_range: '€€',
                instant: true
              },
              {
                title: `Premium ${activity} Venue`,
                description: `High-quality ${activity.toLowerCase()} experience`,
                address: { street: `${city} Premium District`, city, country: 'Portugal' },
                website_url: `https://www.google.com/search?q=${encodeURIComponent(`premium ${activity} ${city}`)}`,
                estimated_price_range: '€€€',
                instant: true
              }
            ]
          }
        };

        controller.enqueue(encoder.encode(`data: ${JSON.stringify(instantData)}\n\n`));

        // Fetch real data in background
        if (PERPLEXITY_API_KEY) {
          try {
            const response = await fetch(PERPLEXITY_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'sonar',
                messages: [{
                  role: 'user',
                  content: `${max_results} ${activity} venues in ${city}. JSON: {"results":[{"title":"Name","address":{"street":"St","city":"${city}"},"website_url":"URL"}]}`
                }],
                max_tokens: 200,
                temperature: 0.1,
                stream: false
              }),
            });

            if (response.ok) {
              const data = await response.json();
              const content = data.choices?.[0]?.message?.content;
              
              if (content) {
                const realData = {
                  type: 'real',
                  data: {
                    query: `${activity} in ${city}`,
                    city,
                    activity,
                    raw_content: content,
                    instant: false
                  }
                };
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(realData)}\n\n`));
              }
            }
          } catch (error) {
            console.error('Real data fetch failed:', error);
          }
        }

        // Close the stream
        controller.enqueue(encoder.encode('data: {"type":"complete"}\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Streaming API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}