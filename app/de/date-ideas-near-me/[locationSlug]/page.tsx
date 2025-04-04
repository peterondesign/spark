import { groq } from 'next-sanity';
import { client } from '@/sanity/lib/client';

const query = groq`*[_type == "dateIdeasNearMe" && location == $locationSlug] {
  title,
  description,
  image {
    asset -> {
      url
    }
  }
}`;

export default async function DateIdeasNearMePage({ params }: { params: { locationSlug: string } }) {
  const data = await client.fetch(query, { locationSlug: params.locationSlug });

  return (
    <div>
      <h1>Date Ideas Near {params.locationSlug}</h1>
      {data.map((idea: any) => (
        <div key={idea.title}>
          <h2>{idea.title}</h2>
          <p>{idea.description}</p>
          {idea.image?.asset?.url && <img src={idea.image.asset.url} alt={idea.title} />}
        </div>
      ))}
    </div>
  );
}