"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../../utils/supabaseClient';
import { getImageUrl } from '../../utils/imageService';
import SaveButton from '../SaveButton';

gsap.registerPlugin(ScrollTrigger);

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug: string;
  description: string;
  featured?: boolean;
}

const FeaturedIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const [featuredIdeas, setFeaturedIdeas] = useState<DateIdea[]>([]);
  const [featuredImages, setFeaturedImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [visibleIdeas, setVisibleIdeas] = useState(4);
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  // Fetch featured date ideas from Supabase
  useEffect(() => {
    const fetchFeaturedIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('date_ideas')
          .select('*')
          .eq('trending', true)
          .limit(20);

        if (error) {
          console.error("Error fetching featured date ideas:", error);
        } else {
          // Randomize the ideas
          const randomizedData = data ? [...data].sort(() => Math.random() - 0.5) : [];
          setFeaturedIdeas(randomizedData);
          
          // Fetch images for the featured ideas
          if (randomizedData && randomizedData.length > 0) {
            const imagePromises = randomizedData.map(async (idea) => {
              const imageUrl = await getImageUrl(
                idea.image,
                `${idea.title} ${idea.category}`,
                400,
                300
              );
              return { [idea.slug]: imageUrl };
            });

            const imageResults = await Promise.all(imagePromises);
            const imageMap = Object.assign({}, ...imageResults);
            setFeaturedImages(imageMap);
          }
        }
      } catch (error) {
        console.error("Error fetching featured date ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedIdeas();
  }, []);

  const handleLoadMore = () => {
    setVisibleIdeas(prev => Math.min(prev + 4, featuredIdeas.length));
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={`animate-pulse rounded-2xl h-80 ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              />
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
            </select>
            <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredIdeas.slice(0, visibleIdeas).map((idea) => (
            <div
              key={idea.id}
              className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                theme === 'dark' 
                  ? 'bg-[#333333] border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={featuredImages[idea.slug] || idea.image || '/placeholder.jpg'}
                  alt={idea.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  <SaveButton itemSlug={idea.slug} item={idea} className="" />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className={`text-xl font-bold font-heading mb-2 group-hover:text-rose-400 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {idea.title}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {idea.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {featuredIdeas.length > visibleIdeas && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedIdeasSection;
