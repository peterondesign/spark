// Debug script to identify why some images show placeholders
import fetch from 'node-fetch';

const problematicIdeas = [
  'Amphibious Tour',
  'Parasailing', 
  'Whiskey and Cigar Pairing',
  'Rooftop Dinner and Drinks',
  'Breakfast in Bed',
  'Sake Tasting',
  'Sushi Making Class'
];

async function debugImageLookup(title) {
  console.log(`\n🔍 Debugging: "${title}"`);
  
  try {
    const response = await fetch('http://localhost:3000/api/lookup-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: title,
        category: 'Food & Drink', // Default category
        diversity: 'multicultural couple'
      })
    });
    
    const result = await response.json();
    
    if (result.success && result.imageUrl) {
      console.log(`✅ Found image: ${result.imageUrl}`);
    } else {
      console.log(`❌ No image found for: "${title}"`);
      console.log(`   Cache key tried: ${result.cacheKey || 'unknown'}`);
      
      // Check if there's a similar image in storage
      const similarResponse = await fetch('http://localhost:3000/api/lookup-image', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title.split(' ').slice(0, 2).join(' '), // Try first 2 words
          category: 'Food & Drink',
          diversity: 'diverse couple'
        })
      });
      
      const similarResult = await similarResponse.json();
      if (similarResult.success) {
        console.log(`   💡 Similar image exists: ${similarResult.imageUrl}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error debugging "${title}":`, error.message);
  }
}

async function main() {
  console.log('🔧 Debugging missing images...\n');
  
  for (const idea of problematicIdeas) {
    await debugImageLookup(idea);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
}

main().catch(console.error);