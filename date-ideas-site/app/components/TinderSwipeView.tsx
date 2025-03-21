import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, MapPinIcon, StarIcon, XIcon } from './icons';
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

interface TinderSwipeViewProps {
  dateIdeas: DateIdea[];
  dateIdeaImages: Record<string, string>;
}

export default function TinderSwipeView({ dateIdeas, dateIdeaImages }: TinderSwipeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  
  if (dateIdeas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No date ideas found.</p>
      </div>
    );
  }

  const currentIdea = dateIdeas[currentIndex];

  const handleSwipe = (liked: boolean) => {
    setDirection(liked ? 'right' : 'left');
    
    // Small delay to show the animation before changing card
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= dateIdeas.length ? 0 : prevIndex + 1
      );
    }, 300);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-md">
        <div 
          className={`relative h-[70vh] max-h-[600px] w-full rounded-xl overflow-hidden shadow-lg transition-transform duration-300 ${
            direction === 'left' ? 'translate-x-[-100px] rotate-[-8deg] opacity-0' : 
            direction === 'right' ? 'translate-x-[100px] rotate-[8deg] opacity-0' : ''
          }`}
        >
          {dateIdeaImages[currentIdea.slug] ? (
            <Image
              src={dateIdeaImages[currentIdea.slug]}
              alt={currentIdea.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Image loading...</span>
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
            <div className="flex items-center mb-2">
              <span className="bg-yellow-400/90 text-yellow-900 text-xs font-medium px-2.5 py-0.5 rounded">
                {currentIdea.category}
              </span>
              <div className="ml-auto flex items-center">
                <StarIcon className="h-4 w-4 text-yellow-400" />
                <span className="ml-1 text-sm">{currentIdea.rating}</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{currentIdea.title}</h3>
            
            <div className="flex items-center text-sm mb-3">
              <MapPinIcon className="h-4 w-4 mr-1" />
              <span>{currentIdea.location}</span>
            </div>
            
            <p className="text-sm line-clamp-3 mb-3">{currentIdea.description}</p>
            
            <div className="flex justify-between items-center text-sm">
              <span>{currentIdea.duration}</span>
              <SaveButton itemSlug={currentIdea.slug} item={currentIdea} className="z-10" />
            </div>
          </div>
          
          <Link 
            href={`/date-idea/${currentIdea.slug}`} 
            className="absolute inset-0 z-0"
            aria-label={`View details for ${currentIdea.title}`}
          />
        </div>
        
        <div className="flex justify-center mt-6 space-x-4">
          <button 
            onClick={() => handleSwipe(false)} 
            className="p-4 bg-white text-red-500 rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <XIcon className="h-8 w-8" />
          </button>
          
          <button 
            onClick={() => handleSwipe(true)} 
            className="p-4 bg-white text-green-500 rounded-full shadow-md hover:bg-green-50 transition-colors"
          >
            <HeartIcon className="h-8 w-8" />
          </button>
        </div>
        
        <div className="mt-4 text-center text-gray-500">
          Idea {currentIndex + 1} of {dateIdeas.length}
        </div>
      </div>
    </div>
  );
}
