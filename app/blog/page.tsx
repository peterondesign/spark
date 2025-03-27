"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPosts } from '../../lib/sanity';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  mainImage?: { asset: { url: string } }; // Updated to match Sanity's image structure
  categories?: string[];
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

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Date Ideas Blog</h1>

        {/* Add a link to the Date Ideas Near Me page */}
        <div className="text-center mb-8">
          <Link href="/date-ideas-near-me" className="text-purple-600 hover:underline text-lg font-medium">
            Explore Date Ideas Near Me
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <section className="col-span-1 md:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-xl text-gray-600">No blog posts found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {posts.map((post) => (
                  <Link href={`/blog/${post.slug.current}`} key={post._id}>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                      {post.mainImage?.asset?.url && (
                        <div className="h-48 overflow-hidden">
                          <img 
                            src={post.mainImage.asset.url} 
                            alt={post.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-grow">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories?.map((category, idx) => (
                            <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              {category}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">{post.title}</h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}