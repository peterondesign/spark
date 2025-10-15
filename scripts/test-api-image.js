/**
 * Test API endpoint to generate an AI image
 * This will test the full pipeline including environment variables
 */

async function testImageAPI() {
  console.log('🧪 Testing AI image generation via API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: 'romantic dinner candles wine',
        width: 512,
        height: 512
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      console.log('✅ Image generated successfully!');
      console.log('🔗 Image URL:', data.imageUrl);
      console.log('📁 Check your Supabase bucket now!');
      console.log('📊 Response data:', data);
    } else {
      console.log('❌ Image generation failed');
      console.log('Response:', data);
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testImageAPI();