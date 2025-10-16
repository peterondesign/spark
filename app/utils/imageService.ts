/**
 * ULTRA-FAST Image Service - Direct URL generation with localStorage caching
 * No API calls, instant responses!
 */

// We can remove the Replicate import since we're not using API calls anymore
// import ReplicateImageService from './newImageService';

// We no longer need these API keys since we're generating URLs directly
// const PEXELS_ACCESS_KEY = process.env.NEXT_PUBLIC_PEXELS_ACCESS_KEY || "uCWBRGyGfG2SPRGVszsdP9WFzVNMwVC6co4xLTAaivaRCnleATbRcIEe";
// const PEXELS_API_URL = "https://api.pexels.com/v1";

// Old Pexels type - no longer needed since we generate URLs directly
// type PexelsPhoto = { ... };

// Enhanced cache with direct URL storage - no more API calls!
type ImageCache = {
  [key: string]: {
    url: string;
    timestamp: number;
    compressed?: string;
  };
};

// Extended cache duration since URLs are stable
const imageCache: ImageCache = {};
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const BROWSER_CACHE_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days for browser cache

// Direct URL generation for stable image URLs - no API calls needed!
const generateStableImageUrl = (keyword: string, width: number = 400, height: number = 300): string => {
  // Generate a consistent hash from the keyword for stable URLs
  const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const keywordHash = cleanKeyword.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Use absolute value to ensure positive number
  const imageId = Math.abs(keywordHash) % 1000 + 1;
  
  // Use Unsplash Source API for stable, fast URLs
  // This creates consistent URLs based on keyword and size
  const searchTerm = encodeURIComponent(cleanKeyword.replace(/\s+/g, ','));
  return `https://source.unsplash.com/featured/${width}x${height}?${searchTerm}&sig=${imageId}`;
};

// Image compression utility
const compressImageUrl = (url: string, quality: number = 80): string => {
  // For Pexels images, we can modify the URL to get different qualities
  if (url.includes('pexels.com')) {
    // Use smaller size for faster loading
    return url.replace(/(\?.*)?$/, `?auto=compress&cs=tinysrgb&w=400&h=300&dpr=2`);
  }
  return url;
};

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
 * Ultra-fast function to check localStorage for cached image URLs
 * @param cacheKey Cache key to check
 * @returns Cached image URL or null
 */
const getFromLocalCache = (cacheKey: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem(`img_${cacheKey}`);
    if (cached) {
      const parsedData = JSON.parse(cached);
      if (Date.now() - parsedData.timestamp < BROWSER_CACHE_EXPIRY) {
        return parsedData.url;
      } else {
        // Remove expired cache
        localStorage.removeItem(`img_${cacheKey}`);
      }
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }
  
  return null;
};

/**
 * Ultra-fast function to save image URL to localStorage
 * @param cacheKey Cache key
 * @param imageUrl The image URL to cache
 */
const saveToLocalCache = (cacheKey: string, imageUrl: string) => {
  if (typeof window === 'undefined') return;
  
  try {
    const dataToCache = {
      url: imageUrl,
      timestamp: Date.now()
    };
    
    localStorage.setItem(`img_${cacheKey}`, JSON.stringify(dataToCache));
  } catch (error) {
    // Handle quota exceeded by clearing old items
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage quota exceeded, clearing old cache');
      clearOldImageCache();
      // Try again after clearing
      try {
        localStorage.setItem(`img_${cacheKey}`, JSON.stringify({ url: imageUrl, timestamp: Date.now() }));
      } catch (e) {
        console.error('Still cannot save to localStorage after cleanup:', e);
      }
    }
  }
};

/**
 * Clear old image cache entries to free up space
 */
