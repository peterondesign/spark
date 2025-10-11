import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon, MapPinIcon, StarIcon, XIcon, UndoIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
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
  const [recentFavorites, setRecentFavorites] = useState<DateIdea[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animatingIdea, setAnimatingIdea] = useState<DateIdea | null>(null);
  
  useEffect(() => {
    // Load saved favorites from localStorage
    const savedIdeas = localStorage.getItem("savedDateIdeas");
    if (savedIdeas) {
      const allFavorites = JSON.parse(savedIdeas);
      setRecentFavorites(allFavorites);
    }
  }, []);

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
    
    // Add current index to history for undo functionality
    setSwipeHistory(prev => [...prev, currentIndex]);
    
    if (liked) {
      // Set up animation
      setAnimatingIdea(currentIdea);
      setShowAnimation(true);
      
      // Save to favorites if swiped right
      const savedIdeas = localStorage.getItem("savedDateIdeas");
      const existingIdeas = savedIdeas ? JSON.parse(savedIdeas) : [];
      
      // Only add if not already saved
      if (!existingIdeas.some((idea: DateIdea) => idea.id === currentIdea.id)) {
        const updatedIdeas = [currentIdea, ...existingIdeas];
        localStorage.setItem("savedDateIdeas", JSON.stringify(updatedIdeas));
        setRecentFavorites(updatedIdeas);
      }
      
      // Hide animation after delay
      setTimeout(() => {
        setShowAnimation(false);
        setAnimatingIdea(null);
      }, 1500);
    }
    
    // Small delay to show the animation before changing card
    setTimeout(() => {
      setDirection(null);
      setCurrentIndex((prevIndex) => 
        prevIndex + 1 >= dateIdeas.length ? 0 : prevIndex + 1
      );
    }, 300);
  };

  const handleUndo = () => {
    if (swipeHistory.length > 0) {
      const previousIndex = swipeHistory[swipeHistory.length - 1];
      setSwipeHistory(prev => prev.slice(0, -1));
      setCurrentIndex(previousIndex);
    }
  };

  const removeFavorite = (ideaId: number) => {
    const savedIdeas = localStorage.getItem("savedDateIdeas");
    if (savedIdeas) {
      const existingIdeas = JSON.parse(savedIdeas);
      const updatedIdeas = existingIdeas.filter((idea: DateIdea) => idea.id !== ideaId);
      localStorage.setItem("savedDateIdeas", JSON.stringify(updatedIdeas));
      setRecentFavorites(updatedIdeas);
    }
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Swipe Area */}
      <div className="flex flex-col items-center flex-1">
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
              alt={`Date idea: ${currentIdea.title} - AI date night generator for couples`}
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
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{currentIdea.title}</h3>
            
            <p className="text-sm line-clamp-3 mb-3">{currentIdea.description}</p>
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
            onClick={handleUndo}
            disabled={swipeHistory.length === 0}
            className="p-4 bg-white text-blue-500 rounded-full shadow-md hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UndoIcon className="h-8 w-8" />
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

      {/* Animation for favorites */}
      {showAnimation && animatingIdea && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg animate-pulse">
            <div className="flex items-center space-x-2">
              <HeartIcon className="h-6 w-6" />
              <span className="font-medium">Added to Favorites!</span>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Collapsible Favorites Sidebar */}
    <div className={`${isSidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300 bg-white rounded-lg shadow-lg flex flex-col h-[70vh] max-h-[600px]`}>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="p-3 flex items-center justify-center hover:bg-gray-50 transition-colors flex-shrink-0"
      >
        {isSidebarOpen ? (
          <ChevronRightIcon className="h-6 w-6 text-gray-600" />
        ) : (
          <ChevronLeftIcon className="h-6 w-6 text-gray-600" />
        )}
      </button>

      {isSidebarOpen && (
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Favorites</h3>
              <span className="text-sm text-gray-500">{recentFavorites.length}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {recentFavorites.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <HeartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No favorites yet</p>
                <p className="text-sm">Swipe right to add ideas!</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {recentFavorites.map((favorite) => (
                  <div 
                    key={favorite.id}
                    className="relative group border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <Link href={`/date-idea/${favorite.slug}`} className="block">
                      <div className="flex">
                        <div className="relative w-20 h-20 flex-shrink-0">
                          {dateIdeaImages[favorite.slug] ? (
                            <Image
                              src={dateIdeaImages[favorite.slug]}
                              alt={favorite.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">Loading...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-3">
                          <h4 className="font-medium text-sm text-gray-800 line-clamp-2">
                            {favorite.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {favorite.category}
                          </p>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        removeFavorite(favorite.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {recentFavorites.length > 0 && (
            <div className="p-4 border-t flex-shrink-0">
              <Link 
                href="/favorites" 
                className="w-full bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors text-center block"
              >
                View All Favorites
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
);
}
