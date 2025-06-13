"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { ChevronDown, Calendar, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { getImageUrl } from '../../utils/imageService';

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
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState(8);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
    setLoading(true);
    setVisibleEvents(8);
  };

  // Fetch city events from Perplexity API
  useEffect(() => {
    const fetchCityEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/perplexity-city-events?city=${encodeURIComponent(selectedCity)}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setCityEvents(data.events || []);
        
        // Fetch images for the events
        if (data.events && data.events.length > 0) {
          const imagePromises = data.events.map(async (event: CityEvent) => {
            const imageUrl = await getImageUrl(
              event.image,
              `${event.title} ${event.category} ${selectedCity}`,
              400,
              300
            );
            return { [event.id]: imageUrl };
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.assign({}, ...imageResults);
          setEventImages(imageMap);
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

  if (loading) {
    return (
      <section className={`py-20 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-6">
          <div className="mb-16">
            <div className={`h-12 w-3/4 rounded-lg animate-pulse ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className={`animate-pulse rounded-2xl overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <div className="h-48 bg-gray-300 dark:bg-gray-600" />
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-3/4" />
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24" />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20" />
                    <div className="h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }



  return (
    <section 
      ref={sectionRef} 
      id="date-ideas" 
      className={`py-20 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-6">
        <h2 
          ref={titleRef}
          className={`text-4xl md:text-5xl font-bold font-heading text-left mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          WHAT'S HAPPENING THIS WEEK IN{" "}
          <div className={`inline-flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <select 
              value={selectedCity}
              onChange={handleCityChange}
              className={`bg-transparent border-b-2 border-gray-400 focus:border-gray-600 outline-none text-4xl md:text-5xl font-bold cursor-pointer ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <option value="LISBON">LISBON</option>
              <option value="NEW YORK">NEW YORK</option>
              <option value="LONDON">LONDON</option>
              <option value="PARIS">PARIS</option>
              <option value="TOKYO">TOKYO</option>
              <option value="BARCELONA">BARCELONA</option>
              <option value="AMSTERDAM">AMSTERDAM</option>
              <option value="BERLIN">BERLIN</option>
              <option value="ROME">ROME</option>
              <option value="MADRID">MADRID</option>
            </select>
            <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cityEvents.slice(0, visibleEvents).map((event) => (
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
                  src={eventImages[event.id] || '/placeholder.jpg'}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
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
                  {event.title}
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
                      {event.date} {event.time}
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
          ))}
        </div>

        {cityEvents.length > visibleEvents && (
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
