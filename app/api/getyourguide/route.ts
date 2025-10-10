import { NextRequest, NextResponse } from 'next/server';

// GetYourGuide API configuration
const GETYOURGUIDE_API_KEY = process.env.GETYOURGUIDE_API_KEY;
const GETYOURGUIDE_API_URL = 'https://api.getyourguide.com/activities';
const PARTNER_ID = '5QQHAHP';

// Cache for GetYourGuide results
const GETYOURGUIDE_CACHE = new Map<string, any>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// City slug mapping for deep links
const CITY_SLUGS: Record<string, string> = {
  'lisbon': 'lisbon-l126',
  'porto': 'porto-l395',
  'madrid': 'madrid-l86',
  'barcelona': 'barcelona-l45',
  'paris': 'paris-l16',
  'london': 'london-l57',
  'rome': 'rome-l43',
  'amsterdam': 'amsterdam-l16',
  'berlin': 'berlin-l15',
  'vienna': 'vienna-l113'
};

interface GetYourGuideActivity {
  id: string;
  title: string;
  price?: {
    from: number;
    currency: string;
  };
  pictures?: Array<{
    url: string;
    alt?: string;
  }>;
  rating?: {
    average: number;
    count: number;
  };
  categories?: Array<{
    name: string;
  }>;
  duration?: string;
  location?: {
    city: string;
    country: string;
  };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');
    const activity = searchParams.get('activity') || '';
    const limit = parseInt(searchParams.get('limit') || '1'); // Changed default to 1

    if (!city) {
      return NextResponse.json({
        error: 'City parameter is required'
      }, { status: 400 });
    }

    // Check cache first
    const cacheKey = `${city.toLowerCase()}_${activity.toLowerCase()}_${limit}`;
    const cached = GETYOURGUIDE_CACHE.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      const response = NextResponse.json({
        ...cached.data,
        cached: true,
        response_time_ms: Date.now() - startTime
      });
      response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400'); // 15 minutes
      return response;
    }

    // If no API key, return deep link fallback with mock data
    if (!GETYOURGUIDE_API_KEY) {
      const fallbackResults = generateFallbackResults(city, activity, limit);
      
      const fallbackResponse = {
        success: true,
        data: fallbackResults,
        total_count: fallbackResults.length,
        city,
        activity,
        partner_id: PARTNER_ID,
        source: 'getyourguide_deeplink',
        response_time_ms: Date.now() - startTime
      };

      // Cache fallback results
      GETYOURGUIDE_CACHE.set(cacheKey, {
        data: fallbackResponse,
        timestamp: Date.now()
      });

      const response = NextResponse.json(fallbackResponse);
      response.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
      return response;
    }

    // Make actual GetYourGuide API call if key is available
    const searchQuery = activity ? `${activity} ${city}` : city;
    const apiUrl = `${GETYOURGUIDE_API_URL}?q=${encodeURIComponent(searchQuery)}&limit=${limit}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${GETYOURGUIDE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`GetYourGuide API error: ${response.status}`);
    }

    const apiData = await response.json();
    const activities: GetYourGuideActivity[] = apiData.data || [];

    // Format results for consistent API response
    const formattedResults = activities.map((activityItem: GetYourGuideActivity) => ({
      id: activityItem.id,
      title: `${activity} Experience in ${city}`, // Use original activity parameter
      description: `Discover ${activity} experiences in ${city}`,
      image_url: activityItem.pictures?.[0]?.url || generateFallbackImage(city, activityItem.title),
      price: activityItem.price ? {
        amount: activityItem.price.from,
        currency: activityItem.price.currency,
        display: `From ${activityItem.price.currency} ${activityItem.price.from}`
      } : null,
      rating: activityItem.rating ? {
        score: activityItem.rating.average,
        count: activityItem.rating.count,
        display: `${activityItem.rating.average}/5 (${activityItem.rating.count} reviews)`
      } : null,
      duration: activityItem.duration || 'Varies',
      category: activityItem.categories?.[0]?.name || 'Experience',
      booking_url: `https://www.getyourguide.com/activity/${activityItem.id}?partner_id=${PARTNER_ID}`,
      deep_link: `https://www.getyourguide.com/s/?partner_id=${PARTNER_ID}&lc=${getCitySlug(city)}&q=${encodeURIComponent(activityItem.title)}`,
      recommended: true,
      source: 'getyourguide'
    }));

    const successResponse = {
      success: true,
      data: formattedResults,
      total_count: formattedResults.length,
      city,
      activity,
      partner_id: PARTNER_ID,
      source: 'getyourguide_api',
      response_time_ms: Date.now() - startTime
    };

    // Cache the results
    GETYOURGUIDE_CACHE.set(cacheKey, {
      data: successResponse,
      timestamp: Date.now()
    });

    const apiResponse = NextResponse.json(successResponse);
    apiResponse.headers.set('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
    
    return apiResponse;

  } catch (error: any) {
    console.error('GetYourGuide API error:', error);
    
    // Return fallback with deep links on error
    const city = new URL(req.url).searchParams.get('city') || 'lisbon';
    const activity = new URL(req.url).searchParams.get('activity') || '';
    const limit = parseInt(new URL(req.url).searchParams.get('limit') || '6');
    
    const fallbackResults = generateFallbackResults(city, activity, limit);
    
    return NextResponse.json({
      success: false,
      data: fallbackResults,
      total_count: fallbackResults.length,
      city,
      activity,
      partner_id: PARTNER_ID,
      source: 'getyourguide_fallback',
      error: 'Using fallback data',
      response_time_ms: Date.now() - startTime
    });
  }
}

// Generate fallback results with deep links
function generateFallbackResults(city: string, activity: string, limit: number) {
  const citySlug = getCitySlug(city);
  const searchQuery = activity || 'activities';
  
  // Create exactly one result matching the activity
  return [{
    id: `gyg_${city}_${activity.replace(/\s+/g, '_').toLowerCase()}`,
    title: `${activity} Experience in ${city}`,
    description: `Discover the best ${activity.toLowerCase()} experience in ${city}`,
    image_url: generateFallbackImage(city, activity),
    price: {
      amount: Math.floor(Math.random() * 50) + 25,
      currency: 'EUR',
      display: `From EUR ${Math.floor(Math.random() * 50) + 25}`
    },
    rating: {
      score: Number((4.2 + Math.random() * 0.8).toFixed(1)),
      count: Math.floor(Math.random() * 300) + 150,
      display: `${Number((4.2 + Math.random() * 0.8).toFixed(1))}/5 (${Math.floor(Math.random() * 300) + 150} reviews)`
    },
    duration: ['2 hours', '3 hours', '4 hours', 'Half day'][Math.floor(Math.random() * 4)],
    category: 'Experience',
    booking_url: `https://www.getyourguide.com/s/?partner_id=${PARTNER_ID}&lc=${citySlug}&q=${encodeURIComponent(activity)}`,
    deep_link: `https://www.getyourguide.com/s/?partner_id=${PARTNER_ID}&lc=${citySlug}&q=${encodeURIComponent(searchQuery)}`,
    recommended: true,
    source: 'getyourguide'
  }];
}

function getCitySlug(city: string): string {
  const normalizedCity = city.toLowerCase().trim();
  return CITY_SLUGS[normalizedCity] || `${normalizedCity}-l1`;
}

function generateFallbackImage(city: string, activity: string): string {
  // Generate Unsplash URL for fallback images
  const query = encodeURIComponent(`${activity} ${city}`);
  return `https://source.unsplash.com/800x600/?${query}`;
}