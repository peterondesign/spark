import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, StarIcon } from './icons';
import SaveButton from './SaveButton';

interface DateIdea {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string | null;
  idealFor?: string;
}

interface GridViewProps {
  dateIdeas: DateIdea[];
  dateIdeaImages: Record<string, string>;
  visibleIdeas: number;
  onLoadMore: () => void;
}

export default function GridView({ dateIdeas, dateIdeaImages, visibleIdeas, onLoadMore }: GridViewProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dateIdeas.slice(0, visibleIdeas).map((idea, index) => (
          <Link href={`/date-idea/${idea.slug}`} key={idea.id} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative">
                {dateIdeaImages[idea.slug] ? (
                  <Image
                    src={dateIdeaImages[idea.slug]}
                    alt={idea.title}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                    loading={index < 4 ? "eager" : "lazy"} // Only load top 4 images eagerly
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Image loading...</span>
                  </div>
                )}
                <SaveButton itemSlug={idea.slug} item={idea} className="absolute top-3 right-3" />
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {idea.category}
                  </span>
                
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                  {idea.title}
                </h3>

        
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {dateIdeas.length > visibleIdeas && (
        <div className="text-center mt-8">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Load More Ideas
          </button>
        </div>
      )}
    </>
  );
}
