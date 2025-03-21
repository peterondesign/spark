import React, { useRef, useState, useEffect } from 'react';
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

interface TikTokFeedViewProps {
  dateIdeas: DateIdea[];
  dateIdeaImages: Record<string, string>;
  visibleIdeas: number;
  onLoadMore: () => void;
}

export default function TikTokFeedView({ 
  dateIdeas, 
  dateIdeaImages,
  visibleIdeas,
  onLoadMore
}: TikTokFeedViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Set up intersection observer to detect when cards are visible
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          if (!isNaN(index)) {
            setActiveIndex(index);
          }
        }
      });
    }, {
      threshold: 0.7 // Card needs to be 70% visible to be considered active
    });
    
    // Observe all card elements
    cardRefs.current.forEach(ref => {
      if (ref) observerRef.current?.observe(ref);
    });
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [dateIdeas, visibleIdeas]);
  
  // Set up observer for the last item to implement infinite scroll
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && dateIdeas.length > visibleIdeas) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (lastItemRef.current) {
      observer.observe(lastItemRef.current);
    }
    
    return () => observer.disconnect();
  }, [dateIdeas.length, visibleIdeas, onLoadMore]);
  
  if (dateIdeas.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No date ideas found.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {dateIdeas.slice(0, visibleIdeas).map((idea, index) => (
        <div
          ref={(el) => {
            cardRefs.current[index] = el;
            if (index === visibleIdeas - 1) lastItemRef.current = el;
          }}
          key={idea.id}
          data-index={index}
          className="snap-center w-full max-w-3xl mx-auto bg-white rounded-xl overflow-hidden shadow-md"
        >
          <div className="relative aspect-[9/16] sm:aspect-[16/16]">
            {dateIdeaImages[idea.slug] ? (
              <Image
                src={dateIdeaImages[idea.slug]}
                alt={idea.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image loading...</span>
              </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 text-white">
              <div className="flex items-center mb-2">
                <span className="bg-yellow-400/90 text-yellow-900 text-xs font-medium px-2.5 py-0.5 rounded">
                  {idea.category}
                </span>
                <div className="ml-auto flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm">{idea.rating}</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold mb-2">{idea.title}</h3>
              
              <div className="flex items-center text-sm mb-3">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{idea.location}</span>
              </div>
              
              <p className="text-sm line-clamp-3 mb-3">{idea.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">{idea.duration}</span>
                <div className="flex space-x-3">
                  <SaveButton itemSlug={idea.slug} item={idea} />
                  <Link 
                    href={`/date-idea/${idea.slug}`} 
                    className="inline-flex items-center justify-center px-3 py-1.5 bg-rose-500 text-white text-sm font-medium rounded-full hover:bg-rose-600 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
