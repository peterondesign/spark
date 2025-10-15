import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { getAIImageUrl } from '@/app/utils/imageService';
import Header from '../../components/sections/Header';
import Footer from '../../components/sections/Footer';
import BlogPostClient from '../../components/BlogPostClient';

const query = groq`*[_type == "blog" && slug.current == $slug][0] {
  title,
  content,
  publishedAt,
  extract
}`;

// Updated to properly handle the Promise params in Next.js 15
export default async function BlogPostPage(props: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params Promise to get the actual slug value
  const { slug } = await props.params;
  
  const post = await client.fetch(query, { slug });

  if (!post) {
    return <div>Post not found</div>;
  }

  const imageUrl = await getAIImageUrl(post.title, 800, 450);

  return (
    <>
      <Header />
      <BlogPostClient post={post} imageUrl={imageUrl} />
      <Footer />
    </>
  );
}