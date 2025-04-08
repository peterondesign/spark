import { useState, useEffect, useCallback } from 'react';
import { getImageUrl } from '../utils/imageService';

// Define the expected response type
type ImageResponse = string | {
  url: string;
  attribution: {
    name: string;
    username: string;
    portfolioUrl: string | null;
    profileUrl: string;
  };
};

// Client-side cache to prevent multiple fetches within the same session
const clientSideCache: Record<string, {
  data: ImageResponse;
  timestamp: number;
}> = {};

// Cache expiry time (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000; 

export function useImageFetch(query: string, width?: number, height?: number) {
  const [imageData, setImageData] = useState({
    url: '/placeholder.svg',
    attribution: null as {
      name: string;
      username: string;
      portfolioUrl: string | null;
      profileUrl: string;
    } | null,
    isLoading: true,
    error: null as string | null
  });

  // Create cache key from the query and dimensions
  const cacheKey = `${query}-${width || 400}x${height || 300}`;

  // Function to check browser storage for cached image
  const checkBrowserCache = useCallback(() => {
    try {
      // First check session storage (per visit)
      const sessionData = sessionStorage.getItem(`img_${cacheKey}`);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
          return parsed;
        }
      }

      // Then check local storage (persists across visits)
      const localData = localStorage.getItem(`img_${cacheKey}`);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Date.now() - parsed.timestamp < CACHE_EXPIRY * 24) { // 24 hours for local storage
          // Refresh in session storage
          sessionStorage.setItem(`img_${cacheKey}`, JSON.stringify({
            ...parsed,
            timestamp: Date.now()
          }));
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error checking browser cache:', error);
    }
    return null;
  }, [cacheKey]);

  // Save image data to browser cache
  const saveToBrowserCache = useCallback((data: any) => {
    try {
      const cacheData = {
        ...data,
        timestamp: Date.now()
      };
      
      // Save to both session and local storage
      sessionStorage.setItem(`img_${cacheKey}`, JSON.stringify(cacheData));
      localStorage.setItem(`img_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to browser cache:', error);
    }
  }, [cacheKey]);

  useEffect(() => {
    let isMounted = true;

    async function fetchImage() {
      try {
        // First check in-memory cache
        if (clientSideCache[cacheKey] && 
            Date.now() - clientSideCache[cacheKey].timestamp < CACHE_EXPIRY) {
          const cachedData = clientSideCache[cacheKey].data;
          if (isMounted) {
            setImageData({
              url: typeof cachedData === 'string' ? cachedData : cachedData.url,
              attribution: typeof cachedData === 'string' ? null : cachedData.attribution,
              isLoading: false,
              error: null
            });
          }
          return;
        }

        // Then check browser storage
        const browserCached = checkBrowserCache();
        if (browserCached) {
          if (isMounted) {
            setImageData({
              url: browserCached.url,
              attribution: browserCached.attribution || null,
              isLoading: false,
              error: null
            });
          }
          
          // Also update the memory cache
          clientSideCache[cacheKey] = {
            data: browserCached,
            timestamp: Date.now()
          };
          
          return;
        }

        // If nothing in cache, fetch from API
        const result = await getImageUrl(undefined, query, width, height);
        
        const data = typeof result === 'string' 
          ? result 
          : {
              url: result,
              attribution: {
                name: '',
                username: '',
                portfolioUrl: null,
                profileUrl: ''
              }
            };
            
        // Update in-memory cache
        clientSideCache[cacheKey] = {
          data,
          timestamp: Date.now()
        };
        
        // Save to browser storage
        saveToBrowserCache(data);
        
        if (isMounted) {
          setImageData({
            url: typeof data === 'string' ? data : data.url,
            attribution: typeof data === 'string' ? null : data.attribution,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setImageData(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load image'
          }));
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [cacheKey, query, width, height, checkBrowserCache, saveToBrowserCache]);

  return imageData;
}
