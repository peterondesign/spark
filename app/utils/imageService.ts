/**
 * Utility functions for handling images using the Pexels API
 */

const PEXELS_ACCESS_KEY = process.env.NEXT_PUBLIC_PEXELS_ACCESS_KEY || "uCWBRGyGfG2SPRGVszsdP9WFzVNMwVC6co4xLTAaivaRCnleATbRcIEe";
const PEXELS_API_URL = "https://api.pexels.com/v1";

// Type for Pexels image response
type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
};

// Cache to minimize API calls and avoid rate limiting issues
type ImageCache = {
  [key: string]: {
    url: string;
    photographer: string;
    photographerUrl: string;
    timestamp: number;
  };
};

// Simple in-memory cache with 1-hour expiration (server-side)
const imageCache: ImageCache = {};
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Get a placeholder image URL with specified dimensions and text
 * @param width Image width
 * @param height Image height
 * @param text Optional text to display on the placeholder
 * @returns URL string for the placeholder image
 */
export const getPlaceholderImage = (width: number = 400, height: number = 300, text?: string): string => {
  const baseUrl = `/placeholder.svg?height=${height}&width=${width}`;
  return text ? `${baseUrl}&text=${encodeURIComponent(text)}` : baseUrl;
};

/**
 * Check if an image is already cached in the browser storage
 * @param cacheKey The key to check in storage
 * @returns The cached image data or null
 */
const getBrowserCachedImage = (cacheKey: string) => {
  // Only run in browser environment
  if (typeof window === 'undefined') return null;
  
  try {
    // Check sessionStorage first (per visit)
    const sessionCached = sessionStorage.getItem(`img_${cacheKey}`);
    if (sessionCached) {
      const parsedData = JSON.parse(sessionCached);
      // Check if the cache is still valid
      if (Date.now() - parsedData.timestamp < CACHE_EXPIRY) {
        return parsedData;
      }
    }
    
    // Then check localStorage (persists across visits)
    const localCached = localStorage.getItem(`img_${cacheKey}`);
    if (localCached) {
      const parsedData = JSON.parse(localCached);
      // Local storage has a longer expiry (24 hours)
      if (Date.now() - parsedData.timestamp < 24 * CACHE_EXPIRY) {
        // Refresh the session cache
        sessionStorage.setItem(`img_${cacheKey}`, JSON.stringify({
          ...parsedData,
          timestamp: Date.now() // Update timestamp
        }));
        return parsedData;
      }
    }
  } catch (error) {
    console.error('Error retrieving from browser cache:', error);
  }
  
  return null;
};

/**
 * Save an image to browser cache
 * @param cacheKey The key to store in cache
 * @param imageData The image data to cache
 */
const saveToBrowserCache = (cacheKey: string, imageData: any) => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  try {
    const dataToCache = {
      ...imageData,
      timestamp: Date.now()
    };
    
    // Save to both session (current visit) and local storage (future visits)
    sessionStorage.setItem(`img_${cacheKey}`, JSON.stringify(dataToCache));
    localStorage.setItem(`img_${cacheKey}`, JSON.stringify(dataToCache));
  } catch (error) {
    console.error('Error saving to browser cache:', error);
  }
};

/**
 * Get an image URL for use in the application
 * 
 * @param image Image source (string or object)
 * @param keyword Keyword for fallback image
 * @param width Image width
 * @param height Image height
 * @returns Image URL string
 */
export const getImageUrl = async (
  image: string | { url?: string } | undefined,
  keyword: string = "date",
  width: number = 400, 
  height: number = 300
): Promise<string> => {
  // console.log(`🔍 getImageUrl called with image: ${image}, keyword: ${keyword}`);
  
  // Ensure keyword is always a string
  const safeKeyword = (keyword && typeof keyword === 'string') ? keyword : "date";
  
  // Handle undefined or null - go straight to Pexels
  if (!image) {
    // console.log(`📸 No image provided, using Pexels for keyword: ${safeKeyword}`);
    return await getPexelsFallbackUrl(safeKeyword, width, height);
  }
  
  // Handle strings
  if (typeof image === 'string') {
    // Ensure the string exists before calling methods on it
    const safeImage = image || '';
    
    // If it's a placeholder URL or empty path, use Pexels fallback
    if (
      safeImage.includes('placeholder.svg') || 
      safeImage.includes('/?height=') || 
      safeImage === '/' ||
      safeImage.includes('placeholder')
    ) {
      // console.log(`🔄 Placeholder detected (${safeImage}), using Pexels for keyword: ${safeKeyword}`);
      return await getPexelsFallbackUrl(safeKeyword, width, height);
    }
    
    // If it's already a valid URL (starts with http), use it
    if (safeImage.startsWith('http')) {
      // console.log(`✅ Valid URL found: ${safeImage}`);
      return safeImage;
    }
    
    // Otherwise, treat as keyword and get from Pexels
    // console.log(`🔄 Invalid URL (${safeImage}), using Pexels for keyword: ${safeKeyword}`);
    return await getPexelsFallbackUrl(safeKeyword, width, height);
  }
  
  // Handle objects with url property
  if (image && typeof image === 'object' && 'url' in image && image.url) {
    if (image.url.startsWith('http')) {
      // console.log(`✅ Valid object URL found: ${image.url}`);
      return image.url;
    }
  }
  
  // Default fallback to Pexels instead of placeholder
  // console.log(`🔄 No valid image found, using Pexels for keyword: ${keyword}`);
  return await getPexelsFallbackUrl(keyword, width, height);
};

