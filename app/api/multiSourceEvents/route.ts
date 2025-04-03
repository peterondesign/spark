import { NextResponse } from 'next/server';
import { fetchMultiSourceExperiences, Experience } from '../../../services/multi_scraper';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city');
  const category = searchParams.get('category');
  const limit = searchParams.get('limit');

  if (!city) {
    return NextResponse.json({ error: 'City parameter is required' }, { status: 400 });
  }

  console.log(`[DEBUG] Fetching experiences for city: ${city}, category: ${category || 'activities'}`);
  
  try {
    const experiences = await fetchMultiSourceExperiences({
      city,
      category: category || 'activities',
      limit: limit ? parseInt(limit) : 12
    });
    
    console.log(`[DEBUG] Total experiences fetched: ${experiences.length}`);
    
    // Group experiences by source for easier display
    const groupedExperiences = experiences.reduce<Record<string, Experience[]>>((acc, experience) => {
      const source = experience.source;
      if (!acc[source]) {
        acc[source] = [];
      }
      acc[source].push(experience);
      return acc;
    }, {});
    
    // Log sources and counts
    const sources = Object.keys(groupedExperiences);
    console.log(`[DEBUG] Sources with results: ${sources.join(', ')}`);
    
    sources.forEach(source => {
      console.log(`[DEBUG] ${source}: ${groupedExperiences[source].length} results`);
    });
    
    return NextResponse.json({
      events: experiences,
      groupedEvents: groupedExperiences,
      sources: sources,
      debug: {
        sourceCounts: Object.fromEntries(
          sources.map(source => [source, groupedExperiences[source].length])
        )
      }
    });
  } catch (error) {
    console.error('Error fetching multi-source experiences:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch events';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}