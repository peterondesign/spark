import React from 'react';
import styles from '../blog/blog.module.css';

interface BlogPostClientProps {
  post: {
    title: string;
    publishedAt: string;
    extract?: string;
    content?: any[];
    relatedPosts?: Array<{
      title: string;
      slug: string;
      imageUrl?: string;
    }>;
  };
  imageUrl: string;
}

export default function BlogPostClient({ post, imageUrl }: BlogPostClientProps) {
  const formattedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper function to render different types of content blocks
  const renderContentBlock = (block: any, index: number) => {
    if (!block) return null;

    // Handle HTML content specially
    if (block._type === 'html') {
      return (
        <div 
          key={index} 
          className={styles.htmlBlock}
          dangerouslySetInnerHTML={{ __html: block.code }}
        />
      );
    }

    // Handle different block types
    switch (block._type) {
      case 'block':
        return renderTextBlock(block, index);
      case 'image':
        return (
          <figure key={index} className={styles.imageContainer}>
            <img 
              src={block.asset?.url} 
              alt={block.alt || 'Blog image'} 
              className={styles.contentImage} 
            />
            {block.caption && <figcaption className={styles.imageCaption}>{block.caption}</figcaption>}
          </figure>
        );
      case 'code':
        return (
          <pre key={index} className={styles.codeBlock}>
            <code>{block.code}</code>
          </pre>
        );
      default:
        if (block.children && block.children[0] && block.children[0].text) {
          // Check if the content looks like HTML
          const text = block.children[0].text;
          if (text.trim().startsWith('<') && text.includes('</')) {
            return (
              <div 
                key={index} 
                className={styles.htmlBlock}
                dangerouslySetInnerHTML={{ __html: text }}
              />
            );
          }
        }
        
        console.log('Unknown block type', block._type);
        return null;
    }
  };

  // Helper function to render text blocks with marks (bold, links, etc.)
  const renderTextBlock = (block: any, blockIndex: number) => {
    // Determine element based on style
    const BlockElement = block.style === 'normal' ? 'p' : block.style;

    // If no children or empty block, return null
    if (!block.children || block.children.length === 0) {
      return null;
    }

    // Check if any child contains HTML-like content
    const containsHTML = block.children.some((child: any) => 
      child.text && child.text.trim().startsWith('<') && child.text.includes('</'));
    
    // If it contains HTML, render it as HTML
    if (containsHTML) {
      const htmlContent = block.children.map((child: any) => child.text).join('');
      return (
        <div 
          key={blockIndex} 
          className={`${styles[block.style] || ''} ${styles.htmlBlock}`}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      );
    }

    return (
      <BlockElement key={blockIndex} className={styles[block.style] || ''}>
        {block.children.map((child: any, childIndex: number) => {
          // If plain text with no marks
          if (!child.marks || child.marks.length === 0) {
            return <span key={childIndex}>{child.text}</span>;
          }

          // Handle different mark types (links, bold, etc.)
          return child.marks.reduce((acc: React.ReactNode, mark: string) => {
            // Check if this mark corresponds to a link
            const linkMark = block.markDefs?.find((def: any) => def._key === mark && def._type === 'link');

            if (linkMark) {
              return (
                <a 
                  key={childIndex} 
                  href={linkMark.href} 
                  target={linkMark.blank ? '_blank' : undefined}
                  rel="noreferrer"
                  className={styles.contentLink}
                >
                  {acc || child.text}
                </a>
              );
            }

            // Handle other mark types
            switch (mark) {
              case 'strong':
                return <strong key={childIndex}>{acc || child.text}</strong>;
              case 'em':
                return <em key={childIndex}>{acc || child.text}</em>;
              case 'code':
                return <code key={childIndex} className={styles.inlineCode}>{acc || child.text}</code>;
              case 'underline':
                return <u key={childIndex}>{acc || child.text}</u>;
              case 'strike-through':
                return <s key={childIndex}>{acc || child.text}</s>;
              default:
                return acc || child.text;
            }
          }, null);
        })}
      </BlockElement>
    );
  };

  return (
    <div className={styles.postContainer}>
      {/* Minimal header area */}
      <div className={styles.headerMinimal}>
        {/* You can add user/site controls here if needed */}
      </div>
      
      {/* Post metadata */}
      <div className={styles.postDate}>
        {formattedDate}
      </div>
      
      {/* Featured image */}
      <img 
        src={imageUrl} 
        alt={post.title} 
        className={styles.featuredImage} 
      />
      
      {/* Main content area */}
      <h1 className={styles.postTitle}>{post.title}</h1>
      
      {post.extract && (
        <div className={styles.postExtract}>
          {post.extract}
        </div>
      )}
      
      <div className={styles.postBody}>
        {post.content && post.content.map((block: any, index: number) => 
          renderContentBlock(block, index)
        )}
      </div>

      {/* Footer actions */}
      <div className={styles.footerActions}>
        <div>
          {/* Left side actions - e.g., back to blog */}
          <a href="/blog">← Back to all posts</a>
        </div>
        <div>
          {/* Right side actions - e.g., share links */}
          <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noreferrer">Share on Twitter</a>
        </div>
      </div>

      {/* Related content section */}
      {post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className={styles.relatedContentSection}>
          <h3 className={styles.relatedContentTitle}>You might also like</h3>
          
          <div className={styles.relatedPostsGrid}>
            {post.relatedPosts.map((relatedPost, index) => (
              <div key={index} className={styles.relatedPostCard}>
                {relatedPost.imageUrl && (
                  <img 
                    src={relatedPost.imageUrl} 
                    alt={relatedPost.title}
                    className={styles.relatedPostImage}
                  />
                )}
                <a href={`/blog/${relatedPost.slug}`} className={styles.relatedPostTitle}>
                  {relatedPost.title}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}