const clearOldImageCache = () => {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  const imageKeys = keys.filter(key => key.startsWith('img_'));
  
  // Sort by timestamp and remove oldest 50%
  const itemsWithTimestamp = imageKeys.map(key => {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return { key, timestamp: data.timestamp || 0 };
    } catch {
      return { key, timestamp: 0 };
    }
  }).sort((a, b) => a.timestamp - b.timestamp);
  
  const itemsToRemove = itemsWithTimestamp.slice(0, Math.floor(itemsWithTimestamp.length * 0.5));
  itemsToRemove.forEach(item => localStorage.removeItem(item.key));
};

/**
 * Ultra-fast preload images function
 * @param urls Array of image URLs to preload
 */
export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;
  
  urls.forEach(url => {
    const img = new Image();
    img.src = compressImageUrl(url);
    // Optional: Add to cache when loaded
    img.onload = () => {
      console.log(`Preloaded: ${url}`);
    };
  });
};

/**
 * ULTRA-FAST image URL function - no API calls, instant response!
 * 
 * @param image Image source (string or object) 
 * @param keyword Keyword for fallback image
 * @param width Image width
 * @param height Image height
 * @param useCompressed Whether to use compressed version
 * @returns Image URL string (instant, no async needed!)
 */
export const getImageUrl = async (
  image: string | { url?: string } | undefined,
  keyword: string = "date",
  width: number = 400, 
  height: number = 300,
  useCompressed: boolean = true
): Promise<string> => {
  // Ensure keyword is always a string
  const safeKeyword = (keyword && typeof keyword === 'string') ? keyword : "date";
  const cacheKey = `${safeKeyword}_${width}_${height}`;
  
  // 1. Check localStorage first - INSTANT if cached
  const cachedUrl = getFromLocalCache(cacheKey);
  if (cachedUrl) {
    return useCompressed ? compressImageUrl(cachedUrl) : cachedUrl;
  }
  
  // 2. Handle existing valid URLs
  if (image) {
    if (typeof image === 'string' && image.startsWith('http')) {
      const finalUrl = useCompressed ? compressImageUrl(image) : image;
      saveToLocalCache(cacheKey, finalUrl);
      return finalUrl;
    }
    
    if (typeof image === 'object' && image.url && image.url.startsWith('http')) {
      const finalUrl = useCompressed ? compressImageUrl(image.url) : image.url;
      saveToLocalCache(cacheKey, finalUrl);
      return finalUrl;
    }
  }
  
  // 3. Generate stable URL directly - NO API CALL!
  const directUrl = generateStableImageUrl(safeKeyword, width, height);
  const finalUrl = useCompressed ? compressImageUrl(directUrl) : directUrl;
  
  // Cache for next time
  saveToLocalCache(cacheKey, finalUrl);
  
  return finalUrl;
};

/**
 * ULTRA-FAST fallback URL generation - no API calls!
 * Generates stable URLs based on keyword hash
 */
export const getPexelsFallbackUrl = async (
  keyword: string = "date", 
  width: number = 400, 
  height: number = 300,
  useCompressed: boolean = true
): Promise<string> => {
  // Just use the direct URL generation - no API calls!
  const directUrl = generateStableImageUrl(keyword, width, height);
  return useCompressed ? compressImageUrl(directUrl) : directUrl;
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
    images.push(await getPexelsFallbackUrl(variants[variantIndex], width, height, true));
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
 * Get image URL from Replicate AI for a given keyword
 * @param keyword Search keyword for the image
 * @param width Desired width for the image  
 * @param height Desired height for the image
 * @returns Image URL string from Replicate AI
 */
export const getAIImageUrl = async (
  keyword: string = "date", 
  width: number = 400, 
  height: number = 300
): Promise<string> => {
  // Use the main getImageUrl function which handles AI generation
  return await getImageUrl(undefined, keyword, width, height);
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use getAIImageUrl instead
 */
export const getImage = (keyword: string = "date", width: number = 400, height: number = 300): string => {
  // For server components where we can't use async, we'll use the source URL directly
  return `https://source.unsplash.com/random/${width}x${height}?${encodeURIComponent(keyword.trim().replace(/\s+/g, ','))}`;
};