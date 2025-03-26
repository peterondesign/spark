"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { HeartIcon, MapPinIcon, StarIcon } from "../components/icons";
import { getImage, getPlaceholderImage, getImageUrl } from "../utils/imageService";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { PAGE_TITLES } from "../utils/titleUtils";
import { favoritesService } from '../services/favoritesService';

// Type definition for date ideas
type DateIdea = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  image: string | {
    url: string;
    attribution?: {
      name: string;
      username: string;
      profileUrl: string;
    } | null;
  };
};

export default function Favorites() {
  const [savedIdeas, setSavedIdeas] = useState<DateIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [imagesLoading, setImagesLoading] = useState(false);

  useEffect(() => {
    // Sync favorites with Supabase when the favorites page loads
    favoritesService.syncFavorites().catch(error => 
      console.warn('Failed to sync favorites:', error)
    );
    
    // Fetch saved ideas from localStorage
    const loadSavedIdeas = () => {
      const saved = localStorage.getItem("savedDateIdeas");
      if (saved) {
        setSavedIdeas(JSON.parse(saved));
      }
      setIsLoading(false);
    };

    loadSavedIdeas();
  }, []);

  useEffect(() => {
    const loadImageUrls = async () => {
      setImagesLoading(true);
      const urls: Record<string, string> = {};
      for (const idea of savedIdeas) {
        urls[idea.slug] = await getImageUrl(
          idea.image,
          `${idea.title} ${idea.category}`,
          400,
          300
        );
      }
      setImageUrls(urls);
      setImagesLoading(false);
    };

    if (savedIdeas.length > 0) {
      loadImageUrls();
    }
  }, [savedIdeas]);

  // Update removeFromFavorites to use favoritesService
  const removeFromFavorites = async (ideaSlug: string) => {
    const ideaToRemove = savedIdeas.find(idea => idea.slug === ideaSlug);
    if (ideaToRemove && ideaToRemove.id) {
      await favoritesService.removeFavorite(Number(ideaToRemove.id));
    }
    
    const updatedIdeas = savedIdeas.filter(idea => idea.slug !== ideaSlug);
    setSavedIdeas(updatedIdeas);
    localStorage.setItem("savedDateIdeas", JSON.stringify(updatedIdeas));
  };

  // Update clearAllFavorites to remove from Supabase too
  const clearAllFavorites = async () => {
    // Remove each favorite from Supabase
    for (const idea of savedIdeas) {
      if (idea.id) {
        await favoritesService.removeFavorite(Number(idea.id));
      }
    }
    
    setSavedIdeas([]);
    localStorage.removeItem("savedDateIdeas");
  };

  // Skeleton UI component for loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageTitle title={PAGE_TITLES.FAVORITES} />
        <Header />
        
        <div className="container mx-auto py-12 px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse mb-2"></div>
              <div className="h-5 w-96 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="mt-4 md:mt-0 h-10 w-40 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-5 w-24 bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-7 w-full bg-gray-200 rounded-md animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse mb-1"></div>
                  <div className="h-4 w-4/5 bg-gray-200 rounded-md animate-pulse mb-3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  // Empty state
  if (!isLoading && savedIdeas.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <PageTitle title={PAGE_TITLES.FAVORITES} />
        <Header/>

        {/* Empty State */}
        <div className="max-w-4xl mx-auto py-16 px-4 text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-100 rounded-full mb-6">
              <HeartIcon className="h-10 w-10 text-rose-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">No Saved Date Ideas Yet</h1>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              When you find date ideas you love, click the heart icon to save them here for easy access later.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium transition-colors"
            >
              Discover Date Ideas
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How Favorites Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Save Ideas</h3>
                <p className="text-sm text-gray-600">Click the heart icon on any date idea to save it to your favorites.</p>
              </div>
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Access Anytime</h3>
                <p className="text-sm text-gray-600">Your favorites are saved to this device for easy access later.</p>
              </div>
              <div>
                <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-800 mb-2">Plan Dates</h3>
                <p className="text-sm text-gray-600">Use your favorites list to plan your next perfect date.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Skeleton UI component for image loading
  const ImageSkeleton = () => (
    <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse"></div>
  );

  // Favorites list with saved ideas
  return (
    <div className="min-h-screen bg-white">
      <PageTitle title={PAGE_TITLES.FAVORITES} />
      {/* Navigation - Made Sticky */}
     <Header/>

      {/* Favorites Content */}
      <div className="container mx-auto py-12 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Saved Date Ideas</h1>
            <p className="text-gray-600">Here are all the date ideas you've saved for later.</p>
          </div>

          {savedIdeas.length > 0 && (
            <button 
              onClick={clearAllFavorites}
              className="mt-4 md:mt-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Clear All Favorites
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedIdeas.map((idea) => (
              <div key={idea.slug} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative">
                  {imagesLoading ? (
                    <ImageSkeleton />
                  ) : imageUrls[idea.slug] ? (
                    <Image
                      src={imageUrls[idea.slug]!}
                      alt={idea.title}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <ImageSkeleton />
                  )}
                  <button 
                    className="absolute top-3 right-3 bg-white p-3 rounded-full shadow-lg hover:bg-gray-100"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromFavorites(idea.slug);
                    }}
                  >
                    <HeartIcon className="h-7 w-7 text-rose-500" />
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {idea.category}
                    </span>

                  </div>

                  <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-rose-500 transition-colors">
                    <Link href={`/date-idea/${idea.slug}`}>
                      {idea.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer/>
    </div>
  );
}
