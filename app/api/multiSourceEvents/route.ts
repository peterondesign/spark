import { fetchMultiSourceExperiences } from '@/services/multi_scraper';
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const category = searchParams.get('category');
    const source = searchParams.get('source');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;

    console.log(`[API:multiSourceEvents] Received request:`, { city, category, source, limit });
    
    if (!city || !category) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters: city and category" },
        { status: 400 }
      );
    }

    // Fetch experiences based on the provided parameters
    const experiences = await fetchMultiSourceExperiences({
      city,
      category,
      limit: source ? Math.min(limit, 20) : limit // Limit to 20 if fetching from a specific source
    });

    console.log(`[API:multiSourceEvents] Fetched ${experiences.length} experiences`);
    
    // If a specific source was requested, filter the results
    const filteredExperiences = source
      ? experiences.filter(exp => exp.source.toLowerCase() === source.toLowerCase())
      : experiences;
    
    console.log(`[API:multiSourceEvents] Returning ${filteredExperiences.length} filtered experiences for source: ${source || 'all'}`);
    
    return NextResponse.json({
      success: true,
      experiences: filteredExperiences,
    });
  } catch (error) {
    console.error('[API:multiSourceEvents] Error:', error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch experiences", error: (error as Error).message },
      { status: 500 }
    );
  }
}