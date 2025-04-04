import { client } from '@/sanity/lib/client';
import { groq } from 'next-sanity';

const query = groq`*[_type == "blog" && slug.current == $slug][0] {
  title,
  content,
  publishedAt
}`;

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await client.fetch(query, { slug: params.slug });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>Published on: {new Date(post.publishedAt).toLocaleDateString()}</p>
      <div>
        {post.content.map((block: any, index: number) => (
          <p key={index}>{block.children[0].text}</p>
        ))}
      </div>
    </div>
  );
}