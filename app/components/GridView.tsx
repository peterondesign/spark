import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SaveButton from './SaveButton';
import { X } from 'lucide-react';

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
  // Local search state
  const [searchQuery, setSearchQuery] = useState('');
  // Carousel pagination
  const [page, setPage] = useState(0);

  // Helper function to display price level
  const renderPriceLevel = (level: number | string | undefined) => {
    if (level === undefined) return null;

    const priceText = typeof level === 'string' 
      ? level 
      : level === 1 ? 'Low' : level === 2 ? 'Moderate' : level === 3 ? 'High' : 'Luxury';

    return (
      <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
        {priceText}
      </span>
    );
  };

  const filteredSorted = useMemo(() => 
    dateIdeas
      .filter(idea => idea.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => a.title.localeCompare(b.title))
  , [dateIdeas, searchQuery]);
  const totalPages = Math.ceil(filteredSorted.length / visibleIdeas);
  const currentPageIdeas = filteredSorted.slice(page * visibleIdeas, (page + 1) * visibleIdeas);

  // Check if we have any data to display
  if (filteredSorted.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-xl text-gray-600">No date ideas found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <>
      {/* Search input */}
      <div className="mb-4 text-center">
        <input
          type="text"
          placeholder="Search date ideas..."
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(0); }}
          className="px-4 py-2 border rounded w-1/2"
        />
      </div>
      {/* Carousel nav */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Prev</button>
        <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1} className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">Next</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {currentPageIdeas.map((idea) => {
          const [isDragging, setIsDragging] = useState(false);
          return (
            <Link href={`/date-idea/${idea.slug}`} key={idea.id} className="group relative"
              draggable
              onDragStart={e => { e.currentTarget.classList.add('opacity-50'); setIsDragging(true); e.dataTransfer.setData('application/json', JSON.stringify(idea)); }}
              onDragEnd={e => { e.currentTarget.classList.remove('opacity-50'); setIsDragging(false); }}
              style={{ cursor: 'grab' }}
            >
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
                  {/* Save and Remove buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <SaveButton itemSlug={idea.slug} item={idea} className="" />
                    {onRemoveFavorite && (
                      <button onClick={() => onRemoveFavorite(idea.slug)} className="text-red-600 hover:text-red-800">
                        <X size={18} />
                      </button>
                    )}
                  </div>
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
          );
        })}
      </div>

      {filteredSorted.length > (page + 1) * visibleIdeas && (
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
