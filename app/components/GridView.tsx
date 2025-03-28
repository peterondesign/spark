import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SaveButton from './SaveButton';

// Export the DateIdea interface so it can be imported elsewhere
export interface DateIdea {
  id: number;
  title: string;
  category: string;
  location: string | {
    type?: string;
    setting?: string;
    [key: string]: any;
  };
  description: string;
  slug: string;
  image: string;
  timeOfDay?: string;
  mood?: {
    pace?: string;
    vibe?: string;
    [key: string]: any;
  } | string;
  priceLevel?: number | string;
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
}

export default function GridView({ 
  dateIdeas, 
  dateIdeaImages, 
  visibleIdeas, 
  onLoadMore,
  filterOptions,
  selectedFilters,
  onFilterChange
}: GridViewProps) {
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
  
  // Add debug logging to help diagnose issues
  console.log('DateIdeas received:', dateIdeas.length, dateIdeas.slice(0, 2));
  console.log('VisibleIdeas:', visibleIdeas);
  console.log('DateIdeaImages:', Object.keys(dateIdeaImages).length);
  
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
        {dateIdeas.slice(0, visibleIdeas).map((idea, index) => (
          <Link href={`/date-idea/${idea.slug}`} key={idea.id} className="group">
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="relative">
                <Image
                  src={dateIdeaImages[idea.slug] || idea.image || '/placeholder.svg?height=300&width=400'}
                  alt={idea.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                  loading={index < 4 ? "eager" : "lazy"} // Only load top 4 images eagerly
                />
                <SaveButton itemSlug={idea.slug} item={idea} className="absolute top-3 right-3" />
              </div>

              <div className="p-4">
                <div className="flex items-center mb-2 flex-wrap gap-1">
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    {idea.category}
                  </span>
                  
                  {/* Display location type/setting if available */}
                  {typeof idea.location === 'object' && idea.location?.type && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {idea.location.type}
                    </span>
                  )}
                  
                  {typeof idea.location === 'object' && idea.location?.setting && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {idea.location.setting}
                    </span>
                  )}
                  
                  {/* Display mood pace/vibe if available */}
                  {typeof idea.mood === 'object' && idea.mood?.pace && (
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {idea.mood.pace}
                    </span>
                  )}
                  
                  {typeof idea.mood === 'object' && idea.mood?.vibe && (
                    <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {idea.mood.vibe}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                  {idea.title}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {idea.description}
                </p>
                
                {idea.tips && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-semibold">Tip:</span> {idea.tips}
                  </div>
                )}
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
