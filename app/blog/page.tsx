import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';
import Link from 'next/link';

const query = groq`*[_type == "blog"] {
  title,
  slug,
  publishedAt
}`;

export default async function BlogPage() {
  const posts = await client.fetch(query);

  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map((post: any) => (
          <li key={post.slug.current}>
            <a href={`/blog/${post.slug.current}`}>
              <p>{post.title}</p>
            </a>
            <p>Published on: {new Date(post.publishedAt).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}