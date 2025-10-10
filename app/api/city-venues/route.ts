import { NextRequest, NextResponse } from 'next/server';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export async function POST(req: NextRequest) {
  let body: any = {};
  
  try {
    body = await req.json();
    console.log('Received request body:', body);
    
    const { city, activity, max_results = 8, language = 'en', offset = 0 } = body;

    console.log('Parsed parameters:', { city, activity, max_results, language, offset });

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

    const enhancedPrompt = `Find exactly ${max_results} ${offset > 0 ? 'additional ' : ''}real ${activity} venues in ${city}, Portugal${offset > 0 ? `, excluding any you might have mentioned before. Focus on ${offset === 1 ? 'secondary' : offset === 2 ? 'alternative' : 'hidden gem'} venues` : ''}. Research actual businesses with real addresses, websites, and details. Return ONLY a valid JSON object with this exact structure - no additional text or explanations:

{"results":[{"title":"Real venue name","description":"Detailed description of the venue","address":{"street":"Actual street address","city":"${city}","postal_code":"Real postal code","country":"Portugal"},"website_url":"Real website URL (if available)","estimated_price_range":"€ to €€€","duration_suggestion_minutes":90,"source_url":"Source URL where you found this information"}]}

Important: Research real venues that actually exist. Include accurate addresses, descriptions, and websites when available.${offset > 0 ? ' Find different venues than what might have been mentioned in previous requests.' : ''}`;

    console.log('Enhanced prompt:', enhancedPrompt);

    console.log('Making Perplexity API request...');
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
            content: 'You are a local venue search assistant. Provide real, accurate venue information for the requested city. Always return valid JSON only, no additional text.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        max_tokens: 600,
        temperature: 0.2,
        top_p: 0.9,
        return_images: false,
        return_related_questions: false,
        stream: false
      }),
    });

    console.log('Perplexity API response status:', response.status);
    console.log('Perplexity API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return NextResponse.json(
        { error: `Perplexity API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Full Perplexity API response:', JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Perplexity response structure:', data);
      return NextResponse.json(
        { error: 'Invalid response from Perplexity API' },
        { status: 500 }
      );
    }

    let content = data.choices[0].message.content;
    console.log('Raw Perplexity content:', content);
    
    // Step 1: Remove markdown code blocks
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Step 2: Try to extract JSON from the response if it's embedded in text
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }
    
    // Step 3: Clean up control characters but preserve valid JSON structure
    content = content
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\n+/g, ' ') // Replace multiple newlines with single space
      .replace(/\r+/g, '') // Remove carriage returns
      .replace(/\t+/g, ' ') // Replace tabs with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    console.log('Cleaned content:', content);
    
    try {
      const parsedContent = JSON.parse(content);
      
      // Normalize the response structure for simplified API responses
      let normalizedResponse;
      if (parsedContent.results && Array.isArray(parsedContent.results)) {
        normalizedResponse = {
          query: `${activity} in ${city}`,
          city,
          activity,
          results_count: parsedContent.results.length,
          generated_at: new Date().toISOString(),
          currency: "EUR",
          results: parsedContent.results.map((venue: any) => ({
            title: venue.title || 'Unknown Venue',
            description: venue.description || `Great place for ${activity}`,
            address: {
              street: venue.address?.street || 'Address not available',
              city: venue.address?.city || city,
              postal_code: venue.address?.postal_code || '',
              country: venue.address?.country || 'Portugal'
            },
            website_url: venue.website_url || '',
            estimated_price_range: venue.estimated_price_range || '€€',
            duration_suggestion_minutes: venue.duration_suggestion_minutes || 120,
            source_url: venue.source_url || venue.website_url || ''
          }))
        };
      } else {
        throw new Error('Invalid JSON structure: missing results array');
      }
      
      const response = NextResponse.json(normalizedResponse);
      response.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=86400');
      
      return response;
    } catch (parseError) {
      console.error('Failed to parse Perplexity JSON response:', parseError);
      console.error('Raw content that failed to parse:', content);
      
      // Try alternative parsing strategies
      try {
        // Strategy 1: Try to fix common JSON issues
        let fixedContent = content
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":') // Quote unquoted keys
          .replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2'); // Quote unquoted string values
        
        console.log('Attempting to parse fixed content:', fixedContent);
        const parsedFixed = JSON.parse(fixedContent);
        
        if (parsedFixed.results && Array.isArray(parsedFixed.results)) {
          const normalizedResponse = {
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: parsedFixed.results.length,
            generated_at: new Date().toISOString(),
            currency: "EUR",
            results: parsedFixed.results.map((venue: any) => ({
              title: venue.title || 'Unknown Venue',
              description: venue.description || `Great place for ${activity}`,
              address: {
                street: venue.address?.street || 'Address not available',
                city: venue.address?.city || city,
                postal_code: venue.address?.postal_code || '',
                country: venue.address?.country || 'Portugal'
              },
              website_url: venue.website_url || '',
              estimated_price_range: venue.estimated_price_range || '€€',
              duration_suggestion_minutes: venue.duration_suggestion_minutes || 120,
              source_url: venue.source_url || venue.website_url || ''
            }))
          };
          
          console.log('Successfully parsed with fixed content');
          return NextResponse.json(normalizedResponse);
        }
      } catch (fixError) {
        console.error('Fixed parsing also failed:', fixError);
      }
      
      // Strategy 2: Extract individual venue data using regex
      try {
        const venues = [];
        const titleMatches = content.match(/"title":\s*"([^"]+)"/g) || [];
        const descMatches = content.match(/"description":\s*"([^"]+)"/g) || [];
        const streetMatches = content.match(/"street":\s*"([^"]+)"/g) || [];
        const websiteMatches = content.match(/"website_url":\s*"([^"]+)"/g) || [];
        
        const maxVenues = Math.min(max_results, titleMatches.length);
        
        for (let i = 0; i < maxVenues; i++) {
          const title = titleMatches[i]?.match(/"title":\s*"([^"]+)"/)?.[1] || `${activity} Venue ${i + 1}`;
          const description = descMatches[i]?.match(/"description":\s*"([^"]+)"/)?.[1] || `Great place for ${activity}`;
          const street = streetMatches[i]?.match(/"street":\s*"([^"]+)"/)?.[1] || `${activity} Street ${i + 1}`;
          const website = websiteMatches[i]?.match(/"website_url":\s*"([^"]+)"/)?.[1] || '';
          
          venues.push({
            title,
            description,
            address: {
              street,
              city,
              postal_code: '1000-000',
              country: 'Portugal'
            },
            website_url: website,
            estimated_price_range: '€€',
            duration_suggestion_minutes: 120,
            source_url: website
          });
        }
        
        if (venues.length > 0) {
          console.log('Successfully extracted venues using regex');
          return NextResponse.json({
            query: `${activity} in ${city}`,
            city,
            activity,
            results_count: venues.length,
            generated_at: new Date().toISOString(),
            currency: "EUR",
            results: venues,
            parsing_method: 'regex_extraction'
          });
        }
      } catch (regexError) {
        console.error('Regex extraction failed:', regexError);
      }
      
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
    
    // If it's a timeout, provide fallback venues
    if (error?.message === 'API timeout') {
      const fallbackVenues = generateFallbackVenues(body?.city || 'Unknown', body?.activity || 'activity', body?.max_results || 6);
      return NextResponse.json({
        query: `${body?.activity || 'activity'} places in ${body?.city || 'Unknown'}`,
        city: body?.city || 'Unknown',
        activity: body?.activity || 'Unknown',
        results_count: fallbackVenues.length,
        generated_at: new Date().toISOString(),
        currency: "EUR",
        results: fallbackVenues,
        fallback: true,
        error: 'Using fallback data due to API timeout'
      });
    }
    
    // Return a basic fallback response for other errors
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

// Generate fallback venues when API fails
function generateFallbackVenues(city: string, activity: string, count: number) {
  const venues = [];
  for (let i = 1; i <= count; i++) {
    venues.push({
      title: `${activity} Spot ${i}`,
      description: `Great place for ${activity.toLowerCase()} in ${city}`,
      address: {
        street: `${activity} Street ${i}`,
        city: city,
        postal_code: '1000-000',
        country: 'Portugal'
      },
      website_url: `https://www.google.com/search?q=${encodeURIComponent(`${activity} ${city}`)}?utm_source=dateideas.cc&utm_medium=referral&utm_campaign=venue_discovery`,
      estimated_price_range: '€€',
      duration_suggestion_minutes: 120,
      source_url: ''
    });
  }
  return venues;
}