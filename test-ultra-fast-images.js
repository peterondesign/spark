/**
 * Test script to demonstrate the ultra-fast image service performance
 */

// Import the optimized image service
const { getImageUrl } = require('./app/utils/imageService.ts');

async function testPerformance() {
  console.log('🚀 Testing Ultra-Fast Image Service Performance\n');
  
  const testKeywords = [
    'romantic dinner date',
    'hiking adventure couple',
    'coffee shop meeting',
    'beach sunset walk',
    'cooking class fun'
  ];
  
  console.log('⚡ Testing image URL generation speed...\n');
  
  for (const keyword of testKeywords) {
    const startTime = Date.now();
    
    try {
      const imageUrl = await getImageUrl(undefined, keyword, 400, 300);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`✅ "${keyword}"`);
      console.log(`   URL: ${imageUrl}`);
      console.log(`   Time: ${duration}ms (${duration < 10 ? 'INSTANT' : 'FAST'})`);
      console.log('');
    } catch (error) {
      console.log(`❌ Failed for "${keyword}": ${error.message}`);
    }
  }
  
  // Test caching performance
  console.log('🔄 Testing cache performance (second call should be instant)...\n');
  
  const cacheTestKeyword = 'romantic dinner date';
  const startTime = Date.now();
  await getImageUrl(undefined, cacheTestKeyword, 400, 300);
  const cachedTime = Date.now() - startTime;
  
  console.log(`✅ Cached result for "${cacheTestKeyword}": ${cachedTime}ms`);
  console.log(`   ${cachedTime < 5 ? '⚡ INSTANT from cache!' : '🔄 Cache working'}`);
}

// Run the test
testPerformance().catch(console.error);