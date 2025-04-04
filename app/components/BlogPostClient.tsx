import React from 'react';
import styles from '../blog/blog.module.css';

interface BlogPostClientProps {
  post: {
    title: string;
    publishedAt: string;
    extract?: string;
    content?: any[];
  };
  imageUrl: string;
}

export default function BlogPostClient({ post, imageUrl }: BlogPostClientProps) {
  return (
    <div className={styles.blogPostContainer}>
      <div className={styles.heroImage}>
        <img src={imageUrl} alt={post.title} className={styles.postHeaderImage} />
      </div>
      
      <div className={styles.blogPostContent}>
        <h1 className={styles.postTitle}>{post.title}</h1>
        <p className={styles.postMeta}>
          Published on: {new Date(post.publishedAt).toLocaleDateString()}
        </p>
        
        {post.extract && (
          <div className={styles.postExtract}>
            {post.extract}
          </div>
        )}
        
        <div className={styles.postBody}>
          {post.content && post.content.map((block: any, index: number) => (
            <p key={index}>{block.children && block.children[0].text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}