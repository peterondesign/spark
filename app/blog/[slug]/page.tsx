"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getPost, getPosts } from '../../../lib/sanity';
import { PortableText } from '@portabletext/react';

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

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center py-10">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-xl text-gray-600">The blog post you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <aside className="col-span-1 hidden md:block">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Latest from the Blog</h2>
            <ul className="space-y-4">
              {posts.slice(0, 5).map((post) => (
                <li key={post._id}>
                  <Link href={`/blog/${post.slug.current}`} className="text-purple-600 hover:underline">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <section className="col-span-1 md:col-span-2">
            <article>
              <header className="mb-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.categories?.map((category, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-600 italic mb-4">{post.excerpt}</p>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  {post.author?.image?.asset?.url && (
                    <img 
                      src={post.author.image.asset.url} 
                      alt={post.author.name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="font-medium">{post.author?.name || 'Anonymous'}</p>
                    <p>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </header>
              
              {post.mainImage?.asset?.url && (
                <div className="mb-8">
                  <img 
                    src={post.mainImage.asset.url} 
                    alt={post.title} 
                    className="w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div className="prose prose-lg prose-purple max-w-none">
                {post.body && <PortableText value={post.body} />}
              </div>
            </article>
          </section>
        </div>
      </main>

      {/* Newsletter Call-to-Action */}
      <footer className="bg-gray-100 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">Get the latest date ideas and blog updates straight to your inbox.</p>
          <form className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </footer>
    </>
  );
}