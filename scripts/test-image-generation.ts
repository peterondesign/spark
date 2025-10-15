/**
 * Test script to generate an AI image and push it to Supabase bucket
 * This will help verify the Replicate integration is working
 */

import ReplicateImageService from '../app/utils/newImageService';

async function testImageGeneration() {
  console.log('🧪 Testing AI image generation...');
  
  try {
    const imageService = ReplicateImageService.getInstance();
    
    // Test with a simple romantic date keyword
    const keyword = 'romantic dinner candles';
    console.log(`🎨 Generating image for: "${keyword}"`);
    
    const imageUrl = await imageService.getImage(keyword, 512, 512);
    
    if (imageUrl) {
      console.log('✅ Image generated successfully!');
      console.log('🔗 Image URL:', imageUrl);
      console.log('📁 Check your Supabase bucket now!');
    } else {
      console.log('❌ Image generation failed');
    }
    
    // Get cache stats
    const stats = imageService.getCacheStats();
    console.log('📊 Cache stats:', stats);
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testImageGeneration();