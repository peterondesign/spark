#!/usr/bin/env node

/**
 * Direct test of Replicate API without Next.js server
 */

import Replicate from 'replicate';
import dotenv from 'dotenv';

dotenv.config();

async function testReplicate() {
  console.log('🧪 Testing Replicate API directly...');
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found in environment');
    return;
  }
  
  console.log('✅ API token found');
  
  try {
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    console.log('🎨 Generating image with Seedream-4...');
    
    const input = {
      prompt: "romantic dinner with candles, wine glasses, and flowers on table, beautiful lighting, professional photography",
      aspect_ratio: "4:3"
    };

    const output = await replicate.run("bytedance/seedream-4", { input });
    
    if (output && output[0] && output[0].url) {
      const imageUrl = output[0].url();
      console.log('✅ Image generated successfully!');
      console.log('🔗 Image URL:', imageUrl);
      console.log('📁 This image URL can be saved to your bucket!');
    } else {
      console.log('❌ No image URL returned');
      console.log('Output:', output);
    }
    
  } catch (error) {
    console.error('💥 Replicate API test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testReplicate();