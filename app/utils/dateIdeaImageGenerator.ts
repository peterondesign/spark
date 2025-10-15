import ReplicateImageService from './newImageService';
import { supabase } from '../../utils/supabaseClient';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
}

/**
 * Generate and save image for a single date idea
 * Use this when adding new date ideas to automatically generate images
 */
export async function generateImageForDateIdea(
  dateIdea: DateIdea,
  options: {
    width?: number;
    height?: number;
    diversityPrompt?: string;
  } = {}
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const { width = 400, height = 300, diversityPrompt } = options;

    // Diversity prompts for couple representation
    const diversityPrompts = [
      'White couple',
      'diverse couple',
      'interracial couple',
      'multicultural couple',
      'Asian couple',
      'Black couple',
      'Latino couple',
      'Caucasian couple',
      'mixed race couple',
      'LGBTQ+ couple'
    ];

    const selectedDiversityPrompt = diversityPrompt || 
      diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];

    const keyword = `${dateIdea.title} ${dateIdea.category} ${selectedDiversityPrompt}`;
    
    console.log(`🎨 Generating image for new date idea: ${dateIdea.title}`);
    console.log(`📝 Using prompt: ${keyword}`);

    const imageService = ReplicateImageService.getInstance();
    const imageUrl = await imageService.getImage(keyword, width, height);

    if (imageUrl) {
      console.log(`✅ Successfully generated image for: ${dateIdea.title}`);
      return {
        success: true,
        imageUrl
      };
    } else {
      const errorMsg = `Failed to generate image for: ${dateIdea.title}`;
      console.error(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    }

  } catch (error) {
    const errorMsg = `Error generating image for ${dateIdea.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Generate images for multiple date ideas
 * Useful for batch processing
 */
export async function generateImagesForDateIdeas(
  dateIdeas: DateIdea[],
  options: {
    width?: number;
    height?: number;
    delayBetweenRequests?: number;
  } = {}
): Promise<{
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    dateIdea: DateIdea;
    success: boolean;
    imageUrl?: string;
    error?: string;
  }>;
}> {
  const { width = 400, height = 300, delayBetweenRequests = 2000 } = options;
  const results = [];
  let successful = 0;
  let failed = 0;

  console.log(`🎨 Starting batch generation for ${dateIdeas.length} date ideas`);

  for (let i = 0; i < dateIdeas.length; i++) {
    const dateIdea = dateIdeas[i];
    console.log(`Processing ${i + 1}/${dateIdeas.length}: ${dateIdea.title}`);

    const result = await generateImageForDateIdea(dateIdea, { width, height });
    
    results.push({
      dateIdea,
      ...result
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
    }

    // Add delay between requests to avoid rate limits (except for last item)
    if (i < dateIdeas.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
    }
  }

  console.log(`🎉 Batch generation complete! Successful: ${successful}, Failed: ${failed}`);

  return {
    total: dateIdeas.length,
    successful,
    failed,
    results
  };
}

/**
 * Check if a date idea already has a generated image
 */
export async function hasGeneratedImage(dateIdea: DateIdea): Promise<boolean> {
  try {
    // Create the same cache key format used in the image service
    const keyword = `${dateIdea.title} ${dateIdea.category}`;
    const cacheKey = `${keyword.toLowerCase().replace(/\s+/g, '_')}_400x300`;

    const { data } = await supabase
      .from('generated_images')
      .select('id')
      .eq('keyword', cacheKey)
      .single();

    return !!data;
  } catch {
    return false;
  }
}

/**
 * Get all date ideas that don't have generated images
 */
export async function getDateIdeasWithoutImages(): Promise<DateIdea[]> {
  try {
    // Get all date ideas
    const { data: allDateIdeas, error } = await supabase
      .from('date_ideas')
      .select('*');

    if (error || !allDateIdeas) {
      throw new Error(`Failed to fetch date ideas: ${error?.message}`);
    }

    // Filter out those that already have images
    const dateIdeasWithoutImages = [];
    
    for (const dateIdea of allDateIdeas) {
      const hasImage = await hasGeneratedImage(dateIdea);
      if (!hasImage) {
        dateIdeasWithoutImages.push(dateIdea);
      }
    }

    console.log(`Found ${dateIdeasWithoutImages.length} date ideas without generated images`);
    return dateIdeasWithoutImages;

  } catch (error) {
    console.error('Error getting date ideas without images:', error);
    throw error;
  }
}

export default {
  generateImageForDateIdea,
  generateImagesForDateIdeas,
  hasGeneratedImage,
  getDateIdeasWithoutImages
};