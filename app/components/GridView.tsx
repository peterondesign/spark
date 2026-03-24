// This component is responsible for displaying a grid of date ideas.

"use client";

import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SaveButton from './SaveButton';
import { Hash, X } from 'lucide-react';

// Export the DateIdea interface so it can be imported elsewhere
export interface DateIdea {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  slug: string;
  image: string;
  timeOfDay?: string;
  mood?: string;
  priceLevel?: number;
  tips?: string | null;
  longDescription?: string;
}

interface GridViewProps {
  dateIdeas: DateIdea[];
  dateIdeaImages: Record<string, string>;
  visibleIdeas: number;
  onLoadMore: () => void;
  filterOptions?: {
    categories: string[];
    locationTypes: string[];
    locationSettings: string[];
    moodPaces: string[];
    moodVibes: string[];
  };
  selectedFilters?: {
    categories: string[];
    locationTypes: string[];
    locationSettings: string[];
    moodPaces: string[];
    moodVibes: string[];
  };
  onFilterChange?: (filterType: string, value: string, isChecked: boolean) => void;
  onRemoveFavorite?: (slug: string) => void;
}

export default function GridView({
  dateIdeas,
  dateIdeaImages,
  visibleIdeas,
  onLoadMore,
  filterOptions,
  selectedFilters,
  onFilterChange,
  onRemoveFavorite,
}: GridViewProps) {
  // Shuffle dateIdeas synchronously using useMemo to avoid visible reorders


  // Check if we have any data to display
  if (dateIdeas.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl text-gray-600">No date ideas found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dateIdeas.slice(0, visibleIdeas).map((idea) => (
          <Link href={`/date-idea/${idea.slug}`} key={idea.id} className="group relative">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={dateIdeaImages[idea.slug] || idea.image || '/placeholder.svg?height=300&width=400'}
                  alt={idea.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                {/* <div className="absolute top-3 right-3 flex space-x-2">
                  <SaveButton itemSlug={idea.slug} item={idea} className="" />
                  {onRemoveFavorite && (
                    <button onClick={() => onRemoveFavorite(idea.slug)} className="text-red-600 hover:text-red-800">
                      <X size={18} />
                    </button>
                  )}
                </div> */}
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2 flex-wrap gap-1">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {idea.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                  {idea.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {idea.description}
                </p>
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