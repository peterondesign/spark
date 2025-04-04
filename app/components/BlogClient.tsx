import React from 'react';
import Link from 'next/link';
import styles from '../blog/blog.module.css';

interface BlogPost {
  slug: { current: string };
  title: string;
  extract: string;
  publishedAt: string;
  imageUrl: string;
}

interface BlogClientProps {
  posts: BlogPost[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  return (
    <div className={styles.cardGrid}>
      {posts.map((post) => (
        <div key={post.slug.current} className={styles.card}>
          <img src={post.imageUrl} alt={`Image for ${post.title}`} className={styles.cardImage} />
          <div className={styles.cardContent}>
            <Link href={`/blog/${post.slug.current}`} className={styles.cardTitle}>
              {post.title}
            </Link>
            <p className={styles.cardExtract}>{post.extract}</p>
            <p className={styles.cardDate}>
              Published on: {new Date(post.publishedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}