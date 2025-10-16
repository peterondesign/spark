import { useState, useEffect } from 'react';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
}

/**
 * ULTRA-SIMPLE image hook - just returns the direct image URLs!
 * No lazy loading, no complex caching, just simple and fast.
 */
export const useLazyImages = (dateIdeas: DateIdea[]) => {
  const [imageMap, setImageMap] = useState<Record<string, string>>({});

  // Simply map the image URLs from the date ideas
  useEffect(() => {
    const newImageMap: Record<string, string> = {};
    
    dateIdeas.forEach(idea => {
      const key = idea.slug || idea.id;
      
      // Use the direct image URL from CSV (which now has Supabase URLs)
      // If no image, use a simple placeholder
      newImageMap[key] = idea.image || '/placeholder.svg?height=300&width=400';
    });
    
    setImageMap(newImageMap);
  }, [dateIdeas]);

  // Return minimal interface - just the image map
  return {
    imageMap,
    isLoading: false, // Always false since we're not doing async loading
    backgroundLoading: false,
    observe: () => {}, // No-op function for compatibility
    loadedCount: dateIdeas.length,
    totalCount: dateIdeas.length,
    loadMoreImages: () => {} // No-op function for compatibility
  };
};