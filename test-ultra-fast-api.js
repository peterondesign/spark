#!/usr/bin/env node

// Ultra-fast API performance test
const API_URL = 'http://localhost:3002/api/fast-web-browsing-agent';

const testCases = [
  { activity: 'wine tasting', city: 'Napa Valley' },
  { activity: 'entertainment', city: 'San Francisco' },
  { activity: 'hiking', city: 'Denver' },
  { activity: 'restaurant', city: 'New York' },
  { activity: 'museum', city: 'Washington DC' }
];

async function testUltraFastAPI() {
  console.log('🚀 Testing Ultra-Fast Web Browsing Agent Performance\n');
  
  for (const testCase of testCases) {
    const startTime = Date.now();
    
    try {
      console.log(`⚡ Testing: ${testCase.activity} in ${testCase.city}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase)
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (response.ok) {
        const data = await response.json();
        const activitiesCount = data.activities?.length || 0;
        
        console.log(`✅ Response time: ${responseTime}ms`);
        console.log(`📊 Activities found: ${activitiesCount}`);
        console.log(`🎯 Target: <500ms, Achieved: ${responseTime < 500 ? '✅' : '❌'}`);
        
        if (data.activities?.[0]) {
          console.log(`🏆 First result: ${data.activities[0].title}`);
          console.log(`📍 Location: ${data.activities[0].location}`);
          console.log(`💰 Price: ${data.activities[0].price}`);
        }
      } else {
        console.log(`❌ Failed with status: ${response.status}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }
  
  // Test cache performance
  console.log('\n🔄 Testing Cache Performance (should be <50ms)');
  const cacheStartTime = Date.now();
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCases[0]) // Repeat first test
    });
    
    const cacheEndTime = Date.now();
    const cacheResponseTime = cacheEndTime - cacheStartTime;
    
    console.log(`⚡ Cache response time: ${cacheResponseTime}ms`);
    console.log(`🎯 Cache target: <50ms, Achieved: ${cacheResponseTime < 50 ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error(`❌ Cache test error: ${error.message}`);
  }
  
  console.log('\n🏁 Ultra-Fast API Performance Test Complete!');
}

testUltraFastAPI();
