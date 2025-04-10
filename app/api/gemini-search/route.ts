import { NextResponse } from 'next/server';
import { getActivitySuggestions } from '@/utils/crawler';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query } = body;
    
    if (!query) {
      return NextResponse.json({ 
        results: [],
        message: 'Query parameter is required' 
      }, { status: 400 });
    }
    
    // For now, reuse the activity suggestions function
    const activities = await getActivitySuggestions(query);
    
    return NextResponse.json({ 
      results: activities,
      success: true
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search results' }, 
      { status: 500 }
    );
  }
}
