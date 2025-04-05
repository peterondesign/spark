import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { getPexelsFallbackUrl } from '@/app/utils/imageService';
import styles from './blog.module.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BlogClient from '../components/BlogClient';
import Link from "next/link";


const query = groq`*[_type == "blog"] {
  title,
  slug,
  publishedAt,
  extract
}`;

export default async function BlogPage() {
  const posts = await client.fetch(query);

  // Pre-fetch images on the server
  const postsWithImages = await Promise.all(
    posts.map(async (post: any) => ({
      ...post,
      imageUrl: await getPexelsFallbackUrl(post.title, 400, 300)
    }))
  );

  return (
    <>
      <Header />
      <div className={styles.blogContainer}>
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-rose-500">Home</Link>
            </li>
            <li>
              <span className="text-gray-500 mx-1">/</span>
            </li>
            <li className="text-rose-500">Blog</li>
          </ol>
        </nav>
        <h1 className={styles.blogTitle}>Blog Posts</h1>
        <BlogClient posts={postsWithImages} />
      </div>
      <Footer />
    </>
  );
}