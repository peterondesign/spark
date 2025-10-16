/**
 * ULTRA-SIMPLE Image Service - Direct mapping to your Supabase bucket!
 */

// Your actual Supabase bucket configuration
const SUPABASE_PROJECT_ID = 'ljixbbwscwfdqygjmljq'; // Your actual project ID!
const SUPABASE_BUCKET_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/date-images`;

// Direct mapping to your actual bucket images (based on the files you showed)
const directImageMapping: Record<string, string> = {
  // Exact title matches from your CSV
  'acupuncture session': 'acupuncture_session_relaxation_diverse_couple_400x300_17605137834.jpg',
  'amusement park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'aquarium date': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'arcade night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'archery lessons': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg', 
  'aromatherapy massage': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'art class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'art exhibition': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'art gallery tour': 'art_gallery_tour_entertainment_mixed_race_couple_400x300_176051375.jpg',
  'axe throwing': 'axe_throwing_adventure_asian_couple_400x300_1760513896032.jpg',
  'baking class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'baking together': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'ballet performance': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'beach cinema': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  
  // Alternative matches (keyword variants)
  'acupuncture': 'acupuncture_session_relaxation_diverse_couple_400x300_17605137834.jpg',
  'amusement': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'aquarium': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'arcade': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'archery': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'massage': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'art': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'axe': 'axe_throwing_adventure_asian_couple_400x300_1760513896032.jpg',
  'baking': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'ballet': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'beach': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg'
};

/**
 * SUPER SIMPLE - Get image URL instantly!
 */
export const getImageUrl = async (
  image: string | { url?: string } | undefined,
  keyword: string = "date",
  width: number = 400, 
  height: number = 300,
  useCompressed: boolean = true
): Promise<string> => {
  
  // 1. If image is already a valid URL, use it
  if (image && typeof image === 'string' && image.startsWith('http')) {
    return image;
  }
  if (image && typeof image === 'object' && image.url && image.url.startsWith('http')) {
    return image.url;
  }
  
  // 2. Try to find in your bucket (this is the magic!)
  const cleanKeyword = keyword.toLowerCase().trim();
  
  // Direct match
  if (directImageMapping[cleanKeyword]) {
    return `${SUPABASE_BUCKET_URL}/${directImageMapping[cleanKeyword]}`;
  }
  
  // Fuzzy match - check if keyword contains any of our mapped terms
  for (const [key, filename] of Object.entries(directImageMapping)) {
    if (cleanKeyword.includes(key) || key.includes(cleanKeyword.split(' ')[0])) {
      return `${SUPABASE_BUCKET_URL}/${filename}`;
    }
  }
  
  // 3. Fallback to Unsplash for unmapped items
  const searchTerm = encodeURIComponent(cleanKeyword.replace(/\s+/g, ','));
  return `https://source.unsplash.com/featured/${width}x${height}?${searchTerm}`;
};

// Keep the old functions for compatibility
export const getPexelsFallbackUrl = getImageUrl;
export const getPlaceholderImage = (width: number = 400, height: number = 300, text?: string): string => {
  const baseUrl = `/placeholder.svg?height=${height}&width=${width}`;
  return text ? `${baseUrl}&text=${encodeURIComponent(text)}` : baseUrl;
};

export const preloadImages = (urls: string[]) => {
  if (typeof window === 'undefined') return;
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
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
    images.push(await getPexelsFallbackUrl(undefined, variants[variantIndex], width, height, true));
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