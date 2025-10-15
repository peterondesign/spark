#!/usr/bin/env node

/**
 * Test script to generate images for all current date ideas
 * This will populate your Supabase bucket with diverse couple images
 */

import dotenv from 'dotenv';
dotenv.config();

async function generateAllCurrentImages() {
  console.log('🎨 Starting generation for all current date ideas...');
  
  try {
    const response = await fetch('http://localhost:3000/api/generate-all-images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode: 'missing', // Only generate for date ideas that don't have images yet
        forceRegenerate: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      const results = data.results;
      console.log('\n🎉 Generation completed successfully!');
      console.log(`📊 Results:`);
      console.log(`   Total processed: ${results.total}`);
      console.log(`   Generated: ${results.generated}`);
      console.log(`   Already cached: ${results.cached}`);
      console.log(`   Errors: ${results.errors}`);
      
      if (results.generated > 0) {
        console.log('\n✅ New images generated:');
        results.details
          .filter(d => d.status === 'generated')
          .slice(0, 5)
          .forEach(detail => {
            console.log(`   • ${detail.title} (${detail.diversityPrompt})`);
          });
        
        if (results.generated > 5) {
          console.log(`   ... and ${results.generated - 5} more`);
        }
      }
      
      if (results.errors > 0) {
        console.log('\n❌ Errors occurred:');
        results.details
          .filter(d => d.status === 'error')
          .slice(0, 3)
          .forEach(detail => {
            console.log(`   • ${detail.title}: ${detail.error || 'Unknown error'}`);
          });
      }
      
      console.log('\n🔗 Check your Supabase bucket:');
      console.log('   https://supabase.com/dashboard/project/ljixbbwscwfdqygjmljq/storage/buckets/generated-images');
      
    } else {
      throw new Error(data.message || 'Generation failed');
    }
    
  } catch (error) {
    console.error('💥 Generation failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Make sure your Next.js server is running:');
      console.log('   npm run dev');
    }
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/generate-all-images');
    return response.status !== 404; // Even 405 Method Not Allowed means server is running
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('📝 Please start your Next.js server first:');
    console.log('   npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running');
  await generateAllCurrentImages();
}

main();