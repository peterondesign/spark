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
  const sortedPosts = [...posts].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <div className={styles.cardGrid}>
      {sortedPosts.map((post) => (
        <Link href={`/blog/${post.slug.current}`} key={post.slug.current} className={styles.cardTitle}>
          <div className={styles.card}>
            <img src={post.imageUrl} alt={`Image for ${post.title}`} className={styles.cardImage} />
            <div className={styles.cardContent}>
              {post.title}
              <p className={styles.cardExtract}>{post.extract}</p>
              <p className={styles.cardDate}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}