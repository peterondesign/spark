"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MapPinIcon } from "../../components/icons";
import SaveButton from "../../components/SaveButton";
import { getImageUrl, getPlaceholderImage, processDateIdeaImages } from "@/app/utils/imageService";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { supabase } from "@/utils/supabaseClient";
import CountryCitySelector from "@/app/components/CountryCitySelector";
import RelatedDateIdea from "../../components/RelatedDateIdea";
import GetYourGuideActivities from "../../components/GetYourGuideActivities";
import { ScrapedData } from '../../types/interfaces';
import ScraperForm from "@/app/components/ScraperForm";
import Results from "@/app/components/Results";
import NewSiteResults from '@/app/components/NewSiteResults';

// TypeScript interfaces for GetYourGuide crawler
interface CrawlOptions {
  city: string;
  dateIdea: string;
  maxPages?: number;
  headless?: boolean;
}

interface CrawlResult {
  title: string;
  url: string;
  price: string;
  rating: string;
  reviewCount: number;
  duration: string;
  image: string;
  description?: string;
}

// Define DateIdea interface
interface DateIdea {
  id: string;
  title: string;
  category: string;
  rating?: number;
  location?: string;
  description?: string;
  price?: string;
  duration?: string;
  slug: string;
  image: string;
  priceLevel?: number;
  bestForStage?: string;
  tips?: string;
  mood?: string | { pace?: string; vibe?: string };
  timeOfDay?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  longDescription?: string;
  images?: string[];
}

// City type for user location
interface CityItem {
  name: string;
  countryCode: string;
  countryName: string;
  isPopular: boolean;
  id: string;
}


