"use client";

import styles from './blog.module.css';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPosts } from '../../lib/sanity';
import Head from 'next/head';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  mainImage?: { asset: { url: string } }; // Updated to match Sanity's image structure
  categories?: string[];
  author?: { name: string };
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const allPosts = await getPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, []);

  // Schema markup for search engines
  const blogListingSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "headline": "Spark Blog - Relationship Tips and Date Ideas",
    "description": "Discover our latest articles on date ideas, relationship advice, and tips for couples.",
    "url": typeof window !== 'undefined' ? window.location.href : '',
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.excerpt,
          "author": {
            "@type": "Person",
            "name": post.author?.name || "Spark Team"
          },
          "datePublished": post.publishedAt,
          "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/blog/${post.slug.current}`,
          "image": post.mainImage?.asset?.url || "",
          "publisher": {
            "@type": "Organization",
            "name": "Spark",
            "logo": {
              "@type": "ImageObject",
              "url": `${typeof window !== 'undefined' ? window.location.origin : ''}/dateideas.png`
            }
          }
        }
      }))
    }
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(blogListingSchema)}
        </script>
      </Head>
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[20vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-rose-900/90 mix-blend-multiply" />
        <div className="absolute inset-0">
          {posts[0]?.mainImage?.asset?.url && (
            <img 
              src={posts[0].mainImage.asset.url}
              alt="Featured post"
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight">
            Discover Date Ideas<br/>
            <span className="font-medium">and Stories</span>
          </h1>
        </div>
      </section>

      <main className="container mx-auto px-4 py-16">
        {/* Featured Section */}
        {posts.length > 0 && (
          <section className="mb-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <Link href={`/blog/${posts[0].slug.current}`} className="group">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-6">
                  {posts[0].mainImage?.asset?.url && (
                    <img 
                      src={posts[0].mainImage.asset.url}
                      alt={posts[0].title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {posts[0].categories?.map((category, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <h2 className="text-3xl font-medium mb-3 group-hover:text-purple-600 transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {posts[0].excerpt}
                </p>
              </Link>

              <div className="space-y-8">
                {posts.slice(1, 4).map((post) => (
                  <Link href={`/blog/${post.slug.current}`} key={post._id} className="group flex gap-6">
                    {post.mainImage?.asset?.url && (
                      <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden">
                        <img 
                          src={post.mainImage.asset.url}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {post.categories?.map((category, idx) => (
                          <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-medium mb-2 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Grid Section */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {posts.slice(4).map((post) => (
              <Link href={`/blog/${post.slug.current}`} key={post._id} className="group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden mb-4">
                  {post.mainImage?.asset?.url && (
                    <img 
                      src={post.mainImage.asset.url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories?.map((category, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <h3 className="text-xl font-medium mb-2 group-hover:text-purple-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 line-clamp-3">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mt-24 bg-gradient-to-br from-purple-50 to-rose-50 rounded-3xl p-12 md:p-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-medium mb-4">Stay Inspired</h2>
            <p className="text-gray-600 mb-6">Subscribe to receive the latest date night ideas, gift idea suggestions and relationship tips delivered to your inbox.</p>
            <iframe
              src="https://embeds.beehiiv.com/724c50db-5cf6-4dc9-a783-2b7c0fd5eaed?slim=true"
              data-test-id="beehiiv-embed"
              height="52"
              frameBorder="0"
              scrolling="no"
              style={{ margin: 0, borderRadius: 0, backgroundColor: 'transparent', width: '100%' }}
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}