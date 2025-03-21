"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { getImageUrl } from "../../utils/imageService";
import { supabase } from "@/utils/supabaseClient";

// Define DateIdea type
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
  tips?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
  mapLocation?: string;
  contactInfo?: {
    website: string;
    phone: string;
    email: string;
  };
  amenities?: string[];
  difficultyLevel?: string;
  bestTimeToVisit?: string;
  reservationRequired?: boolean;
  reviewCount?: number;
  images: string[];
}

export default function DateIdeaDetails() {
  const params = useParams();
  const slug = params.slug as string;
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [relatedIdeas, setRelatedIdeas] = useState<DateIdea[]>([]);

  useEffect(() => {
    const fetchDateIdea = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) {
          console.error("Error fetching date idea:", error);
          setLoading(false);
          return;
        }

        if (data) {
          // Ensure the fetched data conforms to the DateIdea interface
          const dateIdeaData: DateIdea = {
            id: data.id,
            title: data.title,
            category: data.category,
            rating: data.rating,
            location: data.location,
            description: data.description,
            price: data.price,
            duration: data.duration,
            slug: data.slug,
            image: data.image,
            priceLevel: data.price_level || undefined,
            bestForStage: data.best_for_stage || undefined,
            tips: data.tips || undefined,
            idealFor: data.ideal_for || undefined,
            relatedDateIdeas: data.related_date_ideas || undefined,
            longDescription: data.long_description || undefined,
            mapLocation: data.map_location || undefined,
            contactInfo: data.contact_info || undefined,
            amenities: data.amenities || undefined,
            difficultyLevel: data.difficulty_level || undefined,
            bestTimeToVisit: data.best_time_to_visit || undefined,
            reservationRequired: data.reservation_required || undefined,
            reviewCount: data.review_count || undefined,
            images: data.images || [data.image] || [], // Ensure images is always an array
          };

          setDateIdea(dateIdeaData);

          // Fetch related ideas (adjust this part based on how related ideas are stored)
          if (dateIdeaData.relatedDateIdeas && dateIdeaData.relatedDateIdeas.length > 0) {
            const { data: relatedData, error: relatedError } = await supabase
              .from('date_ideas')
              .select('*')
              .in('slug', dateIdeaData.relatedDateIdeas);

            if (relatedError) {
              console.error("Error fetching related date ideas:", relatedError);
            } else {
              const relatedIdeasData: DateIdea[] = relatedData ? relatedData.map((relatedIdea: any) => ({
                id: relatedIdea.id,
                title: relatedIdea.title,
                category: relatedIdea.category,
                rating: relatedIdea.rating,
                location: relatedIdea.location,
                description: relatedIdea.description,
                price: relatedIdea.price,
                duration: relatedIdea.duration,
                slug: relatedIdea.slug,
                image: relatedIdea.image,
                priceLevel: relatedIdea.price_level || undefined,
                bestForStage: relatedIdea.best_for_stage || undefined,
                tips: relatedIdea.tips || undefined,
                idealFor: relatedIdea.ideal_for || undefined,
                relatedDateIdeas: relatedIdea.related_date_ideas || undefined,
                longDescription: relatedIdea.long_description || undefined,
                mapLocation: relatedIdea.map_location || undefined,
                contactInfo: relatedIdea.contact_info || undefined,
                amenities: relatedIdea.amenities || undefined,
                difficultyLevel: relatedIdea.difficulty_level || undefined,
                bestTimeToVisit: relatedIdea.best_time_to_visit || undefined,
                reservationRequired: relatedIdea.reservation_required || undefined,
                reviewCount: relatedIdea.review_count || undefined,
                images: relatedIdea.images || [relatedIdea.image] || [],
              })) : [];
              setRelatedIdeas(relatedIdeasData);
            }
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDateIdea();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Date Idea Not Found</h1>
          <p className="text-gray-600 mb-8">Sorry, we couldn't find the date idea you're looking for.</p>
          <Link 
            href="/" 
            className="px-6 py-3 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
          >
            Browse Date Ideas
          </Link>
        </div>
      </div>
    );
  }

  const renderPriceLevel = (level: number | string | undefined) => {
    const levels = ["$", "$$", "$$$", "$$$$"];
    let priceIndex = -1;
    
    if (typeof level === 'string') {
      priceIndex = levels.indexOf(level);
    } else if (typeof level === 'number' && level > 0 && level <= levels.length) {
      priceIndex = level - 1;
    }
    
    return (
      <div className="flex items-center">
        {levels.map((_, index) => (
          <span 
            key={index}
            className={`text-lg ${index <= priceIndex ? 'text-green-600 font-bold' : 'text-gray-300'}`}
          >
            $
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <HeartIcon className="h-8 w-8 text-rose-500" />
            <span className="ml-2 text-xl font-bold text-gray-800">Spark</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Link href="/discover" className="text-gray-600 hover:text-gray-900">
              Discover
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900">
              Categories
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-gray-900">
              Favorites
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          </div>

          <Link
            href="/login"
            className="px-4 py-2 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Images and Main Details */}
          <div className="w-full lg:w-2/3">
            {/* Image Gallery */}
            <div className="mb-8 relative rounded-2xl overflow-hidden">
              <div className="relative h-80 md:h-96 lg:h-[500px]">
                <Image
                  src={dateIdea.images[activeImage]}
                  alt={dateIdea.title}
                  fill
                  className="object-cover"
                />
                <SaveButton
                  itemSlug={dateIdea.slug}
                  item={dateIdea}
                  className="absolute top-4 right-4 z-10"
                />
              </div>
              
              {/* Thumbnail Navigation */}
              {dateIdea.images.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {dateIdea.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`h-16 w-24 relative border-2 rounded overflow-hidden transition-all ${
                        activeImage === idx ? "border-rose-500" : "border-transparent opacity-70"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${dateIdea.title} thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title and Rating */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {dateIdea.category}
                    </span>
                    <div className="ml-3 flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-1 text-sm font-medium text-gray-700">{dateIdea.rating}</span>
                      <span className="ml-1 text-sm text-gray-500">({dateIdea.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-800">{dateIdea.price}</div>
                  <div className="text-sm text-gray-500">{dateIdea.duration}</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center mb-6">
              <MapPinIcon className="h-5 w-5 text-rose-500 mr-2" />
              <span className="text-gray-700">{dateIdea.location}</span>
              {dateIdea.mapLocation && (
                <Link
                  href={dateIdea.mapLocation}
                  target="_blank"
                  className="ml-3 text-sm text-rose-500 hover:text-rose-600"
                >
                  View on map
                </Link>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: dateIdea.longDescription || '' }} />
            </div>

            {/* What to expect */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">What to Expect</h2>
              <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Price Level</h3>
                  <div className="flex items-center">
                    {renderPriceLevel(dateIdea.priceLevel)}
                    <span className="ml-2 text-gray-500 text-sm">{dateIdea.price}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Duration</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{dateIdea.duration}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Difficulty</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>{dateIdea.difficultyLevel}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Reservation</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{dateIdea.reservationRequired ? "Required" : "Not required"}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Best Time to Visit</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{dateIdea.bestTimeToVisit}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Best For</h3>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{dateIdea.bestForStage}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full lg:w-1/3">
            {/* Booking/Contact Card */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              {dateIdea.contactInfo && (
                <>
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Ready to Try This Date?</h2>
                  <Link
                    href={dateIdea.contactInfo.website}
                    target="_blank"
                    className="bg-rose-500 text-white w-full py-3 rounded-lg flex items-center justify-center font-medium hover:bg-rose-600 transition-colors mb-4"
                  >
                    Book Now
                  </Link>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Information</h3>
                      <div className="mt-1">
                        <div className="flex items-center text-gray-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span>{dateIdea.contactInfo.phone}</span>
                        </div>
                        <div className="flex items-center text-gray-800 mt-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{dateIdea.contactInfo.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            
            {/* Tips */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Insider Tips</h2>
              <div className="space-y-2">
                {Array.isArray(dateIdea.tips) ? (
                  dateIdea.tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{tip}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-700">No tips available.</div>
                )}
              </div>
            </div>
            
            {/* Ideal For */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Ideal For</h2>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(dateIdea.idealFor) ? (
                  dateIdea.idealFor.map((ideal: string, index: number) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded"
                    >
                      {ideal}
                    </span>
                  ))
                ) : (
                  <div className="text-gray-700">Not specified.</div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Ideas */}
        {relatedIdeas.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedIdeas.map((idea, index) => (
                <Link href={`/date-idea/${idea.slug}`} key={index} className="group">
                  <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={idea.images[0]}
                        alt={idea.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover"
                      />
                      <SaveButton 
                        itemSlug={idea.slug}
                        item={idea}
                        className="absolute top-3 right-3"
                      />
                    </div>

                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {idea.category}
                        </span>
                        <div className="ml-auto flex items-center">
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{idea.rating}</span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-rose-500 transition-colors">
                        {idea.title}
                      </h3>

                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{idea.location}</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{idea.description}</p>

                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-900">{idea.price}</span>
                        <span className="text-gray-500">{idea.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
