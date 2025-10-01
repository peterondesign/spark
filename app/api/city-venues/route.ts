import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(req: NextRequest) {
  let body: any = {};
  
  try {
    body = await req.json();
    console.log('Received request body:', body);
    
    const { city, activity, max_results = 8, language = 'en' } = body;

    console.log('Parsed parameters:', { city, activity, max_results, language });

    if (!city || !activity) {
      console.log('Missing required parameters:', { city: !!city, activity: !!activity });
      return NextResponse.json(
        { error: 'City and activity are required', received: { city, activity } },
        { status: 400 }
      );
    }

    if (!PERPLEXITY_API_KEY) {
      console.log('Missing Perplexity API key');
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      );
    }

    const enhancedPrompt = `You are a JSON component. Return only valid JSON that matches the schema below. Search for high quality places in ${city} for ${activity}. Prioritize official websites and reputable sources. Include working https links, precise street addresses, and clear titles. Verify that each place is currently operating. Remove duplicates. Sort by overall relevance to the activity and visitor value. Use ${language} for text fields. Limit results to ${max_results}.

Return JSON with this structure:
{
  "query": "Plain description of the search performed",
  "city": "${city}",
  "activity": "${activity}",
  "results_count": 0,
  "generated_at": "${new Date().toISOString()}",
  "currency": "EUR",
  "results": [
    {
      "title": "Official venue or tour name",
      "description": "1 to 2 sentence summary focused on why it fits the activity",
      "address": {
        "street": "Street address",
        "neighborhood": "Area name",
        "city": "${city}",
        "postal_code": "Postal code",
        "country": "Portugal"
      },
      "coordinates": {
        "lat": 0.0,
        "lon": 0.0
      },
      "phone": "+351 phone number",
      "website_url": "https://example.com",
      "booking_url": "https://example.com",
      "opening_hours": [
        {"day": "Mon", "open": "10:00", "close": "18:00"}
      ],
      "best_for": ["audience tags"],
      "estimated_price_range": "€€",
      "duration_suggestion_minutes": 120,
      "accessibility_notes": "Access information",
      "tags": ["category", "tags"],
      "source_url": "https://verification-source.com",
      "last_verified": "${new Date().toISOString().split('T')[0]}"
    }
  ]
}

IMPORTANT: Return ONLY the JSON object, no additional text or markdown formatting.`;

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that returns only valid JSON responses for venue searches. Always return properly formatted JSON with no additional text.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.1,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        search_recency_filter: "month",
        top_k: 0,
        stream: false,
        presence_penalty: 0,
        frequency_penalty: 1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from Perplexity API' },
        { status: 500 }
      );
    }

    let content = data.choices[0].message.content;
    
    // Clean up the response to ensure it's valid JSON
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Validate that we have the expected structure
      if (!parsedContent.results || !Array.isArray(parsedContent.results)) {
        throw new Error('Invalid JSON structure: missing results array');
      }
      
      // Update results_count to match actual results
      parsedContent.results_count = parsedContent.results.length;
      
      return NextResponse.json(parsedContent);
    } catch (parseError) {
      console.error('Failed to parse Perplexity JSON response:', parseError);
      console.error('Raw content:', content);
      
      // Return a fallback response
      return NextResponse.json({
        query: `${activity} places in ${city}`,
        city,
        activity,
        results_count: 0,
        generated_at: new Date().toISOString(),
        currency: "EUR",
        results: [],
        error: 'Failed to parse venue data'
      });
    }

  } catch (error: any) {
    console.error('Error in city-venues API:', error);
    
    // Return a fallback response instead of just an error
    return NextResponse.json({
      query: `${body?.activity || 'activity'} places in ${body?.city || 'city'}`,
      city: body?.city || 'Unknown',
      activity: body?.activity || 'Unknown',
      results_count: 0,
      generated_at: new Date().toISOString(),
      currency: "EUR",
      results: [],
      error: 'Failed to fetch venue data',
      fallback: true
    });
  }
}