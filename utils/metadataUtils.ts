import type { Metadata } from 'next';

export interface MetadataProps {
  title: string;
  description: string;
  path: string;
  locale?: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}

/**
 * Generate SEO metadata for pages with proper OpenGraph tags and hreflang attributes
 */
export function generateMetadata({
  title,
  description,
  path,
  locale = 'en',
  image = '/dateideas.png',
  publishedTime,
  modifiedTime,
  type = 'website',
  keywords = [],
}: MetadataProps): Metadata {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sparkus.cc';
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${url}${fullPath}`;
  
  // Generate language alternates
  const alternates = {
    canonical: canonicalUrl,
    languages: {
      'en': `${url}${fullPath}`,
      'de': `${url}/de${fullPath}`,
    },
  };

  return {
    title: title,
    description: description,
    keywords: [...keywords],
    metadataBase: new URL(url),
    alternates,
    openGraph: {
      title: title,
      description: description,
      url: canonicalUrl,
      siteName: 'Spark - Date Ideas',
      images: [
        {
          url: image.startsWith('http') ? image : `${url}${image.startsWith('/') ? '' : '/'}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: locale,
      type: type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: ['Spark'],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [image.startsWith('http') ? image : `${url}${image.startsWith('/') ? '' : '/'}${image}`],
    },
  };
}

// Added metadata for the Date Idea Generator page
export const dateIdeaGeneratorMetadata = generateMetadata({
  title: 'Date Idea Generator | Find Your Perfect Date',
  description: 'Generate personalized date ideas based on your preferences, budget, and interests. Discover new and exciting experiences to enjoy with your partner.',
  path: '/date-idea-generator',
  keywords: [
    'date idea generator',
    'couple activity finder',
    'relationship experiences',
    'personalized date suggestions',
    'date night inspiration'
  ],
});

// Added metadata for the Blog page
export const blogPageMetadata = generateMetadata({
  title: 'Dating & Relationship Tips | Spark Blog',
  description: 'Read expert advice on relationships, date ideas, and ways to strengthen your connection. Discover articles on communication, romance, and building a lasting partnership.',
  path: '/blog',
  keywords: [
    'relationship advice',
    'dating tips',
    'couple communication',
    'romantic ideas',
    'relationship blog',
    'dating blog'
  ],
  type: 'website'
});

// Added metadata for the Terms page
export const termsPageMetadata = generateMetadata({
  title: 'Terms of Service & Privacy Policy | Spark',
  description: 'Read our Terms of Service and Privacy Policy. Learn about how we collect, use, and protect your information when using our date ideas platform.',
  path: '/terms',
  keywords: [
    'terms of service',
    'privacy policy',
    'legal information',
    'data protection',
    'user agreement'
  ],
});

// Added a utility function to generate metadata for blog posts dynamically
export async function generateBlogPostMetadata({ params }: { params: { slug: string } }, getPost: Function) {
  const post = await getPost(params.slug);

  if (!post) {
    return generateMetadata({
      title: 'Blog Post Not Found | Spark',
      description: 'The blog post you\'re looking for could not be found.',
      path: `/blog/${params.slug}`
    });
  }

  const metaDescription = post.excerpt
    ? post.excerpt.substring(0, 155) + (post.excerpt.length > 155 ? '...' : '')
    : `Read our article about ${post.title} and discover valuable insights for your relationship.`;

  const publishDate = post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString();

  return generateMetadata({
    title: `${post.title} | Dating Advice`,
    description: metaDescription,
    path: `/blog/${params.slug}`,
    image: post.mainImage?.asset?.url || '/dateideas.png',
    publishedTime: publishDate,
    modifiedTime: post.updatedAt || publishDate,
    type: 'article',
    keywords: [
      ...(post.categories || []),
      'dating advice',
      'relationship tips',
      'couple insights'
    ]
  });
}