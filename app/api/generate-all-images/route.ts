import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../utils/supabaseClient';
import ReplicateImageService from '../../utils/newImageService';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
  timeOfDay?: string;
  mood?: string | object;
  priceLevel?: string;
  description?: string;
  location?: string | object;
  longDescription?: string;
  trending?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { mode = 'missing', forceRegenerate = false } = await request.json();

    console.log(`🎨 Starting image generation (mode: ${mode})`);

    // Fetch all date ideas from Supabase
    const { data: dateIdeas, error } = await supabase
      .from('date_ideas')
      .select('*');

    if (error) {
      throw new Error(`Failed to fetch date ideas: ${error.message}`);
    }

    if (!dateIdeas || dateIdeas.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No date ideas found'
      }, { status: 404 });
    }

    const imageService = ReplicateImageService.getInstance();
    const results = {
      total: dateIdeas.length,
      processed: 0,
      generated: 0,
      cached: 0,
      errors: 0,
      details: [] as any[]
    };

    // Diversity prompts for couple representation
    const diversityPrompts = [
      'White couple',
      'diverse couple',
      'interracial couple',
      'multicultural couple',
      'Asian couple',
      'Black couple',
      'Latino couple',
      'Caucasian couple',
      'mixed race couple',
      'LGBTQ+ couple'
    ];

    // Process each date idea
    for (const idea of dateIdeas) {
      try {
        results.processed++;
        console.log(`Processing ${results.processed}/${results.total}: ${idea.title}`);

        // Create cache key (same logic as in ReplicateImageService)
        const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
        const keyword = `${idea.title} ${idea.category} ${randomDiversityPrompt}`;
        const width = 400;
        const height = 300;
        const cacheKey = `${keyword.toLowerCase().replace(/\s+/g, '_')}_${width}x${height}`;

        // Check if image already exists (unless force regenerate)
        if (!forceRegenerate && mode === 'missing') {
          const { data: existingImage } = await supabase
            .from('generated_images')
            .select('image_url')
            .eq('keyword', cacheKey)
            .single();

          if (existingImage) {
            console.log(`✅ Already exists: ${idea.title}`);
            results.cached++;
            results.details.push({
              id: idea.id,
              title: idea.title,
              status: 'cached',
              imageUrl: existingImage.image_url,
              keyword: cacheKey
            });
            continue;
          }
        }

        // Generate new image
        console.log(`🎨 Generating image for: ${keyword}`);
        const imageUrl = await imageService.getImage(keyword, width, height);

        if (imageUrl) {
          console.log(`✅ Generated successfully: ${idea.title}`);
          results.generated++;
          results.details.push({
            id: idea.id,
            title: idea.title,
            status: 'generated',
            imageUrl,
            keyword: cacheKey,
            diversityPrompt: randomDiversityPrompt
          });
        } else {
          console.log(`❌ Failed to generate: ${idea.title}`);
          results.errors++;
          results.details.push({
            id: idea.id,
            title: idea.title,
            status: 'error',
            keyword: cacheKey
          });
        }

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error processing ${idea.title}:`, error);
        results.errors++;
        results.details.push({
          id: idea.id,
          title: idea.title,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    console.log(`🎉 Image generation complete! Generated: ${results.generated}, Cached: ${results.cached}, Errors: ${results.errors}`);

    return NextResponse.json({
      success: true,
      message: 'Image generation completed',
      results
    });

  } catch (error) {
    console.error('Image generation failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Image generation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint to check generation status
export async function GET() {
  try {
    // Get total date ideas
    const { count: totalIdeas } = await supabase
      .from('date_ideas')
      .select('*', { count: 'exact', head: true });

    // Get generated images count
    const { count: generatedImages } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true });

    // Get recent generated images
    const { data: recentImages } = await supabase
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalDateIdeas: totalIdeas || 0,
        generatedImages: generatedImages || 0,
        coverage: totalIdeas ? Math.round(((generatedImages || 0) / totalIdeas) * 100) : 0,
        recentImages: recentImages || []
      }
    });

  } catch (error) {
    console.error('Failed to get generation status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to get status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}