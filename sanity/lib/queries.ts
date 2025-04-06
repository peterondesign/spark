import { groq } from 'next-sanity';

// Query to get all blog post slugs for sitemap generation
export const postSlugsQuery = groq`*[_type == "blog"] {
  "slug": slug.current,
  publishedAt
}`;

// Query for date ideas slugs if needed
export const dateIdeaSlugsQuery = groq`*[_type == "dateIdeasNearMe"] {
  "slug": slug.current,
  _updatedAt
}`;