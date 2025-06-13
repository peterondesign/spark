#!/usr/bin/env node

/**
 * Test script for Smart Venue Agent
 * Tests the autonomous Google search and venue extraction functionality
 */

const testQueries = [
  'Arcade night in Lisbon',
  'Rooftop restaurants Paris',
  'Jazz clubs New York',
  'Bowling alleys London',
  'Escape rooms Berlin'
];

async function testSmartVenueAgent() {
  console.log('🤖 Testing Smart Venue Agent\n');
  
  for (const query of testQueries) {
    console.log(`\n📍 Testing query: "${query}"`);
    console.log('=' .repeat(50));
    
    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/smart-venue-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`❌ Error: ${response.status} - ${error}`);
        continue;
      }
      
      const data = await response.json();
      
      console.log(`⚡ Response time: ${responseTime}ms`);
      console.log(`🎯 Results found: ${data.searchMetadata.resultsFound}`);
      console.log(`💾 Cache hit: ${data.agentMetadata.cacheHit ? 'Yes' : 'No'}`);
      console.log(`🔍 Search method: ${data.agentMetadata.searchMethod}`);
      console.log(`🛡️ Filtering enabled: ${data.agentMetadata.filteringEnabled ? 'Yes' : 'No'}`);
      console.log(`📊 Response type: ${data.searchMetadata.responseType}`);
      
      console.log('\n📍 Venues found:');
      
      data.venues.forEach((venue, index) => {
        console.log(`\n${index + 1}. ${venue.title}`);
        console.log(`   URL: ${venue.url}`);
        console.log(`   Location: ${venue.location}`);
        if (venue.rating) console.log(`   Rating: ${venue.rating}⭐`);
        if (venue.phone) console.log(`   Phone: ${venue.phone}`);
        if (venue.hours) console.log(`   Hours: ${venue.hours}`);
        console.log(`   Confidence: ${venue.confidence} (${venue.confidence >= 0.8 ? 'High' : venue.confidence >= 0.6 ? 'Medium' : 'Low'})`);
        console.log(`   Source: ${venue.source}`);
      });
      
      // Test second call for caching
      console.log('\n🔄 Testing cache (second call)...');
      const cacheStartTime = Date.now();
      
      const cacheResponse = await fetch('http://localhost:3000/api/smart-venue-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const cacheEndTime = Date.now();
      const cacheResponseTime = cacheEndTime - cacheStartTime;
      
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        console.log(`⚡ Cached response time: ${cacheResponseTime}ms`);
        console.log(`💾 Cache hit: ${cacheData.agentMetadata.cacheHit ? 'Yes ✅' : 'No ❌'}`);
        
        const speedup = Math.round(responseTime / cacheResponseTime);
        if (cacheData.agentMetadata.cacheHit) {
          console.log(`🚀 Cache speedup: ${speedup}x faster`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Test failed: ${error.message}`);
    }
    
    console.log('\n' + '─'.repeat(80));
  }
}

// Test agent status endpoint
async function testAgentStatus() {
  console.log('\n🔍 Testing agent status endpoint...');
  
  try {
    const response = await fetch('http://localhost:3000/api/smart-venue-agent');
    const data = await response.json();
    
    console.log('📊 Agent Status:');
    console.log(`   Status: ${data.status}`);
    console.log(`   Cache size: ${data.cacheStats.size}/${data.cacheStats.maxSize}`);
    console.log(`   Cache duration: ${data.cacheStats.cacheDuration}`);
    console.log(`   Google Search: ${data.features.googleSearch ? 'Enabled ✅' : 'Disabled ❌'}`);
    console.log(`   Venue extraction: ${data.features.venueExtraction ? 'Enabled ✅' : 'Disabled ❌'}`);
    console.log(`   Smart filtering: ${data.features.smartFiltering ? 'Enabled ✅' : 'Disabled ❌'}`);
    console.log(`   Caching: ${data.features.caching ? 'Enabled ✅' : 'Disabled ❌'}`);
    
  } catch (error) {
    console.log(`❌ Status check failed: ${error.message}`);
  }
}

// Performance benchmark
async function performanceBenchmark() {
  console.log('\n🏃‍♂️ Performance Benchmark');
  console.log('=' .repeat(50));
  
  const query = 'Arcade night in Lisbon';
  const runs = 3;
  const times = [];
  
  for (let i = 0; i < runs; i++) {
    console.log(`\nRun ${i + 1}/${runs}...`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('http://localhost:3000/api/smart-venue-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      
      const data = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      times.push(responseTime);
      console.log(`   Response time: ${responseTime}ms (Cache: ${data.agentMetadata.cacheHit ? 'Hit' : 'Miss'})`);
      
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  }
  
  if (times.length > 0) {
    const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    console.log('\n📊 Benchmark Results:');
    console.log(`   Average: ${avgTime}ms`);
    console.log(`   Min: ${minTime}ms`);
    console.log(`   Max: ${maxTime}ms`);
    console.log(`   Cache speedup: ~${Math.round(maxTime / minTime)}x`);
  }
}

// Main test execution
async function main() {
  console.log('🚀 Smart Venue Agent Test Suite');
  console.log('================================\n');
  
  // Check if server is running
  try {
    const response = await fetch('http://localhost:3000/api/smart-venue-agent');
    if (!response.ok) throw new Error('Server not responding');
  } catch (error) {
    console.log('❌ Error: Development server not running on localhost:3000');
    console.log('Please run: npm run dev');
    process.exit(1);
  }
  
  await testAgentStatus();
  await testSmartVenueAgent();
  await performanceBenchmark();
  
  console.log('\n✅ Test suite completed!');
  console.log('\n🌐 Visit http://localhost:3000/smart-venue-agent to see the UI');
}

main().catch(console.error);
