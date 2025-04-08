import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';
import { supabase } from '@/utils/supabaseClient';

export const dynamic = 'force-dynamic'; // No caching for this route

interface SanityPost {
  slug: {
    current: string;
  };
}

interface DateIdea {
  slug: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  try {
    if (type === 'dateIdeas') {
      // Fetch date idea slugs from Supabase
      const { data: dateIdeas, error } = await supabase
        .from('date_ideas')
        .select('slug')
        .not('slug', 'is', null);

      if (error) {
        console.error('Error fetching date ideas:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Extract slugs from the data
      const slugs = dateIdeas.map((idea: DateIdea) => idea.slug);
      return NextResponse.json(slugs);
    } 
    else if (type === 'blog') {
      // Fetch blog post slugs from Sanity
      const query = `*[_type == "post"] { slug { current } }`;
      const blogPosts = await client.fetch<SanityPost[]>(query);
      
      // Extract slugs from the data
      const slugs = blogPosts.map((post: SanityPost) => post.slug.current);
      return NextResponse.json(slugs);
    } 
    else {
      return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (err) {
    console.error('Error fetching slugs:', err);
    return NextResponse.json(
      { error: 'Failed to fetch slugs' },
      { status: 500 }
    );
  }
}