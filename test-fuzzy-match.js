#!/usr/bin/env node

/**
 * Test the improved fuzzy matching
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testFuzzyMatching() {
  // This is what frontend requests
  const frontendKeyword = "Kite Flying at a Park Outdoor diverse couple";
  const cacheKey = frontendKeyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') + '_400x300';
  
  console.log(`Frontend requests: "${frontendKeyword}"`);
  console.log(`Cache key: "${cacheKey}"`);
  
  // Try exact match first
  const { data: exactMatch } = await supabase
    .from('generated_images')
    .select('keyword, image_url')
    .eq('keyword', cacheKey)
    .single();
    
  if (exactMatch) {
    console.log(`✅ Exact match: ${exactMatch.image_url}`);
    return;
  }
  
  console.log(`❌ No exact match`);
  
  // Try improved fuzzy match
  const keywordOnly = cacheKey.replace(/_\d+x\d+$/, '');
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
  
  console.log(`Base keyword for fuzzy search: "${baseKeyword}%"`);
  
  const { data: fuzzyMatches } = await supabase
    .from('generated_images')
    .select('keyword, image_url')
    .ilike('keyword', `${baseKeyword}%`)
    .limit(5);
    
  if (fuzzyMatches && fuzzyMatches.length > 0) {
    console.log(`✅ Found ${fuzzyMatches.length} fuzzy matches:`);
    fuzzyMatches.forEach((match, i) => {
      console.log(`   ${i + 1}. ${match.keyword}`);
      console.log(`      ${match.image_url}`);
    });
  } else {
    console.log(`❌ No fuzzy matches found`);
  }
}

testFuzzyMatching().catch(console.error);