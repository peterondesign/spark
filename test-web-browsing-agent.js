#!/usr/bin/env node

// Test script for the Web Browsing Agent API
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testWebBrowsingAgent() {
  console.log('🤖 Testing Web Browsing Agent API...\n');

  const testCases = [
    { activity: 'wine tasting', city: 'Napa Valley' },
    { activity: 'hiking', city: 'San Francisco' },
    { activity: 'cooking class', city: 'New York' }
  ];

  for (const testCase of testCases) {
    console.log(`\n📍 Testing: "${testCase.activity}" in ${testCase.city}`);
    console.log('━'.repeat(60));

    try {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3001/api/web-browsing-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase),
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ HTTP ${response.status}: ${errorData}`);
        continue;
      }

      const data = await response.json();
      
      console.log(`✅ Response received in ${responseTime}ms`);
      console.log(`📊 Search Metadata:`);
      console.log(`   Query: ${data.searchMetadata.query}`);
      console.log(`   Results: ${data.searchMetadata.resultsFound}`);
      console.log(`   Sources: ${data.searchMetadata.sources.join(', ')}`);
      
      if (data.activities && data.activities.length > 0) {
        console.log(`\n🎯 Found ${data.activities.length} activities:`);
        
        data.activities.forEach((activity, index) => {
          console.log(`\n   ${index + 1}. ${activity.title}`);
          console.log(`      📍 Location: ${activity.location || 'N/A'}`);
          console.log(`      🕒 DateTime: ${activity.datetime || 'N/A'}`);
          console.log(`      💰 Price: ${activity.price || 'N/A'}`);
          console.log(`      🔗 URL: ${activity.url}`);
          console.log(`      🖼️  Image: ${activity.image}`);
          console.log(`      📝 Description: ${activity.description ? activity.description.substring(0, 100) + '...' : 'N/A'}`);
          console.log(`      🎯 Confidence: ${(activity.confidence * 100).toFixed(1)}%`);
        });
      } else {
        console.log('❌ No activities found');
      }

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n🏁 Web Browsing Agent test completed!');
}

// Check if OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable is not set');
  console.log('Please set your OpenAI API key in the .env.local file:');
  console.log('OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Run the test
testWebBrowsingAgent().catch(console.error);
