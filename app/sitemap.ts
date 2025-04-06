import type { MetadataRoute } from "next";
import { unstable_noStore } from "next/cache";
import { sanityFetch } from "@/sanity/lib/live";
import { postSlugsQuery, dateIdeaSlugsQuery } from "@/sanity/lib/queries";

type BlogPostSlug = {
  slug: string;
  publishedAt: string;
};

type DateIdeaSlug = {
  slug: string;
  _updatedAt: string;
};

async function getBlogPosts(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await sanityFetch({
      query: postSlugsQuery,
    });
    
    if (!posts || !Array.isArray(posts)) {
      console.error("Blog posts data is not an array:", posts);
      return [];
    }
    
    return posts.map((post: BlogPostSlug) => ({
      url: `https://www.sparkus.cc/blog/${post.slug}`,
      lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for sitemap:", error);
    return [];
  }
}

async function getDateIdeas(): Promise<MetadataRoute.Sitemap> {
  try {
    const dateIdeas = await sanityFetch({
      query: dateIdeaSlugsQuery,
    });
    
    if (!dateIdeas || !Array.isArray(dateIdeas)) {
      console.error("Date ideas data is not an array:", dateIdeas);
      return [];
    }
    
    return dateIdeas.map((idea: DateIdeaSlug) => ({
      url: `https://www.sparkus.cc/date-idea/${idea.slug}`,
      lastModified: idea._updatedAt ? new Date(idea._updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Error fetching date ideas for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Prevent caching issues
  unstable_noStore();

  // Fetch dynamic content
  const [blogPosts, dateIdeas] = await Promise.all([
    getBlogPosts(),
    getDateIdeas(),
  ]);

  // Define all static pages
  const staticUrls = [
    {
      url: "https://www.sparkus.cc/",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: "https://www.sparkus.cc/date-ideas-near-me",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: "https://www.sparkus.cc/date-idea-generator",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: "https://www.sparkus.cc/date-night-box-subscription",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: "https://www.sparkus.cc/spin-the-wheel",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.sparkus.cc/favorites",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.sparkus.cc/calendar",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.sparkus.cc/blog",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    {
      url: "https://www.sparkus.cc/alphabet-dating",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: "https://www.sparkus.cc/preferences",
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: "https://www.sparkus.cc/terms",
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: "https://www.sparkus.cc/de",
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: "https://www.sparkus.cc/de/blog",
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }
  ];

  // Combine all URLs for the sitemap
  return [...staticUrls, ...blogPosts, ...dateIdeas];
}