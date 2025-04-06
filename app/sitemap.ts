import { MetadataRoute } from 'next'
import { supabase } from "@/utils/supabaseClient"

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never'

// Define types for our database entities
interface DateIdea {
  slug: string;
  updated_at: string;
}

interface BlogPost {
  slug: string;
  updated_at: string;
}

interface Location {
  slug: string;
  updated_at: string;
}

/**
 * Helper function to safely execute Supabase queries with a timeout
 */
async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T[] | null }>,
  fallback: T[] = [],
  timeoutMs: number = 10000
): Promise<T[]> {
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<{ data: null }>((_, reject) => {
      setTimeout(() => reject(new Error('Supabase query timeout')), timeoutMs);
    });

    // Race the query against the timeout
    const result = await Promise.race([
      queryFn(),
      timeoutPromise
    ]) as { data: T[] | null };

    // Return the data or fallback if null
    return result.data || fallback;
  } catch (error) {
    console.error(`Supabase query error:`, error);
    return fallback;
  }
}

/**
 * This function generates a dynamic sitemap for the site
 * It includes all static routes and dynamic routes like date ideas and blog posts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc'
  
  console.log("Generating sitemap...");
  
  // Get all date ideas for dynamic routes
  const dateIdeas = await safeSupabaseQuery<DateIdea>(
    async () => await supabase
      .from('date_ideas')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false }),
    []
  );
  
  console.log(`Found ${dateIdeas?.length || 0} date ideas for sitemap`);
  
  // Get all blog posts for dynamic routes
  const blogPosts = await safeSupabaseQuery<BlogPost>(
    async () => await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .eq('published', true),
    []
  );
  
  console.log(`Found ${blogPosts?.length || 0} blog posts for sitemap`);
  
  // Get all city locations for dynamic routes
  const locations = await safeSupabaseQuery<Location>(
    async () => await supabase
      .from('cities')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false }),
    []
  );
  
  console.log(`Found ${locations?.length || 0} city locations for sitemap`);
  
  // Static routes with their lastModified dates
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/date-idea-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/date-ideas-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/spin-the-wheel`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/alphabet-dating`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/date-night-box-subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as ChangeFrequency,
      priority: 0.3,
    },
    // German routes
    {
      url: `${baseUrl}/de`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/de/date-idea-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/de/date-ideas-near-me`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/de/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
  ];

  // Generate date idea route entries
  const dateIdeaRoutes = dateIdeas.map((dateIdea) => ({
    url: `${baseUrl}/date-idea/${dateIdea.slug}`,
    lastModified: new Date(dateIdea.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.7,
  }));

  // Generate blog post route entries
  const blogPostRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.6,
  }));

  // Generate location route entries
  const locationRoutes = locations.map((location) => ({
    url: `${baseUrl}/date-ideas-near-me/${location.slug}`,
    lastModified: new Date(location.updated_at || Date.now()),
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: 0.7,
  }));

  // Log the number of routes being generated
  const allRoutes = [
    ...staticRoutes,
    ...dateIdeaRoutes,
    ...blogPostRoutes,
    ...locationRoutes,
  ];
  
  console.log(`Generating sitemap with ${allRoutes.length} total URLs`);
  console.log(`- Static routes: ${staticRoutes.length}`);
  console.log(`- Date idea routes: ${dateIdeaRoutes.length}`);
  console.log(`- Blog post routes: ${blogPostRoutes.length}`);
  console.log(`- Location routes: ${locationRoutes.length}`);
  
  return allRoutes;
}