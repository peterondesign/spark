import { createClient } from '@supabase/supabase-js';
import Replicate from 'replicate';
import { getFallbackImageKey } from './imageFallbacks';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GeneratedImage {
  id: string;
  keyword: string;
  image_url: string;
  storage_path: string;
  created_at: string;
}

class ReplicateImageService {
  private static instance: ReplicateImageService;
  private cache = new Map<string, string>();
  private replicate: Replicate;

  constructor() {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  static getInstance(): ReplicateImageService {
    if (!ReplicateImageService.instance) {
      ReplicateImageService.instance = new ReplicateImageService();
    }
    return ReplicateImageService.instance;
  }

  // Generate cache key from keyword and dimensions
  private getCacheKey(keyword: string, width: number, height: number): string {
    // Normalize the keyword: lowercase, replace spaces with underscores, remove extra spaces
    const normalized = keyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_') // Replace special characters with underscores
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
    return `${normalized}_${width}x${height}`;
  }

  // Check if image exists in database (public method)
  async checkImageExists(cacheKey: string): Promise<string | null> {
    try {
      console.log(`🔍 Checking for cache key: ${cacheKey}`);
      
      // First try exact match
      const { data, error } = await supabase
        .from('generated_images')
        .select('image_url')
        .eq('keyword', cacheKey)
        .single();

      if (!error && data) {
        console.log(`✅ Exact match found: ${data.image_url}`);
        return data.image_url;
      }
      
      // If exact match fails, try fuzzy match for similar keywords
      // Remove dimensions and diversity terms for broader matching
      const keywordOnly = cacheKey.replace(/_\d+x\d+$/, ''); // Remove dimensions
      
      // Remove common diversity terms to find base activity
      const baseKeyword = keywordOnly
        .replace(/_diverse_couple$/, '')
        .replace(/_white_couple$/, '')
        .replace(/_black_couple$/, '')
        .replace(/_asian_couple$/, '')
        .replace(/_latino_couple$/, '')
        .replace(/_caucasian_couple$/, '')
        .replace(/_interracial_couple$/, '')
        .replace(/_multicultural_couple$/, '')
        .replace(/_mixed_race_couple$/, '')
        .replace(/_lgbtq_couple$/, '');
      
      console.log(`🔍 Trying fuzzy match for base: "${baseKeyword}%"`);
      
      const { data: fuzzyData } = await supabase
        .from('generated_images')
        .select('image_url')
        .ilike('keyword', `${baseKeyword}%`)
        .limit(1)
        .single();
        
      if (fuzzyData) {
        console.log(`✅ Fuzzy match found: ${fuzzyData.image_url}`);
        return fuzzyData.image_url;
      }
      
      // Try fallback mapping for common missing images
      console.log(`🔄 Trying fallback mapping for: ${baseKeyword}`);
      const fallbackKey = getFallbackImageKey(baseKeyword);
      if (fallbackKey !== baseKeyword) {
        console.log(`🔄 Using fallback key: ${fallbackKey}`);
        
        const { data: fallbackData } = await supabase
          .from('generated_images')
          .select('image_url')
          .ilike('keyword', `${fallbackKey}%`)
          .limit(1)
          .single();
          
        if (fallbackData) {
          console.log(`✅ Fallback image found: ${fallbackData.image_url}`);
          return fallbackData.image_url;
        }
      }
      
      console.log(`❌ No match found for: ${cacheKey}`);
      return null;
    } catch {
      return null;
    }
  }

  // Generate image using Replicate API with Seedream-4
  private async generateImage(prompt: string): Promise<string | null> {
    try {
      console.log('Generating image with Seedream-4:', prompt);
      
      // Add diversity and inclusion to base prompt when it contains couple-related terms
      const includesDiverseTerms = /couple|romantic|date|partner/i.test(prompt);
      const diversityAddition = includesDiverseTerms ? ', diverse representation, inclusive imagery' : '';
      
      const input = {
        prompt: `High-quality, professional photo of ${prompt}, beautiful lighting, detailed, realistic${diversityAddition}, aesthetic photography`,
        aspect_ratio: "4:3"
      };

      const output = await this.replicate.run("bytedance/seedream-4", { input });
      
      if (output && Array.isArray(output) && output[0] && typeof output[0] === 'object' && output[0] !== null && 'url' in output[0]) {
        return (output[0] as any).url();
      }

      throw new Error('No image generated from Seedream-4');
    } catch (error) {
      console.error('Replicate Seedream-4 API error:', error);
      return null;
    }
  }

  // Upload image to Supabase Storage
  private async uploadToStorage(imageUrl: string, fileName: string): Promise<string | null> {
    try {
      // Download the image
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to download image');
      
      const imageBlob = await response.blob();
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('generated-images')
        .upload(fileName, imageBlob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('generated-images')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    } catch (error) {
      console.error('Storage upload error:', error);
      return null;
    }
  }

  // Save image reference to database
  private async saveToDatabase(
    cacheKey: string, 
    imageUrl: string, 
    storagePath: string
  ): Promise<void> {
    try {
      await supabase
        .from('generated_images')
        .insert({
          keyword: cacheKey,
          image_url: imageUrl,
          storage_path: storagePath,
        });
    } catch (error) {
      console.error('Database save error:', error);
    }
  }

  // Public method to find existing images without generation
  async findExistingImage(
    keyword: string, 
    width: number = 400, 
    height: number = 300
  ): Promise<string | null> {
    const cacheKey = this.getCacheKey(keyword, width, height);
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Check database cache
    const existingImage = await this.checkImageExists(cacheKey);
    if (existingImage) {
      this.cache.set(cacheKey, existingImage);
      return existingImage;
    }

    return null;
  }

  // Main function to get or generate image
  async getImage(
    keyword: string, 
    width: number = 400, 
    height: number = 300
  ): Promise<string> {
    const cacheKey = this.getCacheKey(keyword, width, height);
    console.log(`🔍 Looking for image with cache key: ${cacheKey} (from keyword: "${keyword}")`);
    
    // Check memory cache first
    if (this.cache.has(cacheKey)) {
      console.log(`✅ Found in memory cache: ${cacheKey}`);
      return this.cache.get(cacheKey)!;
    }

    // Check database cache
    const existingImage = await this.checkImageExists(cacheKey);
    if (existingImage) {
      console.log(`✅ Found in database cache: ${cacheKey} -> ${existingImage}`);
      this.cache.set(cacheKey, existingImage);
      return existingImage;
    }

    // Generate new image
    console.log(`🎨 Generating new image for: ${keyword}`);
    const generatedImageUrl = await this.generateImage(keyword);
    
    if (!generatedImageUrl) {
      // Return fallback if generation fails
      console.log(`❌ Generation failed, using fallback for: ${keyword}`);
      return this.getFallbackImage(width, height, keyword);
    }

    // Upload to storage
    const fileName = `${cacheKey}_${Date.now()}.jpg`;
    const storageUrl = await this.uploadToStorage(generatedImageUrl, fileName);
    
    if (!storageUrl) {
      // Return the original generated URL if storage fails
      console.log(`⚠️ Storage failed, using direct URL for: ${keyword}`);
      this.cache.set(cacheKey, generatedImageUrl);
      return generatedImageUrl;
    }

    // Save to database
    await this.saveToDatabase(cacheKey, storageUrl, fileName);
    
    // Cache and return
    this.cache.set(cacheKey, storageUrl);
    console.log(`✅ Successfully generated and stored: ${cacheKey} -> ${storageUrl}`);
    return storageUrl;
  }

  // Fallback image generator
  private getFallbackImage(width: number, height: number, text: string): string {
    const encodedText = encodeURIComponent(text);
    return `https://via.placeholder.com/${width}x${height}/1a1a1a/ffffff?text=${encodedText}`;
  }

  // Batch generate images for multiple keywords
  async generateBatch(keywords: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    // Process in batches of 3 to avoid rate limits
    for (let i = 0; i < keywords.length; i += 3) {
      const batch = keywords.slice(i, i + 3);
      const promises = batch.map(keyword => this.getImage(keyword));
      
      const batchResults = await Promise.all(promises);
      batch.forEach((keyword, index) => {
        results.set(keyword, batchResults[index]);
      });
      
      // Wait between batches
      if (i + 3 < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  }

  // Clear cache method
  clearCache(): void {
    this.cache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export default ReplicateImageService;