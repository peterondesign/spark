"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HeartIcon, MapPinIcon, StarIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { supabase } from "@/utils/supabaseClient";
import { getImageUrl } from "@/app/utils/imageService"; // Import getImageUrl
import Header from "@/app/components/Header";

// Simplified DateIdea interface
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
  idealFor?: string[];
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

export default function DateIdeaDetails() {
  const params = useParams();
  const slug = params.slug as string;
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

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
          // Process the data
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
            images: data.images || [],
          };

          setDateIdea(dateIdeaData);

          // Load the main image and all other images
          const allImages = [data.image];
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            // Add additional images if they exist
            allImages.push(...data.images.filter((img: any) => img !== data.image));
          }

          // Get optimized image URLs for all images
          const imageUrlPromises = allImages.map(img => 
            getImageUrl(img, `${data.title} ${data.category}`, 1200, 800)
          );
          
          const resolvedImageUrls = await Promise.all(imageUrlPromises);
          setImageUrls(resolvedImageUrls);
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

  const renderPriceLevel = (level: number | undefined) => {
    if (!level) return null;
    
    const levels = ["$", "$$", "$$$", "$$$$"];
    const priceIndex = level - 1;

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

  // If we don't have any images yet, show a placeholder
  if (imageUrls.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-gray-500 hover:text-rose-500">Home</Link>
            </li>
            <li>
              <span className="text-gray-500 mx-1">/</span>
            </li>
            <li className="text-rose-500">{dateIdea.title}</li>
          </ol>
        </nav>

        {/* Main Image */}
        <div className="mb-8 relative rounded-2xl overflow-hidden">
          <div className="relative h-80 md:h-96 lg:h-[500px]">
            {imageUrls[activeImage] ? (
              <Image
                src={imageUrls[activeImage]}
                alt={dateIdea.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Image unavailable</span>
              </div>
            )}
            <SaveButton
              itemSlug={dateIdea.slug}
              item={dateIdea}
              className="absolute top-4 right-4 z-10"
            />
          </div>

          {/* Thumbnail Navigation - Only show if we have more than one image */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {imageUrls.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-16 w-24 relative border-2 rounded overflow-hidden transition-all flex-shrink-0 ${
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

        {/* Title and Category */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {dateIdea.category}
            </span>
            <div className="ml-3 flex items-center">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="ml-1 text-sm font-medium text-gray-700">{dateIdea.rating}</span>
            </div>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">{dateIdea.price}</div>
              <div className="text-sm text-gray-500">{dateIdea.duration}</div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center mb-6 bg-gray-50 p-3 rounded-lg">
          <MapPinIcon className="h-5 w-5 text-rose-500 mr-2" />
          <span className="text-gray-700">{dateIdea.location}</span>
        </div>

        {/* Date Details Card */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            {dateIdea.bestForStage && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Best For</h3>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{dateIdea.bestForStage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
          <p className="text-gray-700 mb-6">{dateIdea.description}</p>

          {dateIdea.longDescription && (
            <div className="prose max-w-none" 
                dangerouslySetInnerHTML={{ __html: dateIdea.longDescription || '' }} />
          )}
        </div>

        {/* Tips Section */}
        {dateIdea.tips && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-amber-800 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Insider Tips
            </h2>
            <p className="text-amber-800">{dateIdea.tips}</p>
          </div>
        )}

        {/* Ideal For Tags */}
        {dateIdea.idealFor && Array.isArray(dateIdea.idealFor) && dateIdea.idealFor.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Ideal For</h2>
            <div className="flex flex-wrap gap-2">
              {dateIdea.idealFor.map((ideal, index) => (
                <span key={index} className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded">
                  {ideal}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Browse Button */}
        <div className="text-center mt-8 mb-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-rose-500 text-rose-500 bg-white rounded-full hover:bg-rose-50 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse More Date Ideas
          </Link>
        </div>
      </main>
    </div>
  );
}