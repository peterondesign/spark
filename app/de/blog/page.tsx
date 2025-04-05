import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { getPexelsFallbackUrl } from '@/app/utils/imageService';
import styles from './blog.module.css';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogClient from '../../components/BlogClient';

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
        <h1 className={styles.blogTitle}>Explore Our Latest Blog Posts</h1>
        <BlogClient posts={postsWithImages} />
      </div>
      <Footer />
    </>
  );
}