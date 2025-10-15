#!/usr/bin/env node

/**
 * Quick test to verify cache key matching is working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testCacheKeyMatching() {
  console.log('🔍 Testing cache key matching for Paint on a Viewpoint...\n');
  
  // This is what would be generated from AllDateIdeasSection.tsx (after our fix)
  const frontendKeyword = "Paint on a Viewpoint Outdoor Latino couple";
  const width = 400;
  const height = 300;
  
  // Generate cache key using the same logic as newImageService.ts
  const cacheKey = frontendKeyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + `_${width}x${height}`;
    
  console.log(`Frontend keyword: "${frontendKeyword}"`);
  console.log(`Generated cache key: "${cacheKey}"`);
  
  // Check for exact match
  const { data: exactMatch } = await supabase
    .from('generated_images')
    .select('keyword, image_url')
    .eq('keyword', cacheKey)
    .single();
    
  if (exactMatch) {
    console.log(`✅ Exact match found!`);
    console.log(`   Stored keyword: ${exactMatch.keyword}`);
    console.log(`   Image URL: ${exactMatch.image_url}`);
    return;
  }
  
  console.log(`❌ No exact match found for: ${cacheKey}`);
  
  // Try fuzzy match
  const keywordOnly = cacheKey.replace(/_\d+x\d+$/, '');
  console.log(`🔍 Trying fuzzy match for: ${keywordOnly}%`);
  
  const { data: fuzzyMatches } = await supabase
    .from('generated_images')
    .select('keyword, image_url')
    .ilike('keyword', `${keywordOnly}%`)
    .limit(5);
    
  if (fuzzyMatches && fuzzyMatches.length > 0) {
    console.log(`✅ Found ${fuzzyMatches.length} fuzzy matches:`);
    fuzzyMatches.forEach((match, i) => {
      console.log(`   ${i + 1}. ${match.keyword} -> ${match.image_url}`);
    });
  } else {
    console.log(`❌ No fuzzy matches found`);
    
    // Let's see what IS stored for Paint on a Viewpoint
    const { data: allPaintMatches } = await supabase
      .from('generated_images')
      .select('keyword, image_url')
      .ilike('keyword', '%paint%viewpoint%')
      .limit(10);
      
    if (allPaintMatches && allPaintMatches.length > 0) {
      console.log(`\n🎨 Found Paint on Viewpoint variations in database:`);
      allPaintMatches.forEach((match, i) => {
        console.log(`   ${i + 1}. ${match.keyword}`);
      });
    } else {
      console.log(`\n❌ No Paint on Viewpoint entries found in database at all`);
    }
  }
}

testCacheKeyMatching().catch(console.error);