/**
 * Get a fallback image URL from Pexels based on a search query
 * 
 * @param keyword Search keyword for the image
 * @param width Image width
 * @param height Image height
 * @returns Image URL string from Pexels
 */
export const getPexelsFallbackUrl = async (
  keyword: string = "date", 
  width: number = 400, 
  height: number = 300
): Promise<string> => {
  // Create a cache key
  const cacheKey = `${keyword}-${width}x${height}`;
  
  // Check browser cache first
  const browserCached = getBrowserCachedImage(cacheKey);
  if (browserCached) {
    return browserCached.url;
  }

  // Then check memory cache
  if (imageCache[cacheKey] && Date.now() - imageCache[cacheKey].timestamp < CACHE_EXPIRY) {
    const cached = imageCache[cacheKey];
    
    // Also save to browser cache
    saveToBrowserCache(cacheKey, cached);
    
    return cached.url;
  }
  
  try {
    // Check if we're in a browser environment and avoid CORS issues
    if (typeof window !== 'undefined') {
      console.warn('Pexels API called from client side, using fallback image');
      return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
    }
    
    // Call the Pexels Search API (server-side only)
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(keyword)}&per_page=1&size=medium`,
      {
        headers: {
          Authorization: PEXELS_ACCESS_KEY,
        },
      }
    );
    
    if (!response.ok) {
      console.warn(`Pexels API error: ${response.status} ${response.statusText}`);
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if any results were returned
    if (data.photos && data.photos.length > 0) {
      const photo: PexelsPhoto = data.photos[0];
      const imageUrl = photo.src.medium;
      
      // Create cache object
      const cacheData = {
        url: imageUrl,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        timestamp: Date.now()
      };
      
      // Save to memory cache
      imageCache[cacheKey] = cacheData;
      
      // Save to browser cache
      saveToBrowserCache(cacheKey, cacheData);
      
      // console.log(`✅ Successfully loaded Pexels image for "${keyword}": ${imageUrl}`);
      return imageUrl;
    } else {
      console.warn(`No Pexels results for keyword: ${keyword}`);
      // Return a default romantic date image instead of placeholder
      return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
    }
  } catch (error: any) {
    console.error(`Error fetching Pexels image for "${keyword}":`, error);
    // Return a default romantic date image instead of placeholder
    return 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
  }
};

/**
 * Get multiple images for a gallery based on a keyword
 * Each will be slightly different by appending a variant to the keyword
 * 
 * @param keyword Base keyword for images
 * @param count Number of images to generate
 * @param width Image width
 * @param height Height of images
 * @returns Array of image URLs
 */
export const getImageGallery = async (
  keyword: string = "date",
  count: number = 3, 
  width: number = 600, 
  height: number = 400
): Promise<string[]> => {
  const images: string[] = [];
  
  // Create variations of the keyword to get different but related images
  const variants = [
    keyword,
    `${keyword} romantic`,
    `${keyword} couple`
  ];
  
  // Generate enough images to meet the count
  for (let i = 0; i < count; i++) {
    const variantIndex = i % variants.length;
    images.push(await getPexelsFallbackUrl(variants[variantIndex], width, height));
  }
  
  return images;
};

/**
 * Process images for multiple date ideas at once
 * This is optimized for displaying a list of date ideas with images
 * 
 * @param dateIdeas Array of date idea objects
 * @param width Image width
 * @param height Image height
 * @returns Object mapping date idea IDs to image URLs
 */
export const processDateIdeaImages = async (
  dateIdeas: Array<{id: string, title: string, category?: string, image?: string}>,
  width: number = 400,
  height: number = 300
): Promise<Record<string, string>> => {
  if (!dateIdeas || dateIdeas.length === 0) {
    return {};
  }

  const imageMap: Record<string, string> = {};
  
  // Process all image requests in parallel for efficiency
  const imagePromises = dateIdeas.map(async (idea) => {
    const keyword = `${idea.title} ${idea.category || ''} date`;
    try {
      const imageUrl = await getImageUrl(idea.image, keyword, width, height);
      return { id: idea.id, url: imageUrl };
    } catch (error) {
      console.error(`Error processing image for date idea ${idea.title}:`, error);
      return { id: idea.id, url: getPlaceholderImage(width, height, idea.title) };
    }
  });
  
  const results = await Promise.all(imagePromises);
  
  // Convert the results to a map of id -> imageUrl
  results.forEach(result => {
    imageMap[result.id] = result.url;
  });
  
  return imageMap;
};

/**
 * Update the images in a date idea object with better relevant images
 * @param dateIdea Date idea object
 * @returns Updated date idea with proper images
 */
export const updateDateIdeaImages = async (dateIdea: any): Promise<any> => {
  if (!dateIdea) return null;
  
  // Create a copy to avoid mutating the original
  const updatedIdea = { ...dateIdea };
  
  // Generate relevant images for this date idea
  const imageKeyword = `${dateIdea.title} ${dateIdea.category} date`;
  updatedIdea.images = await getImageGallery(imageKeyword, 3, 800, 600);
  
  return updatedIdea;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getPexelsFallbackUrl instead
 */
export const getImage = (keyword: string = "date", width: number = 400, height: number = 300): string => {
  // For server components where we can't use async, we'll use the source URL directly
  return `https://source.unsplash.com/random/${width}x${height}?${encodeURIComponent(keyword.trim().replace(/\s+/g, ','))}`;
};