export default function DateIdeaDetails() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const [dateIdea, setDateIdea] = useState<DateIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Add state for other date ideas
  const [otherDateIdeas, setOtherDateIdeas] = useState<DateIdea[]>([]);
  const [loadingOtherIdeas, setLoadingOtherIdeas] = useState(false);
  const [dateIdeaImages, setDateIdeaImages] = useState<Record<string, string>>({});

  const [results, setResults] = useState<ScrapedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add state for NewSite results
  const [newSiteResults, setNewSiteResults] = useState(null);
  const [newSiteError, setNewSiteError] = useState<string | null>(null);

  const handleScrape = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to scrape website');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Add logic to fetch results for datetitle and usercity
  useEffect(() => {
    const fetchResults = async () => {
      if (!dateIdea || !userCity) return;

      try {
        const response = await fetch('/api/scrape-example', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: `${userCity} ${dateIdea.title}` }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch results');
        }

        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchResults();
  }, [dateIdea, userCity]);

  // Fetch results from NewSite
  useEffect(() => {
    const fetchNewSiteResults = async () => {
      if (!dateIdea || !userCity) return;

      try {
        const response = await fetch('/api/scrape-newsite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: `${userCity} ${dateIdea.title}` }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch results from NewSite');
        }

        const data = await response.json();
        setNewSiteResults(data);
      } catch (err) {
        console.error('Error fetching NewSite results:', err);
        setNewSiteError(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    };

    fetchNewSiteResults();
  }, [dateIdea, userCity]);

  // Log the results of NewSite scrape
  useEffect(() => {
    if (newSiteResults) {
      console.log('NewSite Results:', newSiteResults);
    }
  }, [newSiteResults]);

  // Simple function for handling city selection
  const handleCitySelect = (city: CityItem) => {
    setUserCity(city.name);
    // Store city name in localStorage
    localStorage.setItem("userCity", city.name);
    localStorage.setItem("userCityData", JSON.stringify({
      name: city.name,
      countryCode: city.countryCode,
      countryName: city.countryName,
      id: city.id
    }));
    setShowLocationPrompt(false);
  };

  // Function for clearing user city
  const clearUserCity = () => {
    localStorage.removeItem("userCity");
    localStorage.removeItem("userCityData");
    setUserCity(null);
    setShowLocationPrompt(true);
  };

  // Create a simplified location component
  const LocationSelector = () => {
    return (
      <>
        {showLocationPrompt ? (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="mb-3 md:mb-0 md:mr-4">
                <h3 className="text-sm font-semibold text-blue-800">Set Your Location</h3>
                <p className="text-sm text-blue-600">Add your city to personalize your date ideas</p>
              </div>
              <div className="flex w-full md:w-auto">
                <CountryCitySelector 
                  onCitySelect={handleCitySelect}
                  defaultCountry="US"
                  className="w-full md:w-auto"
                  prioritizeIpLocation={false} 
                />
              </div>
            </div>
          </div>
        ) : userCity ? (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              <MapPinIcon className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-gray-700 text-sm">Location: {userCity}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearUserCity}
                className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 px-3 py-1 rounded-full flex items-center transition-colors"
              >
                Change
              </button>
              <button
                onClick={clearUserCity}
                className="text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-full flex items-center transition-colors"
                aria-label="Clear location"
                title="Clear location"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  };

  // Load user location from localStorage
  useEffect(() => {
    const loadUserLocation = async () => {
      try {
        const savedCityData = localStorage.getItem("userCityData");
        if (savedCityData) {
          try {
            const cityData = JSON.parse(savedCityData);
            setUserCity(cityData.name);
            return;
          } catch (e) {
            console.error('Error parsing saved city data:', e);
          }
        }
        
        const savedCity = localStorage.getItem("userCity");
        if (savedCity) {
          setUserCity(savedCity);
          return;
        }
        
        // Show prompt if no location is found
        setShowLocationPrompt(true);
      } catch (error) {
        console.error('Error loading user location:', error);
        setShowLocationPrompt(true);
      }
    };

    loadUserLocation();
  }, []);

  // Fetch the date idea details
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
            mood: data.mood || undefined,
            timeOfDay: data.time_of_day || undefined,
            idealFor: data.ideal_for || undefined,
            relatedDateIdeas: data.related_date_ideas || undefined,
            longDescription: data.long_description || undefined,
            images: data.images || [],
          };

          setDateIdea(dateIdeaData);

          const allImages = [data.image];
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            allImages.push(...data.images.filter((img: any) => img !== data.image));
          }

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

  // Fetch other related date ideas when the main date idea loads
  useEffect(() => {
    if (dateIdea && dateIdea.id && dateIdea.category) {
      fetchOtherDateIdeas(dateIdea.id);
    }
  }, [dateIdea]);
  


  // Function to fetch other random date ideas
  const fetchOtherDateIdeas = async (currentId: string) => {
    setLoadingOtherIdeas(true);
    try {
      // Using proper Supabase syntax for random ordering
      const { data: randomIdeas, error } = await supabase
        .from('date_ideas')
        .select('id, title, category, description, slug, image')
        .neq('id', currentId)
        .order('id', { ascending: false })
        .limit(10);
        
      if (error) {
        console.error('Error fetching random ideas:', error);
        throw error;
      }
      
      if (randomIdeas && randomIdeas.length > 0) {
        // Shuffle array client-side to get random results
        const shuffledIdeas = randomIdeas
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        setOtherDateIdeas(shuffledIdeas as DateIdea[]);
        
        // Process images for the other date ideas
        const imageMap = await processDateIdeaImages(shuffledIdeas, 400, 200);
        setDateIdeaImages(imageMap);
      } else {
        throw new Error('No random date ideas found');
      }
    } catch (error) {
      console.error("Error fetching other date ideas:", error);
      
      // Fallback date ideas if the database query fails
      const fallbackIdeas = [
        {
          id: 'fallback-1',
          title: 'Romantic Dinner',
          category: 'Food & Drink',
          description: 'Enjoy a candle-lit dinner at a cozy restaurant.',
          slug: 'romantic-dinner',
          image: '/placeholder.jpg'
        },
        {
          id: 'fallback-2',
          title: 'Hiking Adventure',
          category: 'Outdoor',
          description: 'Explore nature trails and enjoy scenic views together.',
          slug: 'hiking-adventure',
          image: '/placeholder.jpg'
        },
        {
          id: 'fallback-3',
          title: 'Movie Night',
          category: 'Entertainment',
          description: 'Cuddle up with popcorn and watch a film together.',
          slug: 'movie-night',
          image: '/placeholder.jpg'
        }
      ];
      
      setOtherDateIdeas(fallbackIdeas);
      
      // Process fallback images
      const fallbackImageMap = await processDateIdeaImages(fallbackIdeas, 400, 200);
      setDateIdeaImages(fallbackImageMap);
    } finally {
      setLoadingOtherIdeas(false);
    }
  };



  // Render function for other date ideas
  const renderOtherDateIdeas = () => {
    if (loadingOtherIdeas) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    if (otherDateIdeas.length === 0) {
      return (
        <div className="text-center py-6">
          <p className="text-gray-500">Searching for more date ideas...</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {otherDateIdeas.map((idea) => (
          <Link
            key={idea.id}
            href={`/date-idea/${idea.slug}`}
            className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md"
          >
            <div className="relative h-40">
              <Image
                src={dateIdeaImages[idea.id] || getPlaceholderImage(400, 200, idea.title)}
                alt={idea.title}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-0 left-0 bg-rose-500/80 text-white text-xs font-medium px-2 py-1">
                {idea.category}
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-rose-600 transition-colors">
                {idea.title}
              </h3>
              <p className="text-gray-600 text-sm line-clamp-2">
                {idea.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    );
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-4 flex gap-2">
            <div className="h-4 w-12 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
          </div>

          <div className="mb-8 rounded-2xl overflow-hidden">
            <div className="h-80 md:h-96 lg:h-[500px] bg-gray-200 animate-pulse"></div>
          </div>

          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-full"></div>
            </div>
            <div className="h-10 w-3/4 bg-gray-200 animate-pulse rounded mb-2"></div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <div className="h-7 w-40 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-4/6 bg-gray-200 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No date idea found state
  if (!dateIdea) {
    return (
      <div className="min-h-screen bg-white py-20">
        <Header />
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
        <Footer />
      </div>
    );
  }

  // Price level renderer
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

  // Waiting for images
  if (imageUrls.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Header />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-rose-500"></div>
        <Footer />
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
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

        {/* Main image gallery */}
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

          {/* Thumbnail gallery */}
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

        {/* Date idea title and category */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <span className="bg-rose-100 text-rose-800 text-xs font-medium px-2.5 py-0.5 rounded">
              {dateIdea.category}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">{dateIdea.title}</h1>
            {dateIdea.priceLevel && (
              <div className="text-right">
                {renderPriceLevel(dateIdea.priceLevel)}
              </div>
            )}
          </div>
        </div>

        {/* Location selector */}
        <LocationSelector />

        <main>
          <section className="form-section">
            <ScraperForm 
              onScrape={handleScrape} 
              dateIdeaTitle={dateIdea.title} 
              userCity={userCity || ''} 
            />
          </section>

          {!isLoading && results && (
            <section className="results-section">
              <Results data={results} isLoading={false} />
            </section>
          )}
          
          {isLoading && (
            <section className="results-section">
              <Results isLoading={true} data={undefined as any} />
            </section>
          )}

        </main>

        {/* Description section */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">About This Date Idea</h2>
          <p className="text-gray-700 mb-6">{dateIdea.description}</p>

          {dateIdea.longDescription && (
            <div className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: dateIdea.longDescription || '' }} />
          )}
        </div>

        {/* Tips section */}
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

        {/* GetYourGuide Activities Section */}
        

        {/* Other details section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {dateIdea.bestForStage && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Best For</h3>
              <p className="text-gray-600">{dateIdea.bestForStage}</p>
            </div>
          )}
          

          
          {dateIdea.timeOfDay && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Best Time</h3>
              <p className="text-gray-600">{dateIdea.timeOfDay}</p>
            </div>
          )}
          
          {dateIdea.idealFor && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Ideal For</h3>
              <p className="text-gray-600">{dateIdea.idealFor}</p>
            </div>
          )}
          
          {dateIdea.duration && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Duration</h3>
              <p className="text-gray-600">{dateIdea.duration}</p>
            </div>
          )}
        </div>

        {/* Related Date Ideas Section */}
        {dateIdea.relatedDateIdeas && dateIdea.relatedDateIdeas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dateIdea.relatedDateIdeas.map((relatedSlug, index) => (
                <RelatedDateIdea key={index} slug={relatedSlug} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic section to display other date ideas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Explore Other Date Ideas</h2>
          {renderOtherDateIdeas()}
        </div>

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
      <Footer />
    </div>
  );
}