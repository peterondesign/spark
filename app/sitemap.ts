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
 * Check if a URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    // Check if URL is properly formatted
    const parsedUrl = new URL(url);
    // Make sure it has http or https protocol
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

/**
 * Creates a slug-safe string from any input
 */
function sanitizeSlug(slug: string): string {
  if (!slug) return '';
  return slug.trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with a single one
}

/**
 * This function generates a dynamic sitemap for the site
 * It includes all static routes and dynamic routes like date ideas and blog posts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc';
  // Ensure baseUrl has proper format with no trailing slash
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
  
  console.log("Generating sitemap...");
  
  // Get all date ideas for dynamic routes
  const dateIdeas = await safeSupabaseQuery<DateIdea>(
    async () => await supabase
      .from('date_ideas')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false }),
    []
  );
  
  // Filter out entries with empty or invalid slugs
  const validDateIdeas = dateIdeas.filter(idea => idea.slug && idea.slug.trim() !== '');
  
  console.log(`Found ${validDateIdeas.length} valid date ideas for sitemap (filtered from ${dateIdeas.length} total)`);
  
  // Get all blog posts for dynamic routes
  const blogPosts = await safeSupabaseQuery<BlogPost>(
    async () => await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })
      .eq('published', true),
    []
  );
  
  // Filter out entries with empty or invalid slugs
  const validBlogPosts = blogPosts.filter(post => post.slug && post.slug.trim() !== '');
  
  console.log(`Found ${validBlogPosts.length} valid blog posts for sitemap (filtered from ${blogPosts.length} total)`);
  
  // Get all city locations for dynamic routes
  const locations = await safeSupabaseQuery<Location>(
    async () => await supabase
      .from('cities')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false }),
    []
  );
  
  // Filter out entries with empty or invalid slugs
  const validLocations = locations.filter(location => location.slug && location.slug.trim() !== '');
  
  console.log(`Found ${validLocations.length} valid city locations for sitemap (filtered from ${locations.length} total)`);
  
  // Static routes with their lastModified dates
  const staticRoutes = [
    {
      url: `${normalizedBaseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 1.0,
    },
    {
      url: `${normalizedBaseUrl}/date-idea-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${normalizedBaseUrl}/date-ideas-near-me`,
      lastModified: new Date(),
      changeFrequency: 'daily' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${normalizedBaseUrl}/spin-the-wheel`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${normalizedBaseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${normalizedBaseUrl}/alphabet-dating`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${normalizedBaseUrl}/date-night-box-subscription`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${normalizedBaseUrl}/calendar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.6,
    },
    {
      url: `${normalizedBaseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as ChangeFrequency,
      priority: 0.5,
    },
    {
      url: `${normalizedBaseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly' as ChangeFrequency,
      priority: 0.3,
    },
    // German routes
    {
      url: `${normalizedBaseUrl}/de`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.8,
    },
    {
      url: `${normalizedBaseUrl}/de/date-idea-generator`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${normalizedBaseUrl}/de/date-ideas-near-me`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
    {
      url: `${normalizedBaseUrl}/de/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as ChangeFrequency,
      priority: 0.7,
    },
  ];

  // Generate date idea route entries with proper slug sanitization
  const dateIdeaRoutes = validDateIdeas.map((dateIdea) => ({
    url: `${normalizedBaseUrl}/date-idea/${sanitizeSlug(dateIdea.slug)}`,
    lastModified: new Date(dateIdea.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.7,
  }));

  // Generate blog post route entries with proper slug sanitization
  const blogPostRoutes = validBlogPosts.map((post) => ({
    url: `${normalizedBaseUrl}/blog/${sanitizeSlug(post.slug)}`,
    lastModified: new Date(post.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.6,
  }));

  // Generate location route entries with proper slug sanitization
  const locationRoutes = validLocations.map((location) => ({
    url: `${normalizedBaseUrl}/date-ideas-near-me/${sanitizeSlug(location.slug)}`,
    lastModified: new Date(location.updated_at || Date.now()),
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: 0.7,
  }));

  // Combine all routes and ensure URLs are valid
  let allRoutes = [
    ...staticRoutes,
    ...dateIdeaRoutes,
    ...blogPostRoutes,
    ...locationRoutes,
  ];
  
  // Remove any duplicate URLs
  const uniqueUrls = new Set();
  allRoutes = allRoutes.filter(route => {
    if (uniqueUrls.has(route.url)) {
      return false;
    }
    uniqueUrls.add(route.url);
    return isValidUrl(route.url);
  });
  
  console.log(`Generating sitemap with ${allRoutes.length} total valid URLs`);
  console.log(`- Static routes: ${staticRoutes.length}`);
  console.log(`- Date idea routes: ${dateIdeaRoutes.length}`);
  console.log(`- Blog post routes: ${blogPostRoutes.length}`);
  console.log(`- Location routes: ${locationRoutes.length}`);
  
  return allRoutes;
}