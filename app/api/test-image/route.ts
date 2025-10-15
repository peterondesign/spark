import { getAIImageUrl } from '../../utils/imageService';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('🧪 Testing AI image generation...');
    
    // Test with a simple romantic date keyword
    const keyword = 'romantic dinner candles wine date night';
    console.log(`🎨 Generating image for: "${keyword}"`);
    
    const imageUrl = await getAIImageUrl(keyword, 512, 512);
    
    if (imageUrl) {
      console.log('✅ Image generated successfully!');
      console.log('🔗 Image URL:', imageUrl);
      
      return NextResponse.json({
        success: true,
        message: 'Image generated successfully!',
        imageUrl,
        keyword,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log('❌ Image generation failed');
      return NextResponse.json({
        success: false,
        message: 'Image generation failed',
        keyword
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}