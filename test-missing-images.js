// Test the missing image generation directly  
import fs from 'fs';

// Simulate the cache key generation logic
function getCacheKey(keyword, width, height) {
  const normalized = keyword
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_') 
    .replace(/^_|_$/g, '');
  
  return `${normalized}_${width}x${height}`;
}

const missingImages = [
  'Rooftop Dinner and Drinks Food & Drink multicultural couple',
  'Breakfast in Bed Food & Drink Latino couple', 
  'Sake Tasting Food & Drink Latino couple',
  'Sushi Making Class Food & Drink multicultural couple'
];

async function testMissingImageGeneration() {
  console.log('🧪 Testing missing image cache key generation...\n');
  
  for (const keyword of missingImages) {
    console.log(`\n🔍 Testing: "${keyword}"`);
    
    const cacheKey = getCacheKey(keyword, 400, 300);
    console.log(`   Cache key: ${cacheKey}`);
    
    // Show what the fuzzy match would look for
    const baseKeyword = cacheKey
      .replace(/_400x300$/, '')
      .replace(/_white_couple$/, '')
      .replace(/_diverse_couple$/, '')
      .replace(/_interracial_couple$/, '')
      .replace(/_multicultural_couple$/, '')
      .replace(/_asian_couple$/, '')
      .replace(/_black_couple$/, '')
      .replace(/_latino_couple$/, '')
      .replace(/_caucasian_couple$/, '')
      .replace(/_mixed_race_couple$/, '')
      .replace(/_lgbtq_couple$/, '');
      
    console.log(`   Fuzzy base: ${baseKeyword}%`);
  }
}

testMissingImageGeneration().catch(console.error);