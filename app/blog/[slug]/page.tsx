"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getPost, getPosts } from '../../../lib/sanity';
import { PortableText } from '@portabletext/react';
import Head from 'next/head';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  mainImage?: { asset: { url: string } }; // Ensure mainImage is an object with a URL
  body?: any;
  categories?: string[];
  author?: {
    name: string;
    image?: { asset: { url: string } };
  };
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : params.slug?.[0] || '';

  const [post, setPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        if (slug) {
          const postData = await getPost(slug);
          setPost(postData);
        }
        const allPosts = await getPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading blog post:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [slug]);

  // Schema markup for search engines
  const blogPostSchema = post ? {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.mainImage?.asset?.url || "",
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
      "@type": "Person",
      "name": post.author?.name || "Spark Team",
      "image": post.author?.image?.asset?.url || ""
    },
    "publisher": {
      "@type": "Organization",
      "name": "Spark",
      "logo": {
        "@type": "ImageObject",
        "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/dateideas.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": typeof window !== 'undefined' ? window.location.href : ''
    },
    "keywords": post.categories?.join(", ") || "date ideas, relationships, couples"
  } : null;

  // Loading state
  if (loading) {
    return (
      <>
        <Header />
        <div className="animate-pulse">
          <div className="h-[60vh] bg-gray-200" />
          <div className="container mx-auto px-4 -mt-32 relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 w-32 bg-gray-300 mb-4 rounded" />
              <div className="h-12 w-3/4 bg-gray-300 mb-6 rounded" />
              <div className="h-6 w-48 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Not found state
  if (!post) {
    return (
      <>
        <Header />
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-lg mx-auto px-4">
            <h1 className="text-4xl font-light mb-6">
              Post Not Found
              <span className="block font-medium mt-2">We couldn't find what you're looking for</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
            >
              Return to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {blogPostSchema && (
        <Head>
          <script type="application/ld+json">
            {JSON.stringify(blogPostSchema)}
          </script>
        </Head>
      )}
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
        {post.mainImage?.asset?.url && (
          <img 
            src={post.mainImage.asset.url} 
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.categories?.map((category, idx) => (
                <span key={idx} className="bg-white/10 text-white backdrop-blur-sm text-sm px-4 py-1 rounded-full">
                  {category}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl font-light">
              {post.excerpt}
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
            {/* Author Info */}
            <div className="flex items-center border-b border-gray-100 pb-8 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mr-4">
                {post.author?.image?.asset?.url ? (
                  <img 
                    src={post.author.image.asset.url} 
                    alt={post.author.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple-100 flex items-center justify-center">
                    <span className="text-2xl text-purple-600 font-medium">
                      {post.author?.name?.[0] || 'A'}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium text-lg text-gray-900">{post.author?.name || 'Anonymous'}</p>
                <p className="text-gray-500">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            
            {/* Article Content */}
            <div className="prose prose-lg prose-purple max-w-none">
              {post.body && <PortableText value={post.body} />}
            </div>
          </div>

          {/* Related Posts */}
          <section className="mb-24">
            <h2 className="text-2xl font-medium mb-8">More Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {posts.slice(0, 3).map((relatedPost) => (
                <Link href={`/blog/${relatedPost.slug.current}`} key={relatedPost._id} className="group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                    {relatedPost.mainImage?.asset?.url && (
                      <img 
                        src={relatedPost.mainImage.asset.url}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {relatedPost.categories?.map((category, idx) => (
                      <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {category}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-xl font-medium mb-2 group-hover:text-purple-600 transition-colors">
                    {relatedPost.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-br from-purple-50 to-rose-50">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium mb-4">Stay Inspired</h2>
            <p className="text-gray-600 mb-8">
              Get more date ideas and relationship insights delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}