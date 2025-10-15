#!/usr/bin/env node

/**
 * Debug why some images are showing placeholders
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function debugPlaceholderIssue() {
  console.log('🔍 Debugging placeholder image issue...\n');
  
  // Test the problematic date ideas from the screenshot
  const testIdeas = [
    'Amphibious Tour',
    'Parasailing', 
    'Whiskey and Cigar Pairing',
    'Cooking Class',
    'Hot Pot Dinner',
    'Flea Market Shopping',
    'DIY Photo Shoot'
  ];
  
  const diversityPrompts = [
    'White couple',
    'diverse couple', 
    'interracial couple',
    'multicultural couple',
    'Asian couple',
    'Black couple',
    'Latino couple',
    'Caucasian couple'
  ];
  
  for (const idea of testIdeas) {
    console.log(`\n🎯 Testing: "${idea}"`);
    
    // Test with a random diversity prompt like the UI does
    const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
    const keyword = `${idea} Tour ${randomDiversityPrompt}`; // Adding 'Tour' as category
    
    // Generate cache key like the system does
    const cacheKey = keyword
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') + '_400x300';
    
    console.log(`   Keyword: "${keyword}"`);
    console.log(`   Cache key: "${cacheKey}"`);
    
    // Check exact match
    const { data: exactMatch } = await supabase
      .from('generated_images')
      .select('keyword, image_url')
      .eq('keyword', cacheKey)
      .single();
    
    if (exactMatch) {
      console.log(`   ✅ Exact match found: ${exactMatch.image_url}`);
      continue;
    }
    
    // Check fuzzy match with diversity removal
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
    
    console.log(`   🔍 Base keyword: "${baseKeyword}%"`);
    
    const { data: fuzzyMatches } = await supabase
      .from('generated_images')
      .select('keyword, image_url')
      .ilike('keyword', `${baseKeyword}%`)
      .limit(3);
    
    if (fuzzyMatches && fuzzyMatches.length > 0) {
      console.log(`   ✅ Found ${fuzzyMatches.length} fuzzy matches:`);
      fuzzyMatches.forEach((match, i) => {
        console.log(`      ${i + 1}. ${match.keyword}`);
      });
    } else {
      console.log(`   ❌ No matches found at all!`);
      
      // Let's see what IS in the database for this idea
      const { data: similarResults } = await supabase
        .from('generated_images')
        .select('keyword')
        .ilike('keyword', `%${idea.toLowerCase().replace(/\s+/g, '_')}%`)
        .limit(5);
      
      if (similarResults && similarResults.length > 0) {
        console.log(`   📋 Similar entries in database:`);
        similarResults.forEach((result, i) => {
          console.log(`      ${i + 1}. ${result.keyword}`);
        });
      } else {
        console.log(`   💥 PROBLEM: No entries for "${idea}" found in database!`);
      }
    }
  }
}

debugPlaceholderIssue().catch(console.error);