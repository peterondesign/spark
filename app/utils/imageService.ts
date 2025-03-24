/**
 * Utility functions for handling images using the Pexels API
 */

const PEXELS_ACCESS_KEY = process.env.NEXT_PUBLIC_PEXELS_ACCESS_KEY || "your-pexels-access-key";
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

// Simple in-memory cache with 1-hour expiration
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
  // Check cache first
  const cacheKey = `${keyword}-${width}x${height}`;
  const cachedImage = imageCache[cacheKey];
  
  if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_EXPIRY) {
    return cachedImage.url;
  }
  
  // Handle undefined or null
  if (!image) {
    return await getPexelsFallbackUrl(keyword, width, height);
  }
  
  // Handle strings
  if (typeof image === 'string') {
    // If it's a placeholder URL or empty path, use Pexels fallback
    if (
      image.includes('placeholder.svg') || 
      image.includes('/?height=') || 
      image === '/'
    ) {
      return await getPexelsFallbackUrl(keyword, width, height);
    }
    
    // If it's already a valid URL, use it
    return image;
  }
  
  // Handle objects with url property
  if (image && typeof image === 'object' && 'url' in image && image.url) {
    return image.url;
  }
  
  // Default fallback to placeholder
  return getPlaceholderImage(width, height, keyword);
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
  
  try {
    // Call the Pexels Search API
    const response = await fetch(
      `${PEXELS_API_URL}/search?query=${encodeURIComponent(keyword)}&per_page=1&size=medium`,
      {
        headers: {
          Authorization: PEXELS_ACCESS_KEY,
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Check if any results were returned
    if (data.photos.length > 0) {
      const photo: PexelsPhoto = data.photos[0];
      const imageUrl = photo.src.large;
      
      // Save to cache
      imageCache[cacheKey] = {
        url: imageUrl,
        photographer: photo.photographer,
        photographerUrl: photo.photographer_url,
        timestamp: Date.now()
      };
      
      return imageUrl;
    } else {
      // If no results, return a placeholder
      return getPlaceholderImage(width, height, keyword);
    }
  } catch (error: any) {
    return getPlaceholderImage(width, height, keyword);
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
