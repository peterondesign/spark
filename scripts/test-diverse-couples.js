#!/usr/bin/env node

/**
 * Test diverse couple image generation
 */

import Replicate from 'replicate';
import dotenv from 'dotenv';

dotenv.config();

async function testDiverseCoupleImages() {
  console.log('🧪 Testing diverse couple image generation...');
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found');
    return;
  }
  
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    const testPrompts = [
      'romantic dinner diverse couple',
      'picnic in park interracial couple',
      'cooking together multicultural couple',
      'hiking Asian couple',
      'dancing Black couple',
      'coffee date Latino couple',
      'museum visit mixed race couple',
      'same-sex couple romantic walk'
    ];
    
    console.log('🎨 Generating diverse couple images...');
    
    for (let i = 0; i < testPrompts.length; i++) {
      const prompt = testPrompts[i];
      console.log(`\n${i + 1}. Testing: "${prompt}"`);
      
      const input = {
        prompt: `High-quality, professional photo of ${prompt}, beautiful lighting, detailed, realistic, diverse representation, inclusive imagery, aesthetic photography`,
        aspect_ratio: "4:3"
      };

      try {
        const output = await replicate.run("bytedance/seedream-4", { input });
        
        if (output && output[0] && output[0].url) {
          const imageUrl = output[0].url();
          console.log(`✅ Generated: ${imageUrl}`);
        } else {
          console.log('❌ No image generated');
        }
      } catch (error) {
        console.log(`❌ Failed: ${error.message}`);
      }
      
      // Wait 2 seconds between requests to avoid rate limits
      if (i < testPrompts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('\n🎉 Diverse couple image test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

testDiverseCoupleImages();