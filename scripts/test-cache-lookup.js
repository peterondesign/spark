#!/usr/bin/env node

/**
 * Test script to check what cache keys are in the database
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCacheLookup() {
  console.log('🔍 Checking database for Paint on a Viewpoint images...\n');
  
  try {
    // Look for any Paint on a Viewpoint related images
    const { data: paintImages, error } = await supabase
      .from('generated_images')
      .select('keyword, image_url')
      .ilike('keyword', '%paint%viewpoint%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log('📊 Found Paint on a Viewpoint images:');
    if (paintImages && paintImages.length > 0) {
      paintImages.forEach((img, index) => {
        console.log(`${index + 1}. Cache Key: "${img.keyword}"`);
        console.log(`   Image URL: ${img.image_url}`);
        console.log('');
      });
    } else {
      console.log('❌ No Paint on a Viewpoint images found');
    }

    // Test what a typical AllDateIdeasSection request would look like
    console.log('\n🧪 Testing typical cache key generation...');
    
    const testKeyword = "Paint on a Viewpoint Outdoor Latino couple";
    const testCacheKey = testKeyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') + '_400x300';
    
    console.log(`Original keyword: "${testKeyword}"`);
    console.log(`Generated cache key: "${testCacheKey}"`);
    
    // Check if this exact key exists
    const { data: exactMatch } = await supabase
      .from('generated_images')
      .select('keyword, image_url')
      .eq('keyword', testCacheKey)
      .single();
    
    if (exactMatch) {
      console.log(`✅ Exact match found: ${exactMatch.image_url}`);
    } else {
      console.log('❌ No exact match found');
      
      // Try fuzzy match
      const keywordOnly = testCacheKey.replace(/_\d+x\d+$/, '');
      console.log(`🔍 Trying fuzzy match with: "${keywordOnly}%"`);
      
      const { data: fuzzyMatch } = await supabase
        .from('generated_images')
        .select('keyword, image_url')
        .ilike('keyword', `${keywordOnly}%`)
        .limit(1)
        .single();
      
      if (fuzzyMatch) {
        console.log(`✅ Fuzzy match found: ${fuzzyMatch.keyword} -> ${fuzzyMatch.image_url}`);
      } else {
        console.log('❌ No fuzzy match found either');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCacheLookup();