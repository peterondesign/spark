import { ActivitySuggestion } from '@/utils/crawler';

/**
 * Fetches activity suggestions based on a date idea and location
 * @param dateIdeaTitle The title of the date idea
 * @param category The category of the date idea
 * @param location Optional location to search in
 * @returns Promise with activity suggestions
 */
export async function fetchActivitySuggestions(
  dateIdeaTitle: string,
  category: string,
  location?: string
): Promise<ActivitySuggestion[]> {
  try {
    const query = `${dateIdeaTitle}, ${category}`.trim();
    
    const response = await fetch('/api/gemini-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        query,
        location 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch activity suggestions');
    }
    
    const data = await response.json();
    
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching activity suggestions:', error);
    throw error;
  }
}

/**
 * Fetches GetYourGuide activities by city and date idea
 * @param city The city to search in
 * @param dateIdeaTitle The title of the date idea
 * @returns Promise with GetYourGuide activities
 */
export async function fetchGetYourGuideActivities(
  city: string,
  dateIdeaTitle: string
): Promise<ActivitySuggestion[]> {
  try {
    // Format city for URL (lowercase, replace spaces with hyphens)
    const formattedCity = city.toLowerCase().replace(/\s+/g, '-');
    
    const response = await fetch('/api/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.getyourguide.com/${formattedCity}/s?q=${encodeURIComponent(dateIdeaTitle)}`,
        maxRequests: 5,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to start crawler');
    }
    
    // For now, return some sample data while the crawler runs
    // In a real implementation, you would poll for results
    return [
      {
        title: `${dateIdeaTitle} in ${city}`,
        duration: '3 hours',
        rating: '4.8',
        price: '$49.99',
        badges: ['Bestseller'],
      },
      {
        title: `${city} Experience`,
        duration: '4 hours',
        rating: '4.7',
        price: '$59.99',
      }
    ];
  } catch (error) {
    console.error('Error fetching GetYourGuide activities:', error);
    throw error;
  }
}
