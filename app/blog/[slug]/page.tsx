import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import { getPexelsFallbackUrl } from '@/app/utils/imageService';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BlogPostClient from '../../components/BlogPostClient';

const query = groq`*[_type == "blog" && slug.current == $slug][0] {
  title,
  content,
  publishedAt,
  extract
}`;

// Fix the params type to match Next.js expected structure
export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string }
}) {
  const post = await client.fetch(query, { slug: params.slug });

  if (!post) {
    return <div>Post not found</div>;
  }

  const imageUrl = await getPexelsFallbackUrl(post.title, 800, 450);

  return (
    <>
      <Header />
      <BlogPostClient post={post} imageUrl={imageUrl} />
      <Footer />
    </>
  );
}