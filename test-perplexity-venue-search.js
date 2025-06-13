import fetch from 'node-fetch';

async function testPerplexityVenueSearch() {
  console.log('🧪 Testing Perplexity Venue Search API');
  console.log('====================================\n');

  const baseUrl = 'http://localhost:3001';
  
  // Test cases
  const testCases = [
    { dateIdea: 'arcade', city: 'Tokyo' },
    { dateIdea: 'coffee shop', city: 'Seattle' },
    { dateIdea: 'museum', city: 'Paris' },
    { dateIdea: 'rooftop bar', city: 'New York' },
    { dateIdea: 'bowling', city: 'London' }
  ];

  try {
    // Test agent status
    console.log('🔍 Testing agent status...');
    const statusResponse = await fetch(`${baseUrl}/api/perplexity-venue-search`);
    const statusData = await statusResponse.json();
    console.log('📊 Agent Status:');
    console.log(`   Status: ${statusData.status}`);
    console.log(`   API Key configured: ${statusData.apiKeyConfigured ? '✅' : '❌'}`);
    console.log(`   Cache size: ${statusData.cache.size}/${statusData.cache.maxSize}`);
    console.log(`   Version: ${statusData.version}`);
    console.log(`   Capabilities: ${statusData.capabilities.join(', ')}\n`);

    // Test venue searches
    for (const testCase of testCases) {
      console.log(`📍 Testing: "${testCase.dateIdea}" in ${testCase.city}`);
      console.log('='.repeat(50));
      
      const startTime = Date.now();
      
      const response = await fetch(`${baseUrl}/api/perplexity-venue-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      });

      if (!response.ok) {
        console.log(`❌ Error: ${response.status} ${response.statusText}\n`);
        continue;
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      console.log(`⚡ Response time: ${responseTime}ms`);
      console.log(`🎯 Results found: ${data.searchMetadata.resultsFound}`);
      console.log(`💾 Cache hit: ${data.agentMetadata.cacheHit ? 'Yes' : 'No'}`);
      console.log(`🔍 Search method: ${data.agentMetadata.searchMethod}`);
      console.log(`📊 Response type: ${data.searchMetadata.responseType}\n`);

      console.log('📍 Venues found:\n');
      
      data.venues.forEach((venue, index) => {
        console.log(`${index + 1}. ${venue.name}`);
        console.log(`   Address: ${venue.address}`);
        console.log(`   Description: ${venue.description}`);
        if (venue.website) console.log(`   Website: ${venue.website}`);
        if (venue.phone) console.log(`   Phone: ${venue.phone}`);
        if (venue.rating) console.log(`   Rating: ${venue.rating}⭐`);
        if (venue.priceRange) console.log(`   Price: ${venue.priceRange}`);
        if (venue.hours) console.log(`   Hours: ${venue.hours}`);
        console.log(`   Confidence: ${venue.confidence} (${venue.confidence >= 0.8 ? 'High' : venue.confidence >= 0.6 ? 'Medium' : 'Low'})`);
        console.log(`   Category: ${venue.category}\n`);
      });

      // Test cache (second call)
      console.log('🔄 Testing cache (second call)...');
      const cacheStartTime = Date.now();
      const cacheResponse = await fetch(`${baseUrl}/api/perplexity-venue-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      });
      
      if (cacheResponse.ok) {
        const cacheData = await cacheResponse.json();
        const cacheResponseTime = Date.now() - cacheStartTime;
        console.log(`⚡ Cached response time: ${cacheResponseTime}ms`);
        console.log(`💾 Cache hit: ${cacheData.agentMetadata.cacheHit ? 'Yes ✅' : 'No'}`);
        
        if (cacheData.agentMetadata.cacheHit) {
          const speedup = Math.round(responseTime / cacheResponseTime);
          console.log(`🚀 Cache speedup: ${speedup}x faster`);
        }
      }

      console.log('\n' + '─'.repeat(80) + '\n');
    }

    // Performance benchmark
    console.log('🏃‍♂️ Performance Benchmark');
    console.log('='.repeat(50));
    
    const benchmarkQuery = { dateIdea: 'arcade', city: 'Tokyo' };
    const benchmarkRuns = 3;
    const times = [];
    
    for (let i = 1; i <= benchmarkRuns; i++) {
      console.log(`Run ${i}/${benchmarkRuns}...`);
      const start = Date.now();
      
      const response = await fetch(`${baseUrl}/api/perplexity-venue-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(benchmarkQuery),
      });
      
      if (response.ok) {
        const data = await response.json();
        const time = Date.now() - start;
        times.push(time);
        console.log(`   Response time: ${time}ms (Cache: ${data.agentMetadata.cacheHit ? 'Hit' : 'Miss'})`);
      }
      console.log('');
    }

    if (times.length > 0) {
      const avgTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      console.log('📊 Benchmark Results:');
      console.log(`   Average: ${avgTime}ms`);
      console.log(`   Min: ${minTime}ms`);
      console.log(`   Max: ${maxTime}ms`);
      console.log(`   Cache speedup: ~${Math.round(maxTime / minTime)}x\n`);
    }

    console.log('✅ Test suite completed!\n');
    console.log('🌐 Visit http://localhost:3001/perplexity-venue-search to see the UI');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run tests
testPerplexityVenueSearch();
