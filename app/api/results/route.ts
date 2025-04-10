import { NextResponse } from 'next/server';
import { runCrawler } from '@/utils/crawler';

// Mock results to return when polling
const mockResults = {
  items: [
    {
      title: 'City Tour and Sightseeing',
      url: 'https://www.getyourguide.com/city-tour-1',
      price: '$49.99',
      rating: '4.8',
      reviewCount: 256,
      duration: '3 hours',
      image: 'https://via.placeholder.com/400x300?text=City+Tour',
    },
    {
      title: 'Romantic Sunset Cruise',
      url: 'https://www.getyourguide.com/sunset-cruise',
      price: '$89.99',
      rating: '4.9',
      reviewCount: 189,
      duration: '2.5 hours',
      image: 'https://via.placeholder.com/400x300?text=Sunset+Cruise',
    },
    {
      title: 'Food Tasting Experience',
      url: 'https://www.getyourguide.com/food-tasting',
      price: '$65',
      rating: '4.7',
      reviewCount: 321,
      duration: '3.5 hours',
      image: 'https://via.placeholder.com/400x300?text=Food+Tasting',
    },
    {
      title: 'Historical Walking Tour',
      url: 'https://www.getyourguide.com/walking-tour',
      price: '$29.99',
      rating: '4.6',
      reviewCount: 427,
      duration: '2 hours',
      image: 'https://via.placeholder.com/400x300?text=Walking+Tour',
    }
  ]
};

export async function GET() {
  try {
    // In a real implementation, we would read from a database or file
    // For now, just return the mock data
    return NextResponse.json(mockResults);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error || 'Failed to fetch results' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, location } = body;
    
    // We can customize the results based on the query and location
    const customizedResults = {
      items: mockResults.items.map(item => ({
        ...item,
        title: query ? `${query}: ${item.title}` : item.title,
        location: location || 'Worldwide'
      }))
    };
    
    return NextResponse.json(customizedResults);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: error || 'Failed to fetch results' }, 
      { status: 500 }
    );
  }
}
