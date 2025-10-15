import { useState, useEffect, useCallback } from 'react';

// Client-side cache for AI-generated images
const aiImageCache: Record<string, {
  url: string;
  timestamp: number;
}> = {};

// Cache expiry time (24 hours for AI images as they're more expensive)
const AI_CACHE_EXPIRY = 24 * 60 * 60 * 1000; 

export function useAIImage(keyword: string, width: number = 400, height: number = 300) {
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.svg');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = `${keyword}-${width}x${height}`;

  const generateImage = useCallback(async () => {
    // Check cache first
    if (aiImageCache[cacheKey] && Date.now() - aiImageCache[cacheKey].timestamp < AI_CACHE_EXPIRY) {
      setImageUrl(aiImageCache[cacheKey].url);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, width, height }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate image: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.imageUrl) {
        // Cache the result
        aiImageCache[cacheKey] = {
          url: data.imageUrl,
          timestamp: Date.now()
        };
        
        setImageUrl(data.imageUrl);
      } else {
        throw new Error('No image URL returned from API');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      console.error('AI Image generation error:', err);
      
      // Fallback to placeholder
      setImageUrl('/placeholder.svg');
    } finally {
      setIsLoading(false);
    }
  }, [keyword, width, height, cacheKey]);

  useEffect(() => {
    if (keyword && keyword.trim()) {
      generateImage();
    }
  }, [generateImage, keyword]);

  return {
    imageUrl,
    isLoading,
    error,
    regenerate: generateImage,
    clearCache: () => {
      delete aiImageCache[cacheKey];
    }
  };
}

export default useAIImage;