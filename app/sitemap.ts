import { MetadataRoute } from 'next'
import { supabase } from "@/utils/supabaseClient"

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'always' | 'hourly' | 'never'

/**
 * This function generates a dynamic sitemap for the site
 * It includes all static routes and dynamic routes like date ideas and blog posts
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc'
  
  // Get all date ideas for dynamic routes
  const { data: dateIdeas } = await supabase
    .from('date_ideas')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
  
  // Get all blog posts for dynamic routes
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
    .eq('published', true)
  
  // Get all city locations for dynamic routes
  const { data: locations } = await supabase
    .from('cities')
    .select('slug, updated_at')
    .order('updated_at', { ascending: false })
  
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
  ]

  // Generate date idea route entries
  const dateIdeaRoutes = dateIdeas?.map((dateIdea) => ({
    url: `${baseUrl}/date-idea/${dateIdea.slug}`,
    lastModified: new Date(dateIdea.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.7,
  })) || []

  // Generate blog post route entries
  const blogPostRoutes = blogPosts?.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || Date.now()),
    changeFrequency: 'monthly' as ChangeFrequency,
    priority: 0.6,
  })) || []

  // Generate location route entries
  const locationRoutes = locations?.map((location) => ({
    url: `${baseUrl}/date-ideas-near-me/${location.slug}`,
    lastModified: new Date(location.updated_at || Date.now()),
    changeFrequency: 'weekly' as ChangeFrequency,
    priority: 0.7,
  })) || []

  // Combine all routes
  return [
    ...staticRoutes,
    ...dateIdeaRoutes,
    ...blogPostRoutes,
    ...locationRoutes,
  ]
}