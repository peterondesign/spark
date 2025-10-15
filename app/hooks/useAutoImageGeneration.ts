/**
 * Hook and utilities for automatically generating images when new date ideas are added
 */

import { useState } from 'react';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
}

interface UseAutoImageGenerationReturn {
  generateImage: (dateIdea: DateIdea) => Promise<string | null>;
  isGenerating: boolean;
  error: string | null;
  lastGeneratedUrl: string | null;
}

/**
 * React hook for auto-generating images for new date ideas
 */
export function useAutoImageGeneration(): UseAutoImageGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);

  const generateImage = async (dateIdea: DateIdea): Promise<string | null> => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/generate-date-idea-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dateIdea,
          options: {
            width: 400,
            height: 300
          }
        }),
      });

      const data = await response.json();

      if (data.success) {
        setLastGeneratedUrl(data.imageUrl);
        return data.imageUrl;
      } else {
        setError(data.message || 'Failed to generate image');
        return null;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate image';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateImage,
    isGenerating,
    error,
    lastGeneratedUrl
  };
}

/**
 * Utility function to automatically generate image when adding a new date idea
 * Call this after successfully adding a date idea to the database
 */
export async function autoGenerateImageForNewDateIdea(
  dateIdea: DateIdea
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    console.log(`🎨 Auto-generating image for new date idea: ${dateIdea.title}`);

    const response = await fetch('/api/generate-date-idea-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateIdea,
        options: {
          width: 400,
          height: 300
        }
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log(`✅ Auto-generated image for: ${dateIdea.title}`);
      return {
        success: true,
        imageUrl: data.imageUrl
      };
    } else {
      console.error(`❌ Failed to auto-generate image for: ${dateIdea.title}`);
      return {
        success: false,
        error: data.message || 'Image generation failed'
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`💥 Auto-generation error for ${dateIdea.title}:`, errorMessage);
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Example usage in a date idea creation form:
 * 
 * ```typescript
 * import { autoGenerateImageForNewDateIdea } from './path/to/autoImageGeneration';
 * 
 * async function addNewDateIdea(formData) {
 *   // 1. Add the date idea to database
 *   const newDateIdea = await saveToDatabase(formData);
 *   
 *   // 2. Auto-generate image for the new date idea
 *   const imageResult = await autoGenerateImageForNewDateIdea(newDateIdea);
 *   
 *   if (imageResult.success) {
 *     console.log('Image generated:', imageResult.imageUrl);
 *   } else {
 *     console.warn('Image generation failed:', imageResult.error);
 *   }
 *   
 *   return newDateIdea;
 * }
 * ```
 */

export default {
  useAutoImageGeneration,
  autoGenerateImageForNewDateIdea
};