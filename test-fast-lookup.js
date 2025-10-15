#!/usr/bin/env node

/**
 * Test the new fast lookup API
 */

async function testFastLookup() {
  const testKeyword = "Kite Flying at a Park Outdoor diverse couple";
  
  console.log(`🔍 Testing fast lookup for: "${testKeyword}"`);
  
  try {
    const response = await fetch('http://localhost:3000/api/get-cached-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: testKeyword,
        width: 400,
        height: 300
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Success: ${data.imageUrl}`);
      console.log(`Cache key: ${data.cacheKey}`);
    } else {
      console.log(`❌ Failed: ${data.message}`);
      console.log(`Cache key: ${data.cacheKey}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFastLookup();