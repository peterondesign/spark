#!/usr/bin/env node

/**
 * Complete test: Generate AI image and save to Supabase bucket
 */

import Replicate from 'replicate';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

async function testCompleteImagePipeline() {
  console.log('🧪 Testing complete image pipeline...');
  
  if (!process.env.REPLICATE_API_TOKEN) {
    console.error('❌ REPLICATE_API_TOKEN not found');
    return;
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Supabase credentials not found');
    return;
  }
  
  try {
    // Initialize Replicate
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
    
    // Initialize Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('🎨 Step 1: Generating image with Seedream-4...');
    
    const keyword = 'romantic dinner candles wine beautiful lighting';
    const input = {
      prompt: `High-quality, professional photo of ${keyword}, beautiful lighting, detailed, realistic, romantic couple date, aesthetic photography`,
      aspect_ratio: "4:3"
    };

    const output = await replicate.run("bytedance/seedream-4", { input });
    
    if (!output || !output[0] || !output[0].url) {
      console.error('❌ No image generated');
      return;
    }
    
    const imageUrl = output[0].url();
    console.log('✅ Image generated:', imageUrl);
    
    console.log('💾 Step 2: Downloading image...');
    
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const imageBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    
    console.log('📁 Step 3: Uploading to Supabase storage...');
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `${keyword.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.jpg`;
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('generated-images')
      .upload(filename, uint8Array, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload failed:', uploadError);
      return;
    }
    
    console.log('✅ Uploaded to storage:', uploadData.path);
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('generated-images')
      .getPublicUrl(uploadData.path);
    
    const publicUrl = urlData.publicUrl;
    console.log('🔗 Public URL:', publicUrl);
    
    console.log('💽 Step 4: Saving to database...');
    
    // Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('generated_images')
      .insert({
        keyword: keyword,
        image_url: publicUrl,
        storage_path: uploadData.path,
        created_at: new Date().toISOString()
      })
      .select();

    if (dbError) {
      console.error('❌ Database save failed:', dbError);
      return;
    }
    
    console.log('✅ Saved to database:', dbData[0].id);
    
    console.log('🎉 SUCCESS! Complete pipeline working:');
    console.log('  - Generated AI image ✅');
    console.log('  - Uploaded to Supabase bucket ✅');
    console.log('  - Saved reference to database ✅');
    console.log('  - Check your Supabase bucket now! 🚀');
    
  } catch (error) {
    console.error('💥 Pipeline test failed:', error.message);
  }
}

testCompleteImagePipeline();