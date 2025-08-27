

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { Calendar, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getImageUrl } from '../../utils/imageService';
import CityPicker from '../CityPicker';

gsap.registerPlugin(ScrollTrigger);

interface CityEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date?: string;
  time?: string;
  price?: string;
  website?: string;
  image?: string;
  venue?: string;
  featured: boolean;
}

const FeaturedIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const [cityEvents, setCityEvents] = useState<CityEvent[]>([]);
  const [eventImages, setEventImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false); // Changed to false for instant loading
  const [visibleEvents, setVisibleEvents] = useState(8);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setLoading(true);
    setVisibleEvents(8);
    // Clear existing events and images when city changes
    setCityEvents([]);
    setEventImages({});
  };

  // Fetch city events from Perplexity API with instant loading
  useEffect(() => {
    const fetchCityEvents = async () => {
      try {
        const response = await fetch(`/api/perplexity-city-events?city=${encodeURIComponent(selectedCity)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCityEvents(data.events || []);
        
        // Fetch images for the events in background (non-blocking)
        if (data.events && data.events.length > 0) {
          // Load images asynchronously in background
          const loadImages = async () => {
            const imageMap: Record<string, string> = {};
            
            // Process images in parallel for better performance
            const imagePromises = data.events.map(async (event: CityEvent) => {
              try {
                // Use getImageUrl which will handle fallbacks properly
                const imageUrl = await getImageUrl(
                  event.image,
                  `${event.title} ${event.category} ${selectedCity}`,
                  400,
                  300
                );
                return { id: event.id, url: imageUrl };
              } catch (error) {
                console.warn(`Failed to load image for ${event.title}:`, error);
                // Return a default romantic date image instead of placeholder
                return { 
                  id: event.id, 
                  url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'
                };
              }
            });

            const results = await Promise.all(imagePromises);
            results.forEach(result => {
              imageMap[result.id] = result.url;
            });
            
            setEventImages(imageMap);
          };

          // Start loading images immediately
          loadImages();
        }
      } catch (error) {
        console.error("Error fetching city events:", error);
        setCityEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately on component mount and when city changes
    fetchCityEvents();
  }, [selectedCity]);

  const handleLoadMore = () => {
    setVisibleEvents(prev => Math.min(prev + 4, cityEvents.length));
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(titleRef.current, {
        opacity: 0,
        y: 50,
      });

      gsap.set(cardsRef.current?.children || [], {
        opacity: 0,
        y: 100,
        scale: 0.8,
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .to(cardsRef.current?.children || [], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.out(1.7)",
          }, "-=0.4");
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      id="date-ideas" 
      className={`py-20 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-16 gap-6">
          <h2 
            ref={titleRef}
            className={`text-4xl md:text-5xl font-bold font-heading ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            WHAT'S HAPPENING THIS WEEK IN
          </h2>
          
          <CityPicker
            selectedCity={selectedCity}
            onCityChange={handleCityChange}
            loading={loading}
          />
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? (
            // Skeletal loading state
            [...Array(8)].map((_, i) => (
              <div 
                key={`skeleton-${i}`}
                className={`rounded-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                } animate-pulse`}
              >
                <div className={`h-48 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <div className="p-6 space-y-3">
                  <div className={`h-6 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} rounded w-3/4`} />
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/2`} />
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} rounded w-1/3`} />
                </div>
              </div>
            ))
          ) : (
            cityEvents.slice(0, visibleEvents).map((event) => (
            <div
              key={event.id}
              className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-rose-400 ${
                event.website ? 'cursor-pointer' : 'cursor-default'
              } ${
                theme === 'dark' 
                  ? 'bg-[#333333] border-gray-700 hover:border-rose-400' 
                  : 'bg-white border-gray-200 hover:border-rose-400'
              }`}
              onClick={() => event.website && window.open(event.website, '_blank')}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={eventImages[event.id] || `https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop`}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    // If image fails to load, use a generic romantic date image
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                  }}
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    theme === 'dark' 
                      ? 'bg-rose-500/90 text-white' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {event.category}
                  </span>
                </div>
                {/* External link indicator - only show if website exists */}
                {event.website && (
                  <div className="absolute top-4 right-4 opacity-70 group-hover:opacity-100 transition-opacity">
                    <div className={`p-2 rounded-full ${
                      theme === 'dark' ? 'bg-black/50' : 'bg-white/50'
                    } backdrop-blur-sm`}>
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className={`text-xl font-bold font-heading mb-3 group-hover:text-rose-400 transition-colors line-clamp-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {String(event.title || '')}
                </h3>
                
                {/* Only show date information */}
                {(event.date || event.time) && (
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {String(event.date || '')} {String(event.time || '')}
                    </span>
                  </div>
                )}
                
                {/* Click to visit indicator - only show if website exists */}
                {event.website ? (
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
                    } group-hover:underline`}>
                      Click to visit →
                    </span>
                    <ExternalLink className={`w-4 h-4 ${
                      theme === 'dark' ? 'text-rose-400' : 'text-rose-600'
                    } group-hover:translate-x-1 transition-transform`} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Event information
                    </span>
                  </div>
                )}
              </div>
            </div>
            ))
          )}
        </div>

        {!loading && cityEvents.length > visibleEvents && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Load More Events
            </button>
          </div>
        )}

        {cityEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              No events found for {selectedCity}. Try selecting a different city.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedIdeasSection;
